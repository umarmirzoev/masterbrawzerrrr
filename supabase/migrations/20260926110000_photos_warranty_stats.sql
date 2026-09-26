-- 1) Фото «до и после»  2) Приёмка работы и гарантия 30 дней  3) Живые цифры на главной

-- ── 1. Фото заказа ──────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-photos', 'order-photos', false)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.order_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('before', 'after')),
  path text NOT NULL,
  uploaded_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS order_photos_order_idx ON public.order_photos(order_id);
ALTER TABLE public.order_photos ENABLE ROW LEVEL SECURITY;

-- Видят: клиент заказа, мастер заказа, админы.
DROP POLICY IF EXISTS "Order participants view photos" ON public.order_photos;
CREATE POLICY "Order participants view photos" ON public.order_photos FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.client_id = auth.uid() OR o.master_id = auth.uid()))
  OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')
);
-- Добавляет: только мастер заказа.
DROP POLICY IF EXISTS "Master adds order photos" ON public.order_photos;
CREATE POLICY "Master adds order photos" ON public.order_photos FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.master_id = auth.uid()));
DROP POLICY IF EXISTS "Master deletes own order photos" ON public.order_photos;
CREATE POLICY "Master deletes own order photos" ON public.order_photos FOR DELETE TO authenticated
USING (uploaded_by = auth.uid());

-- Файлы в бакете лежат по пути <order_id>/<файл>.
DROP POLICY IF EXISTS "Master uploads order photo files" ON storage.objects;
CREATE POLICY "Master uploads order photo files" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'order-photos'
  AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id::text = split_part(name, '/', 1) AND o.master_id = auth.uid())
);
DROP POLICY IF EXISTS "Participants read order photo files" ON storage.objects;
CREATE POLICY "Participants read order photo files" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'order-photos'
  AND (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id::text = split_part(name, '/', 1) AND (o.client_id = auth.uid() OR o.master_id = auth.uid()))
    OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')
  )
);

-- ── 2. Приёмка работы и гарантия ────────────────────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS client_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS warranty_until timestamptz;

CREATE TABLE IF NOT EXISTS public.warranty_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  client_id uuid NOT NULL DEFAULT auth.uid(),
  message text NOT NULL CHECK (char_length(message) BETWEEN 5 AND 1000),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.warranty_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Client creates warranty claim" ON public.warranty_claims;
CREATE POLICY "Client creates warranty claim" ON public.warranty_claims FOR INSERT TO authenticated
WITH CHECK (
  client_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.client_id = auth.uid())
);
DROP POLICY IF EXISTS "Claim participants view" ON public.warranty_claims;
CREATE POLICY "Claim participants view" ON public.warranty_claims FOR SELECT TO authenticated
USING (
  client_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.master_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')
);
DROP POLICY IF EXISTS "Admins update claims" ON public.warranty_claims;
CREATE POLICY "Admins update claims" ON public.warranty_claims FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Клиент принимает выполненную работу → включается гарантия на 30 дней.
CREATE OR REPLACE FUNCTION public.accept_order_work(p_order_id uuid)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_until timestamptz;
BEGIN
  UPDATE public.orders
     SET client_accepted_at = coalesce(client_accepted_at, now()),
         warranty_until = coalesce(warranty_until, now() + interval '30 days')
   WHERE id = p_order_id
     AND client_id = auth.uid()
     AND status IN ('completed', 'reviewed')
  RETURNING warranty_until INTO v_until;
  RETURN v_until;
END;
$$;
REVOKE ALL ON FUNCTION public.accept_order_work(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.accept_order_work(uuid) TO authenticated;

-- ── 3. Живые цифры (доступны всем, без личных данных) ─────────────────────
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'completed_today', (SELECT count(*) FROM public.orders
                         WHERE status IN ('completed', 'reviewed')
                           AND completed_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Dushanbe') AT TIME ZONE 'Asia/Dushanbe'),
    'completed_total', (SELECT count(*) FROM public.orders WHERE status IN ('completed', 'reviewed')),
    'masters_active',  (SELECT count(*) FROM public.master_listings WHERE is_active = true),
    'avg_rating',      (SELECT round(avg(average_rating)::numeric, 1) FROM public.master_listings WHERE is_active = true AND average_rating > 0)
  );
$$;
GRANT EXECUTE ON FUNCTION public.get_public_stats() TO anon, authenticated;
