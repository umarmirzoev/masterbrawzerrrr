-- Отзывы для товаров стартового каталога (id вида "fallback-..."),
-- которых нет в таблице shop_products, поэтому их нельзя писать в shop_product_reviews (там uuid + FK).
CREATE TABLE IF NOT EXISTS public.shop_catalog_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_key text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT NULL,
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_key, user_id)
);

CREATE INDEX IF NOT EXISTS shop_catalog_reviews_product_key_idx ON public.shop_catalog_reviews (product_key);

ALTER TABLE public.shop_catalog_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved catalog reviews" ON public.shop_catalog_reviews;
CREATE POLICY "Anyone can view approved catalog reviews"
ON public.shop_catalog_reviews FOR SELECT
USING (is_approved = true);

DROP POLICY IF EXISTS "Users can add own catalog review" ON public.shop_catalog_reviews;
CREATE POLICY "Users can add own catalog review"
ON public.shop_catalog_reviews FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own catalog review" ON public.shop_catalog_reviews;
CREATE POLICY "Users can update own catalog review"
ON public.shop_catalog_reviews FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own catalog review" ON public.shop_catalog_reviews;
CREATE POLICY "Users can delete own catalog review"
ON public.shop_catalog_reviews FOR DELETE TO authenticated
USING (auth.uid() = user_id);
