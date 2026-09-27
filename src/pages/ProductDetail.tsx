import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import RecommendedProducts from "@/components/shop/RecommendedProducts";
import CountdownTimer from "@/components/shop/CountdownTimer";
import { SmartProductImage } from "@/components/shop/SmartProductImage";
import { FavoriteButton } from "@/components/favorites/FavoritesSection";
import { useProductComparison } from "@/hooks/useProductComparison";
import { getProductGallery } from "@/utils/shopImages";
import { detectProductBrand } from "@/utils/shopCatalog";
import {
  fallbackShopProducts,
  getFallbackProductById,
  getFallbackProductsByCategoryId,
  isFallbackProductId,
} from "@/data/shopFallback";
import { motion } from "framer-motion";
import {
  ShoppingCart, Star, Package, Phone, Minus, Plus,
  CheckCircle, Wrench, Truck, User, Award, ArrowRight, MessageCircle, Heart, Scale, Building2,
  ChevronRight, ShieldCheck, Zap,
} from "lucide-react";
import { withoutHiddenProducts } from "@/lib/hiddenProducts";
import { personName, productName, tx, getActiveLanguage, shopCategoryName } from "@/lib/localizeNames";

// Товары стартового каталога (id "fallback-...") не лежат в shop_products,
// поэтому их отзывы хранятся в отдельной таблице с текстовым ключом.
const getReviewTarget = (productId: string) =>
  isFallbackProductId(productId)
    ? { table: "shop_catalog_reviews", column: "product_key" }
    : { table: "shop_product_reviews", column: "product_id" };

// Category cross-sell mapping: categoryId → array of related categoryIds
const CROSS_SELL_MAP: Record<string, string[]> = {
  // Сантехника → Смесители, Кабели
  "40c41a25-c164-40e7-9908-df63a9a41ead": ["0fcc06dc-67d5-4499-b3fd-dc4b9f1e8823", "ff22bf62-7641-4821-b86a-2c9ac3d9d306"],
  // Смесители → Сантехника, Инструменты
  "0fcc06dc-67d5-4499-b3fd-dc4b9f1e8823": ["40c41a25-c164-40e7-9908-df63a9a41ead", "89357170-58f1-4a2c-93b7-c4b13c5529ee"],
  // Видеонаблюдение → Камеры, Кабели
  "6eb6408d-af8a-4ec2-9dcb-8b0b177f9156": ["ece5830d-1ed7-40c0-9afd-8f6c10f8d0d1", "ff22bf62-7641-4821-b86a-2c9ac3d9d306"],
  // Камеры → Видеонаблюдение, Кабели
  "ece5830d-1ed7-40c0-9afd-8f6c10f8d0d1": ["6eb6408d-af8a-4ec2-9dcb-8b0b177f9156", "ff22bf62-7641-4821-b86a-2c9ac3d9d306"],
  // Электрика → Розетки, Кабели
  "04b26516-b7ee-4f50-b5b6-0882f32add7f": ["3f26ccc0-5b35-427a-b680-6b4479ed912e", "ff22bf62-7641-4821-b86a-2c9ac3d9d306"],
  // Розетки → Электрика, Кабели, Освещение
  "3f26ccc0-5b35-427a-b680-6b4479ed912e": ["04b26516-b7ee-4f50-b5b6-0882f32add7f", "ff22bf62-7641-4821-b86a-2c9ac3d9d306", "9e7a868a-1e17-4e6c-a8be-b61a2392f1cf"],
  // Кабели → Электрика, Розетки
  "ff22bf62-7641-4821-b86a-2c9ac3d9d306": ["04b26516-b7ee-4f50-b5b6-0882f32add7f", "3f26ccc0-5b35-427a-b680-6b4479ed912e"],
  // Освещение → Розетки, Электрика
  "9e7a868a-1e17-4e6c-a8be-b61a2392f1cf": ["3f26ccc0-5b35-427a-b680-6b4479ed912e", "04b26516-b7ee-4f50-b5b6-0882f32add7f"],
  // Замки → Инструменты
  "dea4f35d-eb00-4602-8cc0-d6023ca3cdb4": ["89357170-58f1-4a2c-93b7-c4b13c5529ee"],
  // Инструменты → Товары для ремонта
  "89357170-58f1-4a2c-93b7-c4b13c5529ee": ["f8b82bed-62a8-4120-b77c-93669c8cb67d"],
  // Товары для ремонта → Инструменты, Освещение
  "f8b82bed-62a8-4120-b77c-93669c8cb67d": ["89357170-58f1-4a2c-93b7-c4b13c5529ee", "9e7a868a-1e17-4e6c-a8be-b61a2392f1cf"],
  // Бытовая техника → Электрика, Кабели
  "2e2d0a5b-35e8-4c38-9631-2ee24df3150e": ["04b26516-b7ee-4f50-b5b6-0882f32add7f", "ff22bf62-7641-4821-b86a-2c9ac3d9d306"],
};

