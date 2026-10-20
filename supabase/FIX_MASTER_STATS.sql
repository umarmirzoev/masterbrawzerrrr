-- Реалистичные цифры для мастеров: 5–10 заказов, отзывов не больше заказов, рейтинг 4.6–5.0.
-- Запустить один раз: Supabase → SQL Editor → вставить → Run.
UPDATE public.master_listings
SET completed_orders = 5 + floor(random() * 6)::int;

UPDATE public.master_listings
SET total_reviews  = greatest(3, completed_orders - floor(random() * 3)::int),
    average_rating = round((4.6 + random() * 0.4)::numeric, 1);

-- Проверка
SELECT full_name, completed_orders, total_reviews, average_rating
FROM public.master_listings
ORDER BY average_rating DESC;
