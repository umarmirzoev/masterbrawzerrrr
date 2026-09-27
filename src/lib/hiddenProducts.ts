// В магазине показываем только эти товары из стартового каталога.
// Товары, которые добавили мастера (у них есть master_id), показываются как обычно.
// Фильтр работает сразу, даже если миграция в базе ещё не применена.
export const VISIBLE_CATALOG_PRODUCT_NAMES = new Set([
  "Болгарка",
  "Шуруповерт",
  "Лобзик",
  "Лазерный уровень",
  "Набор ключей",
  "Набор отверток",
  "Рулетка 5м",
  "Молоток",
]);

type ProductLike = { name?: string | null; master_id?: string | null } | null | undefined;

export const isHiddenProduct = (p: ProductLike) => {
  if (!p) return true;
  if (p.master_id) return false;
  return !VISIBLE_CATALOG_PRODUCT_NAMES.has(String(p.name ?? "").trim());
};

export function withoutHiddenProducts<T>(list: T[] | null | undefined): T[] {
  return (list ?? []).filter((p) => !isHiddenProduct(p as any));
}