function ProductCard({ product, onAddToCart, t }: { product: any; onAddToCart: (id: string) => void; t: (k: string) => string }) {
  const canAddToCart = true;
  const stockCount = product.stock_qty ?? product.stock_quantity ?? product.quantity ?? (product.in_stock ? Math.max(3, ((product.reviews_count || 0) % 9) + 2) : 0);
  const quickLink = `https://wa.me/992979117007?text=${encodeURIComponent(`Здравствуйте! Интересует товар: ${product.name}`)}`;
  return (
    <Card className="hover:shadow-lg transition-all overflow-hidden border-border group shrink-0 w-[180px] sm:w-auto">
      <Link to={`/shop/product/${product.id}`}>
        <div className="aspect-square bg-muted/20 flex items-center justify-center overflow-hidden relative">
          <SmartProductImage product={product} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton itemType="product" itemId={product.id} size="sm" />
          </div>
          {product.promotion_label && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px]">{product.promotion_label}</Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-3 space-y-2">
        <Link to={`/shop/product/${product.id}`}>
          <h3 className="text-sm font-medium text-foreground hover:text-primary line-clamp-2 min-h-[2.5rem]">{productName(product.name)}</h3>
        </Link>
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs text-muted-foreground">{product.rating || "4.5"}</span>
        </div>
        <div className="flex items-end gap-1.5">
          <span className="text-lg font-bold text-foreground">{product.price}</span>
          <span className="text-xs text-muted-foreground mb-0.5">{t("currencySomoni")}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className={`font-medium ${product.in_stock ? "text-emerald-600" : "text-muted-foreground"}`}>
            {product.in_stock ? `В наличии: ${stockCount} шт.` : t("shopOutOfStock")}
          </span>
          {product.installation_price && <span className="text-primary font-medium">Установка</span>}
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" className="flex-1 rounded-full text-xs h-8 gap-1" disabled={!canAddToCart} onClick={(e) => { e.preventDefault(); onAddToCart(product.id); }}>
            <ShoppingCart className="w-3 h-3" /> {t("shopAddToCart")}
          </Button>
          <a href={quickLink} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" className="rounded-full text-xs h-8 px-2.5">
              <MessageCircle className="w-3 h-3" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

// Страница товара показывает подробную карточку продукта, продавца, допуслуги и рекомендации.
export default function ProductDetail() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [boughtTogether, setBoughtTogether] = useState<any[]>([]);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [withInstall, setWithInstall] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [quickBuyOpen, setQuickBuyOpen] = useState(false);
  const [quickBuyForm, setQuickBuyForm] = useState({ name: "", phone: "", comment: "" });
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [reviewProfiles, setReviewProfiles] = useState<Record<string, any>>({});
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const { addToCart } = useCart();
  const { toggleCompare, isComparing, compareIds, maxCompareItems } = useProductComparison();
  const { addProduct: addToRecentlyViewed } = useRecentlyViewed();
  const { profile, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Загружаем товар, продавца, похожие товары и кросс-селл-подборку.
    const load = async () => {
      setLoading(true);
      const fallbackProduct = getFallbackProductById(id);
      if (fallbackProduct) {
        setProduct(fallbackProduct);
        setActiveImage(0);
        setSeller(null);
        const fallbackRelated = withoutHiddenProducts(
          getFallbackProductsByCategoryId(fallbackProduct.category_id).filter((item) => item.id !== fallbackProduct.id)
        ).slice(0, 8);
        const relatedIds = new Set(fallbackRelated.map((item) => item.id));
        setRelated(fallbackRelated);
        setBoughtTogether(
          withoutHiddenProducts(fallbackShopProducts)
            .filter((item) => item.id !== fallbackProduct.id && !relatedIds.has(item.id))
            .slice(0, 8)
        );
        setLoading(false);
        addToRecentlyViewed({
          id: fallbackProduct.id,
          name: fallbackProduct.name,
          image_url: fallbackProduct.image_url,
          price: fallbackProduct.price,
          old_price: fallbackProduct.old_price,
          rating: fallbackProduct.rating,
        });
        return;
      }

      const { data } = await supabase
        .from("shop_products")
        .select("*, shop_categories(name)")
        .eq("id", id!)
        .single();
      setProduct(data);
      setActiveImage(0);

      if (data?.master_id) {
        const { data: masterData } = await supabase
          .from("master_listings")
          .select("*")
          .eq("user_id", data.master_id)
          .single();
        setSeller(masterData);
      } else {
        setSeller(null);
      }

      if (data?.category_id) {
        // Related: same category, different product, sorted by rating
        const { data: rel } = await supabase
          .from("shop_products")
          .select("*, shop_categories(name)")
          .eq("category_id", data.category_id)
          .neq("id", id!)
          .order("rating", { ascending: false })
          .limit(100);
        setRelated(withoutHiddenProducts(rel).slice(0, 8));

        // Frequently bought together: from cross-sell categories
        const crossCats = CROSS_SELL_MAP[data.category_id] || [];
        if (crossCats.length > 0) {
          const { data: cross } = await supabase
            .from("shop_products")
            .select("*, shop_categories(name)")
            .in("category_id", crossCats)
            .eq("in_stock", true)
            .order("is_popular", { ascending: false })
            .limit(100);
          setBoughtTogether(withoutHiddenProducts(cross).slice(0, 8));
        } else {
          setBoughtTogether([]);
        }
      }
      setLoading(false);

      // Track recently viewed
      if (data) {
        addToRecentlyViewed({
          id: data.id,
          name: data.name,
          image_url: data.image_url,
          price: data.price,
          old_price: data.old_price,
          rating: data.rating,
        });
      }
    };
    if (id) load();
  }, [id]);

  useEffect(() => {
    const loadReviews = async () => {
      if (!id) {
        setProductReviews([]);
        setReviewProfiles({});
        return;
      }

      const target = getReviewTarget(id);
      const { data, error } = await supabase
        .from(target.table as any)
        .select("*")
        .eq(target.column, id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) {
        setProductReviews([]);
        setReviewProfiles({});
        return;
      }

      const reviews = (data as any[]) || [];
      setProductReviews(reviews);

      const userIds = [...new Set(reviews.map((review) => review.user_id).filter(Boolean))];
      if (userIds.length === 0) {
        setReviewProfiles({});
        return;
      }

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const profileMap: Record<string, any> = {};
      (profilesData || []).forEach((item) => {
        profileMap[item.user_id] = item;
      });
      setReviewProfiles(profileMap);
    };

    void loadReviews();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 mx-auto py-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted animate-pulse rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded-lg w-3/4" />
              <div className="h-6 bg-muted animate-pulse rounded-lg w-1/2" />
              <div className="h-10 bg-muted animate-pulse rounded-lg w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 mx-auto py-16 text-center">
          <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">{t("shopProductNotFound")}</p>
          <Link to="/shop"><Button className="mt-4 rounded-full">{t("shopBackToShop")}</Button></Link>
        </div>
      </div>
    );
  }

  // У товаров стартового каталога доп. фото — случайные стоковые (дрель у рулетки и т.п.),
  // поэтому показываем только главное фото.
  const galleryImages = isFallbackProductId(product.id)
    ? getProductGallery(product).slice(0, 1)
    : getProductGallery(product);

  const discount = product.old_price ? Math.round((1 - product.price / product.old_price) * 100) : 0;
  const totalPrice = product.price * qty + (withInstall && product.installation_price ? product.installation_price : 0);
  const specs = typeof product.specs === "object" && product.specs !== null ? product.specs : {};
  const sourceText = `${product.name || ""} ${product.description || ""}`;
  const detectValue = (pattern: RegExp) => {
    const match = sourceText.match(pattern);
    return match?.[0] || "";
  };
  const materialMatch = detectValue(/латунь|сталь|алюминий|пластик|пвх|медь|керамика/i);
  const powerMatch = detectValue(/\d+\s?(вт|w|мп|btu|а|a)/i);
  const sizeMatch = detectValue(/\d+\s?(мм|см|м|дюйм|")/i);
  const brandMatch = detectProductBrand(product);
  const stockCount = product.stock_qty ?? product.stock_quantity ?? product.quantity ?? (product.in_stock ? Math.max(3, ((product.reviews_count || 0) % 9) + 2) : 0);
  // Понятный артикул вместо обрезанного id (раньше было "FALLBACK").
  const productSku = (() => {
    let hash = 0;
    for (const ch of String(product.id)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return `MT-${String(hash % 1000000).padStart(6, "0")}`;
  })();
  const compareActive = isComparing(product.id);
  const compareDisabled = !compareActive && compareIds.length >= maxCompareItems;
  const fallbackSpecs: Record<string, string> = { [tx("Артикул", "SKU", "Артикул")]: productSku };

  if (product.brand || brandMatch) fallbackSpecs[tx("Бренд", "Brand", "Бренд")] = product.brand || brandMatch;
  if (product.shop_categories?.name) fallbackSpecs[t("shopCategory")] = shopCategoryName(product.shop_categories.name);
  if (powerMatch) fallbackSpecs[tx("Мощность", "Power", "Қувва")] = powerMatch;
  if (sizeMatch) fallbackSpecs[tx("Размер", "Size", "Андоза")] = sizeMatch;
  if (materialMatch) fallbackSpecs[tx("Материал", "Material", "Мавод")] = materialMatch;
  if (stockCount) fallbackSpecs[tx("В наличии", "In stock", "Дар анбор")] = `${stockCount} ${tx("шт.", "pcs", "дона")}`;
  if (product.installation_price) fallbackSpecs[t("shopMasterInstall")] = `${product.installation_price} ${t("currencySomoni")}`;
  if (product.old_price) fallbackSpecs[t("shopOldPrice")] = `${product.old_price} ${t("currencySomoni")}`;
  if (product.rating) fallbackSpecs[t("shopRating")] = `${product.rating} / 5`;
  if (product.reviews_count) fallbackSpecs[tx("Отзывы", "Reviews", "Шарҳҳо")] = String(product.reviews_count);
  if (product.seller_type) fallbackSpecs[t("productFromMaster")] = product.seller_type === "master" ? t("yes") : t("no");

  const displaySpecs = Object.keys(specs).length > 0 ? specs : fallbackSpecs;
  const reviewCount = productReviews.length > 0 ? productReviews.length : Number(product.reviews_count) || 0;
  const avgRating = productReviews.length > 0
    ? productReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / productReviews.length
    : Number(product.rating) || 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map((score) => {
    if (reviewCount === 0) return { score, count: 0, percentage: 0 };
    const distance = Math.abs(score - avgRating);
    const weight = Math.max(1, 6 - Math.round(distance * 3));
    const raw = Math.round((reviewCount * weight) / 15);
    return { score, count: raw, percentage: 0 };
  });
  const normalizedTotal = ratingDistribution.reduce((sum, item) => sum + item.count, 0) || 1;
  const reviewBars = ratingDistribution.map((item, index) => {
    let count = item.count;
    if (index === ratingDistribution.length - 1) {
      count = Math.max(0, reviewCount - ratingDistribution.slice(0, -1).reduce((sum, row) => sum + row.count, 0));
    }
    return {
      score: item.score,
      count,
      percentage: reviewCount > 0 ? Math.max(4, Math.round((count / normalizedTotal) * 100)) : 0,
    };
  });
  const productHighlights = [
    {
      icon: CheckCircle,
      title: product.in_stock ? t("shopInStock") : t("shopOutOfStock"),
      text: product.in_stock ? `${t("shopTrustDeliveryDesc")}.` : t("shopNoResultsHint"),
    },
    {
      icon: Truck,
      title: t("shopDelivery"),
      text: t("shopTrustDeliveryDesc"),
    },
    {
      icon: Wrench,
      title: product.installation_price ? t("shopMasterInstall") : t("shopNeedHelp"),
      text: product.installation_price
        ? `${t("shopInstallFrom")} ${product.installation_price} ${t("currencySomoni")}`
        : t("shopFindMaster"),
    },
  ];

  // Быстрая покупка кладёт товар в корзину и переводит пользователя к оформлению.
  // Раньше здесь был ранний return для товаров без настоящего id в базе (fallback-*),
  // из-за которого кнопка "Купить сейчас" молча ничего не делала — теперь корзина
  // сама умеет работать с такими товарами (см. useCart.tsx), поэтому проверка не нужна.
  const handleBuyNow = async () => {
    await addToCart(product.id, withInstall);
    window.location.href = "/cart";
  };

  const handleQuickBuyOpen = () => {
    setQuickBuyForm({
      name: profile?.full_name || "",
      phone: profile?.phone || "",
      comment: `Хочу купить в 1 клик: ${product.name}${withInstall && product.installation_price ? " + установка" : ""}`,
    });
    setQuickBuyOpen(true);
  };

  const quickBuyWhatsAppLink = `https://wa.me/992979117007?text=${encodeURIComponent(
    `Купить в 1 клик\nТовар: ${product.name}\nКоличество: ${qty}\nУстановка: ${withInstall && product.installation_price ? "Да" : "Нет"}\nИмя: ${quickBuyForm.name || "—"}\nТелефон: ${quickBuyForm.phone || "—"}\nКомментарий: ${quickBuyForm.comment || "—"}`
  )}`;

  const handleSubmitReview = async () => {
    if (!user) {
      toast({ title: "Нужно войти в аккаунт", variant: "destructive" });
      return;
    }
    if (reviewForm.rating === 0) {
      toast({ title: "Поставьте оценку товару", variant: "destructive" });
      return;
    }
    // Demo mode restriction removed: we now allow adding fallback items to cart.

    setSubmittingReview(true);
    const target = getReviewTarget(product.id);
    const payload = {
      [target.column]: product.id,
      user_id: user.id,
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim() || null,
    };

    const table = target.table as any;
    const existingReview = productReviews.find((review) => review.user_id === user.id);
    const request = existingReview
      ? supabase.from(table).update(payload).eq("id", existingReview.id)
      : supabase.from(table).insert(payload);

    const { error } = await request;
    if (error) {
      const tableMissing = /does not exist|schema cache|PGRST205|42P01/i.test(`${error.message} ${(error as any).code || ""}`);
      toast({
        title: "Не удалось сохранить отзыв",
        description: tableMissing
          ? "Таблица отзывов ещё не создана в базе. Примените миграцию 20260927100000_shop_catalog_reviews.sql в Supabase."
          : error.message,
        variant: "destructive",
      });
      setSubmittingReview(false);
      return;
    }

    const { data: freshReviews } = await supabase
      .from(table)
      .select("*")
      .eq(target.column, product.id)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    setProductReviews((freshReviews as any[]) || []);
    if (user.id) {
      setReviewProfiles((prev) => ({
        ...prev,
        [user.id]: { user_id: user.id, full_name: profile?.full_name || "Вы", avatar_url: profile?.avatar_url || null },
      }));
    }
    setReviewForm({ rating: 0, comment: "" });
    toast({ title: existingReview ? "Отзыв обновлен" : "Отзыв добавлен" });
    setSubmittingReview(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-background">
      <Header />
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
          <Link to="/shop" className="rounded-full px-2 py-1 hover:bg-white hover:text-emerald-600">{t("navShop")}</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <Link to="/shop/search" className="rounded-full px-2 py-1 hover:bg-white hover:text-emerald-600">{shopCategoryName(product.shop_categories?.name || "Каталог")}</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="max-w-[220px] truncate px-2 py-1 font-medium text-slate-900 dark:text-white">{productName(product.name)}</span>
        </nav>

        <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          {/* Галерея */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3 lg:sticky lg:top-24">
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
              {galleryImages.length > 0 ? (
                <SmartProductImage
                  product={{ ...product, image_url: galleryImages[activeImage] || galleryImages[0], images: galleryImages }}
                  alt={product.name}
                  className="relative h-full w-full rounded-2xl object-contain transition-all duration-300"
                />
              ) : (
                <Package className="h-32 w-32 text-slate-200" />
              )}
              <div className="absolute left-5 top-5 flex flex-wrap gap-1.5">
                {discount > 0 && (
                  <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow">−{discount}%</span>
                )}
                {product.is_popular && (
                  <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950 shadow">{tx("Хит продаж", "Bestseller", "Хити фурӯш")}</span>
                )}
              </div>
              {product.seller_type === "master" && (
                <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                  <Award className="h-3 w-3" /> {t("shopFromMaster")}
                </span>
              )}
            </div>
            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 bg-white p-1 transition-all md:h-20 md:w-20 ${
                      activeImage === i ? "border-emerald-500 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <SmartProductImage
                      product={{ ...product, image_url: img, images: [img] }}
                      alt=""
                      className="h-full w-full rounded-xl object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Информация и покупка */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {shopCategoryName(product.shop_categories?.name || "Каталог")}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title="Сравнить"
                    onClick={() => toggleCompare(product.id)}
                    disabled={compareDisabled}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors disabled:opacity-40 ${
                      compareActive ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700"
                    }`}
                  >
                    <Scale className="h-4 w-4" />
                  </button>
                  <FavoriteButton itemType="product" itemId={product.id} size="default" />
                </div>
              </div>

              <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl">{productName(product.name)}</h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                    ))}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{product.rating || "—"}</span>
                  <span className="text-slate-400">· {product.reviews_count || 0} {tx("отзывов", "reviews", "шарҳ")}</span>
                </span>
                <span className="text-slate-400">{tx("Артикул", "SKU", "Артикул")}: <span className="font-semibold text-slate-600 dark:text-slate-300">{productSku}</span></span>
              </div>

              {/* Цена */}
              <div className="mt-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-5 dark:from-emerald-950/30 dark:to-teal-950/20">
                <div className="flex flex-wrap items-end gap-3">
                  <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                    {product.price} <span className="text-xl font-bold text-slate-500">{t("currencySomoni")}</span>
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="pb-1 text-lg text-slate-400 line-through">{product.old_price}</span>
                      <span className="mb-1 rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">
                        {tx("Экономия", "You save", "Сарфа")} {product.old_price - product.price} {t("currencySomoni")}
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
                  {product.in_stock ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-emerald-700 shadow-sm dark:bg-slate-900">
                      <CheckCircle className="h-3.5 w-3.5" /> {tx("В наличии", "In stock", "Дар анбор")}: {stockCount} {tx("шт.", "pcs", "дона")}
                    </span>
                  ) : (
                    <span className="rounded-full bg-white px-2.5 py-1 text-slate-500 shadow-sm dark:bg-slate-900">{t("shopOutOfStock")}</span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                    <Truck className="h-3.5 w-3.5" /> {tx("Доставка по Душанбе", "Delivery in Dushanbe", "Расонидан дар Душанбе")}
                  </span>
                  {product.promotion_label && (
                    <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 shadow-sm dark:bg-slate-900">{product.promotion_label}</span>
                  )}
                </div>
                {product.promotion_end && new Date(product.promotion_end) > new Date() && (
                  <div className="mt-3">
                    <CountdownTimer endDate={product.promotion_end} />
                  </div>
                )}
              </div>

              {product.installation_price && (
                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <Checkbox checked={withInstall} onCheckedChange={(v) => setWithInstall(!!v)} className="mt-1" />
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                      <Wrench className="h-4 w-4 text-emerald-600" /> {t("shopNeedInstall")}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {t("shopProfInstall")} — <span className="font-bold text-emerald-700">{product.installation_price} {t("currencySomoni")}</span>
                    </p>
                  </div>
                </label>
              )}

              {/* Количество и итог */}
              <div className="mt-5 flex items-center justify-between gap-4">
                <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
                  <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700" aria-label="Меньше">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-slate-900 dark:text-white">{qty}</span>
                  <button type="button" onClick={() => setQty(qty + 1)} className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700" aria-label="Больше">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">{t("shopTotal")}</p>
                  <p className="text-2xl font-black text-emerald-600">{totalPrice} {t("currencySomoni")}</p>
                </div>
              </div>

              {/* Кнопки */}
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => addToCart(product.id, withInstall)}
                  disabled={!product.in_stock}
                  className="inline-flex h-13 min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-base font-bold text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
                >
                  <ShoppingCart className="h-5 w-5" /> {t("shopAddToCart")}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!product.in_stock}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-base font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-900"
                >
                  {t("shopBuyNow")} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleQuickBuyOpen}
                className="mt-2.5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-200 text-sm font-bold text-emerald-700 transition-colors hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-900/50 dark:hover:bg-emerald-950/30"
              >
                <Zap className="h-4 w-4" /> {tx("Купить в 1 клик", "Buy in 1 click", "Харид бо 1 клик")}<span className="hidden sm:inline"> — {tx("перезвоним за 5 минут", "we call back in 5 minutes", "дар 5 дақиқа занг мезанем")}</span>
              </button>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <a href="tel:+992979117007" className="flex items-center justify-center gap-2 rounded-2xl bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200">
                  <Phone className="h-4 w-4 text-emerald-600" /> {tx("Позвонить", "Call", "Занг задан")}
                </a>
                <a
                  href={`https://wa.me/992979117007?text=${encodeURIComponent(`Здравствуйте! Хочу уточнить по товару: ${product.name} (${productSku})`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600" /> WhatsApp
                </a>
              </div>
            </div>

            {/* Преимущества */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { icon: Truck, title: tx("Доставка", "Delivery", "Расонидан"), text: tx("по Душанбе", "in Dushanbe", "дар Душанбе") },
                { icon: ShieldCheck, title: tx("Гарантия", "Warranty", "Кафолат"), text: tx("от магазина", "from the store", "аз мағоза") },
                { icon: Wrench, title: tx("Установка", "Installation", "Насб"), text: tx("мастером", "by a pro", "аз ҷониби усто") },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-100 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900 sm:p-4">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                    <item.icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.text}</p>
                </div>
              ))}
            </div>

            {seller && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-50">
                  {seller.avatar_url ? (
                    <img src={seller.avatar_url} alt={seller.full_name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-emerald-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{personName(seller.full_name)}</p>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{seller.average_rating || "—"}</span>
                    <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />{seller.completed_orders || 0} {t("sellerOrders")}</span>
                  </div>
                </div>
                <Link to={`/master-store/${seller.user_id}`}>
                  <Button size="sm" variant="outline" className="rounded-full text-xs">{t("navShop")}</Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Описание и характеристики */}
        <div className="mt-8 grid items-start gap-4 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-lg font-black text-slate-900 dark:text-white">{tx("Описание", "Description", "Тавсиф")}</h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {getActiveLanguage() === "ru" && product.description ? product.description : tx(`${product.description || `${product.name} — качественный товар для дома и ремонта.`}`, `${productName(product.name)} — quality product for home and renovation.`, `${productName(product.name)} — маҳсулоти босифат барои хона ва таъмир.`)}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-50 px-3 py-1.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {tx("Продавец", "Seller", "Фурӯшанда")}: <b>{product.seller_type === "master" ? tx("Мастер", "Master", "Усто") : tx("Магазин Master.TJ", "Master.TJ Store", "Мағозаи Master.TJ")}</b>
              </span>
              {brandMatch && (
                <span className="rounded-full bg-slate-50 px-3 py-1.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {tx("Бренд", "Brand", "Бренд")}: <b>{brandMatch}</b>
                </span>
              )}
            </div>
          </div>
          {Object.keys(displaySpecs).length > 0 && (
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-3 text-lg font-black text-slate-900 dark:text-white">{t("shopSpecs")}</h2>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {Object.entries(displaySpecs).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                    <span className="text-slate-500">{key}</span>
                    <span className="text-right font-semibold text-slate-900 dark:text-white">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                <div className="lg:w-72 shrink-0">
                  <p className="text-sm font-semibold text-foreground mb-2">Отзывы и рейтинг</p>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-bold text-foreground">{avgRating.toFixed(1)}</span>
                    <div className="pb-1">
                      <div className="flex items-center gap-0.5 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`} />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{reviewCount} {t("shopReviews")}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    {reviewCount > 0 ? "Рейтинг собран по текущим оценкам товара." : "Пока нет оценок. Отзывы появятся после первых заказов."}
                  </p>
                </div>

                <div className="flex-1 space-y-3">
                  {reviewBars.map((item) => (
                    <div key={item.score} className="flex items-center gap-3">
                      <span className="w-6 text-sm font-medium text-foreground">{item.score}</span>
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${item.percentage}%` }} />
                      </div>
                      <span className="w-10 text-xs text-right text-muted-foreground">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-foreground">Оставить отзыв</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setReviewForm((prev) => ({ ...prev, rating: score }))}
                        className="transition-transform hover:scale-110"
                      >
                        <Star className={`w-7 h-7 ${score <= reviewForm.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    rows={4}
                    placeholder={user ? "Что понравилось в товаре и установке?" : "Войдите, чтобы оставить отзыв"}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                    disabled={!user}
                  />
                  <Button onClick={handleSubmitReview} disabled={!user || submittingReview} className="rounded-full">
                    {submittingReview ? "Сохраняем..." : "Отправить отзыв"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-semibold text-foreground">Отзывы покупателей</p>
                  {productReviews.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">
                      Пока нет текстовых отзывов. Первый покупатель может оставить мнение о товаре здесь.
                    </div>
                  ) : (
                    productReviews.slice(0, 6).map((review) => {
                      const author = reviewProfiles[review.user_id];
                      const authorName = author?.full_name || "Покупатель";
                      return (
                        <div key={review.id} className="rounded-2xl border border-border p-4 bg-background">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold overflow-hidden">
                                {author?.avatar_url ? (
                                  <img src={author.avatar_url} alt={authorName} className="w-full h-full object-cover" />
                                ) : (
                                  <span>{authorName.slice(0, 1).toUpperCase()}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-foreground text-sm">{authorName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(review.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((score) => (
                                <Star key={score} className={`w-3.5 h-3.5 ${score <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`} />
                              ))}
                            </div>
                          </div>
                          {review.comment ? (
                            <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">Пользователь поставил оценку без текстового комментария.</p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Frequently Bought Together */}
        {boughtTogether.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">{t("shopBoughtTogether")}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t("shopBoughtTogetherDesc")}</p>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-2 md:grid-cols-4 sm:overflow-visible">
              {boughtTogether.map(p => (
                <ProductCard key={p.id} product={p} onAddToCart={(pid) => addToCart(pid, false)} t={t} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">{t("shopSimilar")}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t("shopSimilarDesc")}</p>
              </div>
              <Link to={`/shop/category/${product.category_id}`}>
                <Button variant="outline" size="sm" className="rounded-full gap-1">
                  {t("shopAllProducts")} <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-2 md:grid-cols-4 sm:overflow-visible">
              {related.map(p => (
                <ProductCard key={p.id} product={p} onAddToCart={(pid) => addToCart(pid, false)} t={t} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommended Products */}
        <RecommendedProducts excludeIds={id ? [id] : []} />

      </div>
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-40">
        <div className="rounded-3xl border border-border bg-background/95 backdrop-blur p-3 shadow-2xl">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-xs text-muted-foreground">{productName(product.name)}</p>
              <p className="text-lg font-bold text-foreground">{totalPrice} {t("currencySomoni")}</p>
            </div>
            <FavoriteButton itemType="product" itemId={product.id} size="default" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button className="rounded-full" onClick={() => addToCart(product.id, withInstall)} disabled={!product.in_stock}>
              {t("shopAddToCart")}
            </Button>
            <Button variant="outline" className="rounded-full" onClick={handleQuickBuyOpen}>
              Купить в 1 клик
            </Button>
          </div>
        </div>
      </div>
      <Dialog open={quickBuyOpen} onOpenChange={setQuickBuyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Купить в 1 клик</DialogTitle>
            <DialogDescription>
              Отправьте заявку в WhatsApp, и мы быстро свяжемся по товару {productName(product.name)}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-2xl bg-muted/40 p-4 text-sm">
              <p className="font-semibold text-foreground">{productName(product.name)}</p>
              <p className="text-muted-foreground mt-1">
                {qty} шт. • {product.price} {t("currencySomoni")} {withInstall && product.installation_price ? `• + установка ${product.installation_price} ${t("currencySomoni")}` : ""}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Имя</label>
              <Input value={quickBuyForm.name} onChange={(e) => setQuickBuyForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Телефон</label>
              <Input value={quickBuyForm.phone} onChange={(e) => setQuickBuyForm((prev) => ({ ...prev, phone: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Комментарий</label>
              <Textarea rows={3} value={quickBuyForm.comment} onChange={(e) => setQuickBuyForm((prev) => ({ ...prev, comment: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="rounded-full" onClick={() => setQuickBuyOpen(false)}>
                {t("cancel")}
              </Button>
              <a href={quickBuyWhatsAppLink} target="_blank" rel="noreferrer">
                <Button className="w-full rounded-full">
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
