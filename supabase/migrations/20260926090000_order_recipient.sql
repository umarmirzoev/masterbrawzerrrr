-- «Заказ для близкого человека»: получатель заказа (к кому едет мастер) и телефон заказчика.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS recipient_name text,
  ADD COLUMN IF NOT EXISTS recipient_phone text,
  ADD COLUMN IF NOT EXISTS recipient_relation text,
  ADD COLUMN IF NOT EXISTS orderer_phone text;

COMMENT ON COLUMN public.orders.recipient_name IS 'Имя человека, к которому приедет мастер (если заказ сделан для близкого)';
COMMENT ON COLUMN public.orders.recipient_phone IS 'Телефон получателя — мастер звонит ему';
COMMENT ON COLUMN public.orders.recipient_relation IS 'Кем приходится заказчику: мама, папа и т.д.';
COMMENT ON COLUMN public.orders.orderer_phone IS 'Телефон заказчика (например, из-за рубежа)';
