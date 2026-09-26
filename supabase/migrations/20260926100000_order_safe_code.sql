-- «Безопасный код»: 4 цифры, которые клиент (или его близкий) называет мастеру при встрече.
-- Код видит только заказчик. Мастер не может прочитать код — он может только проверить его
-- через функцию verify_order_safe_code. После 5 неверных попыток проверка блокируется.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS safe_code_verified_at timestamptz;

CREATE TABLE IF NOT EXISTS public.order_safe_codes (
  order_id uuid PRIMARY KEY REFERENCES public.orders(id) ON DELETE CASCADE,
  code text NOT NULL,
  failed_attempts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_safe_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Client reads own order safe code" ON public.order_safe_codes;
CREATE POLICY "Client reads own order safe code" ON public.order_safe_codes
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.client_id = auth.uid()));
-- Никаких INSERT/UPDATE/DELETE политик: писать в таблицу могут только функции ниже.

CREATE OR REPLACE FUNCTION public.generate_order_safe_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.order_safe_codes (order_id, code)
  VALUES (NEW.id, lpad((floor(random() * 10000))::int::text, 4, '0'))
  ON CONFLICT (order_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_order_safe_code ON public.orders;
CREATE TRIGGER trg_generate_order_safe_code
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_safe_code();

-- Коды для уже существующих активных заказов.
INSERT INTO public.order_safe_codes (order_id, code)
SELECT o.id, lpad((floor(random() * 10000))::int::text, 4, '0')
FROM public.orders o
WHERE o.status NOT IN ('completed', 'reviewed', 'cancelled')
ON CONFLICT (order_id) DO NOTHING;

-- Проверка кода мастером заказа (или админом). Возвращает: ok | wrong | locked | forbidden | not_found
CREATE OR REPLACE FUNCTION public.verify_order_safe_code(p_order_id uuid, p_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_master uuid;
  v_code record;
BEGIN
  SELECT master_id INTO v_master FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN RETURN 'not_found'; END IF;

  IF v_master IS DISTINCT FROM auth.uid()
     AND NOT public.has_role(auth.uid(), 'admin')
     AND NOT public.has_role(auth.uid(), 'super_admin') THEN
    RETURN 'forbidden';
  END IF;

  SELECT * INTO v_code FROM public.order_safe_codes WHERE order_id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RETURN 'not_found'; END IF;
  IF v_code.failed_attempts >= 5 THEN RETURN 'locked'; END IF;

  IF v_code.code = trim(p_code) THEN
    PERFORM set_config('app.safe_code_ok', '1', true);
    UPDATE public.orders SET safe_code_verified_at = now() WHERE id = p_order_id;
    RETURN 'ok';
  END IF;

  UPDATE public.order_safe_codes SET failed_attempts = failed_attempts + 1 WHERE order_id = p_order_id;
  RETURN CASE WHEN v_code.failed_attempts + 1 >= 5 THEN 'locked' ELSE 'wrong' END;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_order_safe_code(uuid, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.verify_order_safe_code(uuid, text) TO authenticated;

-- Защита: отметку «код подтверждён» нельзя поставить напрямую через API — только через verify_order_safe_code.
CREATE OR REPLACE FUNCTION public.protect_safe_code_verified()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.safe_code_verified_at := NULL;
    RETURN NEW;
  END IF;
  IF NEW.safe_code_verified_at IS DISTINCT FROM OLD.safe_code_verified_at
     AND coalesce(current_setting('app.safe_code_ok', true), '') <> '1' THEN
    NEW.safe_code_verified_at := OLD.safe_code_verified_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_safe_code_verified ON public.orders;
CREATE TRIGGER trg_protect_safe_code_verified
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.protect_safe_code_verified();
