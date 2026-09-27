import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { fallbackShopCategories, fallbackShopProducts, isFallbackProductId } from "@/data/shopFallback";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SmartProductImage } from "@/components/shop/SmartProductImage";
import { FavoriteButton } from "@/components/favorites/FavoritesSection";
import { useProductComparison } from "@/hooks/useProductComparison";
import { useCart } from "@/hooks/useCart";
import { ArrowLeft, ArrowUpDown, Package, PackageCheck, Percent, Phone, Scale, Search, ShieldCheck, ShoppingCart, Star, Truck, Wrench, X } from "lucide-react";
import { withoutHiddenProducts } from "@/lib/hiddenProducts";
import { productName, tx, shopCategoryName } from "@/lib/localizeNames";

export default function ShopSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [installOnly, setInstallOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const { addToCart } = useCart();
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toggleCompare, isComparing, compareIds, maxCompareItems } = useProductComparison();

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const [catsRes, productsRes] = await Promise.all([
        supabase.from("shop_categories").select("*").order("sort_order"),
        supabase.from("shop_products").select("*, shop_categories(name)").eq("is_approved", true).limit(300),
      ]);

      const loadedCategories = catsRes.data && catsRes.data.length > 0 ? catsRes.data : fallbackShopCategories;
      const loadedProducts = productsRes.data && productsRes.data.length > 0 ? productsRes.data : fallbackShopProducts;

      const visibleProducts = withoutHiddenProducts(loadedProducts as any[]);
      const usedCategoryIds = new Set(visibleProducts.map((product: any) => product.category_id));
      setCategories(loadedCategories.filter((category: any) => usedCategoryIds.has(category.id)));
      setProducts(visibleProducts);

      const prices = visibleProducts.map((product: any) => Number(product.price) || 0).filter((price: number) => price > 0);
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 1000;
      setPriceRange([0, maxPrice]);
      setLoading(false);
    };

    void load();
  }, []);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (query.trim()) next.set("q", query.trim());
    else next.delete("q");
    setSearchParams(next, { replace: true });
  }, [query, searchParams, setSearchParams]);

  const maxAvailablePrice = useMemo(() => {
    const prices = products.map((product) => Number(product.price) || 0).filter((price) => price > 0);
    return prices.length > 0 ? Math.max(...prices) : 1000;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const lowered = query.toLowerCase().trim();
    const normalized = [...products].filter((product) => {
      const name = `${product.name || ""} ${productName(product.name, "en")} ${productName(product.name, "tj")}`.toLowerCase();
      const description = String(product.description || "").toLowerCase();
      const category = String(product.shop_categories?.name || "").toLowerCase();
      const matchesQuery = !lowered || name.includes(lowered) || description.includes(lowered) || category.includes(lowered);
      const price = Number(product.price) || 0;

      if (!matchesQuery) return false;
      if (selectedCategory !== "all" && product.category_id !== selectedCategory) return false;
      if (inStockOnly && !product.in_stock) return false;
      if (discountOnly && !product.old_price) return false;
      if (installOnly && !product.installation_price) return false;
      if (price < priceRange[0] || price > priceRange[1]) return false;
      return true;
    });

    normalized.sort((a, b) => {
      if (sortBy === "price-asc") return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === "price-desc") return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sortBy === "new") return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      if (sortBy === "rating") return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      return ((Number(b.reviews_count) || 0) + (b.is_popular ? 15 : 0)) - ((Number(a.reviews_count) || 0) + (a.is_popular ? 15 : 0));
    });

    return normalized;
  }, [discountOnly, inStockOnly, installOnly, priceRange, products, query, selectedCategory, sortBy]);

  const resetFilters = () => {
    setSelectedCategory("all");
    setSortBy("popular");
    setInStockOnly(false);
    setDiscountOnly(false);
    setInstallOnly(false);
    setPriceRange([0, maxAvailablePrice]);
  };

  const hasActiveFilters =
    !!query.trim() || selectedCategory !== "all" || sortBy !== "popular" || inStockOnly || discountOnly || installOnly;

  const quickSearches = ["Болгарка", "Шуруповерт", "Молоток", "Лобзик", "Набор ключей"];

  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const chipClass = (active: boolean) =>
    `inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-all sm:h-10 sm:px-4 sm:text-sm ${
      active
        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700"
        : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-200"
    }`;

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-background">
      <Header />
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-8">
        {/* HERO + поиск */}
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 px-5 py-10 text-center text-white shadow-xl shadow-emerald-600/20 sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-teal-300/30 blur-3xl" />
          <div className="pointer-events-none absolute right-10 top-8 hidden h-20 w-20 rounded-3xl border border-white/20 rotate-12 lg:block" />
          <div className="pointer-events-none absolute bottom-10 left-12 hidden h-12 w-12 rounded-2xl border border-white/20 -rotate-12 lg:block" />

          <div className="relative mx-auto max-w-3xl">
            <Link to="/shop" className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur hover:bg-white/25">
              <ArrowLeft className="h-3.5 w-3.5" />
              {tx("В магазин", "To store", "Ба мағоза")}
            </Link>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{tx("Магазин инструментов", "Tool store", "Мағозаи асбобҳо")}</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-emerald-50/90 sm:text-base">
              {tx("Всё для дома и ремонта — с доставкой по Душанбе и установкой мастером", "Everything for home and renovation — delivery in Dushanbe and installation by a pro", "Ҳама барои хона ва таъмир — бо расонидан дар Душанбе ва насби усто")}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                scrollToResults();
              }}
              className="mx-auto mt-7 flex max-w-2xl items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-2xl shadow-emerald-900/25 ring-4 ring-white/20"
            >
              <Search className="h-5 w-5 shrink-0 text-emerald-600" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tx("Что ищете? Например, болгарка", "What are you looking for? e.g. angle grinder", "Чӣ меҷӯед? Масалан, болгарка")}
                className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:text-base"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Очистить поиск"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-bold text-white transition-colors hover:bg-emerald-700 sm:px-7"
              >
                <Search className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">{tx("Найти", "Search", "Ёфтан")}</span>
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-emerald-50/80">{tx("Часто ищут", "Popular", "Бештар меҷӯянд")}:</span>
              {quickSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setQuery(productName(item));
                    scrollToResults();
                  }}
                  className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-white hover:text-emerald-700"
                >
                  {productName(item)}
                </button>
              ))}
            </div>

            <div className="mt-7 grid grid-cols-3 gap-2 text-[11px] font-medium text-white/90 sm:mx-auto sm:max-w-xl sm:text-sm">
              <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-2">
                <Truck className="h-4 w-4" /> {tx("Доставка", "Delivery", "Расонидан")}
              </div>
              <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-2">
                <Wrench className="h-4 w-4" /> {tx("Установка", "Installation", "Насб")}
              </div>
              <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-2">
                <ShieldCheck className="h-4 w-4" /> {tx("Гарантия", "Warranty", "Кафолат")}
              </div>
            </div>
          </div>
        </section>

        {/* Панель фильтров */}
        <div ref={resultsRef} className="scroll-mt-24 pt-6">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center">
            <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-0.5 lg:flex-wrap lg:overflow-visible">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 w-auto shrink-0 gap-2 rounded-full border-0 bg-slate-100 px-4 text-xs font-semibold dark:bg-slate-800 sm:h-10 sm:text-sm">
                  <ArrowUpDown className="h-3.5 w-3.5 text-emerald-600" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">{tx("По популярности", "Most popular", "Маъмултарин")}</SelectItem>
                  <SelectItem value="price-asc">{tx("Сначала дешевле", "Price: low to high", "Аввал арзон")}</SelectItem>
                  <SelectItem value="price-desc">{tx("Сначала дороже", "Price: high to low", "Аввал гарон")}</SelectItem>
                  <SelectItem value="new">{tx("Новинки", "New", "Навҳо")}</SelectItem>
                  <SelectItem value="rating">{tx("По рейтингу", "Top rated", "Аз рӯи рейтинг")}</SelectItem>
                </SelectContent>
              </Select>

              {categories.length > 1 && (
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-9 w-auto shrink-0 gap-2 rounded-full border-0 bg-slate-100 px-4 text-xs font-semibold dark:bg-slate-800 sm:h-10 sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{tx("Все категории", "All categories", "Ҳама категорияҳо")}</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>{shopCategoryName(category.name)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <button type="button" className={chipClass(discountOnly)} onClick={() => setDiscountOnly(!discountOnly)}>
                <Percent className="h-3.5 w-3.5" />
                {tx("Со скидкой", "On sale", "Бо тахфиф")}
              </button>
              <button type="button" className={chipClass(installOnly)} onClick={() => setInstallOnly(!installOnly)}>
                <Wrench className="h-3.5 w-3.5" />
                {tx("С установкой", "With installation", "Бо насб")}
              </button>
              <button type="button" className={chipClass(inStockOnly)} onClick={() => setInStockOnly(!inStockOnly)}>
                <PackageCheck className="h-3.5 w-3.5" />
                {tx("В наличии", "In stock", "Дар анбор")}
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    resetFilters();
                  }}
                  className="inline-flex h-9 shrink-0 items-center gap-1 px-2 text-xs font-semibold text-slate-500 hover:text-red-500 sm:h-10 sm:text-sm"
                >
                  <X className="h-3.5 w-3.5" />
                  {tx("Сбросить", "Reset", "Тоза кардан")}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 px-1 lg:ml-auto lg:px-0">
              <span className="text-sm text-slate-500">
                {tx("Найдено", "Found", "Ёфт шуд")}: <span className="font-bold text-slate-900 dark:text-white">{filteredProducts.length}</span>
              </span>
              <Link to="/shop/compare" className={chipClass(compareIds.length > 0)}>
                <Scale className="h-3.5 w-3.5" />
                {tx("Сравнение", "Compare", "Муқоиса")} {compareIds.length}/4
              </Link>
            </div>
          </div>
        </div>

        {/* Товары */}
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-80 animate-pulse rounded-3xl bg-white" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <Package className="mx-auto mb-4 h-16 w-16 text-slate-300" />
              <p className="mb-1 text-lg font-bold text-foreground">{tx("Ничего не найдено", "Nothing found", "Чизе ёфт нашуд")}</p>
              <p className="mb-5 text-sm text-muted-foreground">{tx("Попробуйте изменить запрос или снять фильтры.", "Try another search or clear the filters.", "Дархостро иваз кунед ё филтрҳоро тоза кунед.")}</p>
              <Button
                className="rounded-full bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  setQuery("");
                  resetFilters();
                }}
              >
                {tx("Показать все товары", "Show all products", "Ҳамаи молҳо")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => {
                const compareActive = isComparing(product.id);
                const compareDisabled = !compareActive && compareIds.length >= maxCompareItems;
                const discount =
                  product.old_price && product.old_price > product.price
                    ? Math.round((1 - product.price / product.old_price) * 100)
                    : 0;
                const stockCount =
                  product.stock_qty ??
                  product.stock_quantity ??
                  product.quantity ??
                  (product.in_stock ? Math.max(3, ((product.reviews_count || 0) % 9) + 2) : 0);

                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col rounded-3xl border border-slate-100 bg-white p-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-900/5 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <Link
                      to={`/shop/product/${product.id}`}
                      className="relative block aspect-square overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800"
                    >
                      <SmartProductImage
                        product={product}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute left-2 top-2 flex max-w-[75%] flex-wrap gap-1">
                        {discount > 0 && (
                          <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">−{discount}%</span>
                        )}
                        {product.is_popular && (
                          <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950 shadow">{tx("Хит", "Hit", "Хит")}</span>
                        )}
                      </div>
                    </Link>
                    <div className="absolute right-3.5 top-3.5 z-10">
                      <FavoriteButton itemType="product" itemId={product.id} size="sm" />
                    </div>

                    <div className="flex flex-1 flex-col px-2 pb-2 pt-3 sm:px-2.5">
                      <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {product.rating || "—"}
                          <span className="font-normal text-slate-400">({product.reviews_count || 0})</span>
                        </span>
                        <span className={product.in_stock ? "font-medium text-emerald-600" : "text-slate-400"}>
                          {product.in_stock ? `${stockCount} ${tx("шт.", "pcs", "дона")}` : tx("Нет", "Out", "Нест")}
                        </span>
                      </div>
                      <Link to={`/shop/product/${product.id}`}>
                        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-slate-900 transition-colors hover:text-emerald-600 dark:text-white sm:text-[15px]">
                          {productName(product.name)}
                        </h3>
                      </Link>

                      <div className="mb-3 mt-2 flex items-baseline gap-2">
                        <span className="text-lg font-black text-slate-900 dark:text-white sm:text-2xl">{product.price}</span>
                        <span className="text-xs font-semibold text-slate-500">{tx("сом.", "TJS", "сом.")}</span>
                        {discount > 0 && (
                          <span className="text-xs text-slate-400 line-through">{product.old_price}</span>
                        )}
                      </div>

                      <div className="mt-auto flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => addToCart(product.id)}
                          disabled={!product.in_stock}
                          className="inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 sm:text-sm"
                        >
                          <ShoppingCart className="h-4 w-4 shrink-0" />
                          <span className="truncate">{tx("В корзину", "Add to cart", "Ба сабад")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCompare(product.id)}
                          disabled={compareDisabled}
                          aria-label="Сравнить"
                          title="Сравнить"
                          className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors disabled:opacity-40 sm:inline-flex ${
                            compareActive
                              ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700"
                          }`}
                        >
                          <Scale className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Консультация */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20 sm:flex-row sm:text-left">
          <div>
            <p className="text-base font-bold text-slate-900 dark:text-white">{tx("Не нашли нужный товар?", "Can't find what you need?", "Моли лозимро наёфтед?")}</p>
            <p className="text-sm text-slate-500">{tx("Позвоните — подскажем и привезём под заказ.", "Call us — we'll advise and bring it to order.", "Занг занед — маслиҳат медиҳем ва фармоишӣ меорем.")}</p>
          </div>
          <a
            href="tel:+992979117007"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-emerald-600 px-6 text-sm font-bold text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700"
          >
            <Phone className="h-4 w-4" />
            +992 979 117 007
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
