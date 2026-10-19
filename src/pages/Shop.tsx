import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Input } from "@/components/ui/input";
import { SUPPORT_WHATSAPP } from "@/lib/utils";
import { tx } from "@/lib/localizeNames";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart, Star, Phone, Zap, Droplets, Wrench,
  Package, ArrowRight, Percent, Shield, Truck,
  ChevronRight, Sparkles, Heart, Plus, CheckCircle2,
  Headset, Users, Award, Trophy, MessageCircle, Clock,
  CreditCard, RotateCcw, HelpCircle, Search, Tag, Scale, ArrowUp, Check, ClipboardList
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { SmartProductImage } from "@/components/shop/SmartProductImage";
import { FavoriteButton } from "@/components/favorites/FavoritesSection";
import { fallbackShopProducts } from "@/data/shopFallback";
import { withoutHiddenProducts } from "@/lib/hiddenProducts";
import { productName } from "@/lib/localizeNames";

export default function Shop() {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  
  // Custom Images from public/shop directory
  const heroImage = "/shop/hero.png";
  const specialistImage = "/shop/specialist.png";

  // Раньше здесь был захардкоженный список с id "1".."5" — из-за него корзина падала
  // с "invalid input syntax for type uuid". Берём настоящие товары, а если база
  // недоступна — локальный каталог, у которого id понимает и корзина, и избранное.
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);
  const goSearch = () => navigate(query.trim() ? `/shop/search?q=${encodeURIComponent(query.trim())}` : "/shop/search");
  const handleAdd = async (id: string) => {
    setAddedId(id);
    try { await addToCart(id); } finally { setTimeout(() => setAddedId((cur) => (cur === id ? null : cur)), 1400); }
  };

  // Сразу показываем локальный каталог, чтобы блок не был пустым, пока база отвечает.
  const [popularProducts, setPopularProducts] = useState<any[]>(() => pickTop(withoutHiddenProducts<any>(fallbackShopProducts as any[]) as any[]));

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      let data: any[] | null = null;
      let error: any = null;
      try {
        const res: any = await Promise.race([
          supabase.from("shop_products").select("*, shop_categories(name)").limit(500),
          new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
        ]);
        data = res?.data ?? null;
        error = res?.error ?? null;
      } catch (e) {
        error = e;
      }

      if (cancelled) return;
      if (error || !data || !data.length) return; // оставляем локальный каталог
      setPopularProducts(pickTop(withoutHiddenProducts<any>(data) as any[]));
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const quickLinks = [
    { to: "/shop/search", icon: Search, label: tx("Все товары", "All products", "Ҳама молҳо"), color: "from-emerald-500 to-teal-500" },
    { to: "/shop/promotions", icon: Percent, label: tx("Акции", "Deals", "Аксияҳо"), color: "from-rose-500 to-orange-500" },
    { to: "/shop/brands", icon: Tag, label: tx("Бренды", "Brands", "Брендҳо"), color: "from-violet-500 to-purple-500" },
    { to: "/shop/favorites", icon: Heart, label: tx("Избранное", "Favorites", "Интихобшуда"), color: "from-pink-500 to-rose-500" },
    { to: "/shop/compare", icon: Scale, label: tx("Сравнение", "Compare", "Муқоиса"), color: "from-blue-500 to-cyan-500" },
    { to: "/shop/orders", icon: ClipboardList, label: tx("Мои заказы", "My orders", "Фармоишҳои ман"), color: "from-amber-500 to-yellow-500" },
    { to: "/cart", icon: ShoppingCart, label: tx("Корзина", "Cart", "Сабад"), color: "from-emerald-600 to-green-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ScrollExtras />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 bg-slate-50/30 dark:bg-slate-800/30">
        <motion.div aria-hidden className="pointer-events-none absolute -top-20 left-10 h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl" animate={{ x: [0, 60, 0], y: [0, 30, 0] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div aria-hidden className="pointer-events-none absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" animate={{ x: [0, -50, 0], y: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} />
        <div className="container px-4 mx-auto max-w-[1600px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="group/hero relative overflow-hidden bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 min-h-[750px] flex flex-col lg:flex-row items-stretch"
          >
            {/* Left Content Column */}
            <div className="w-full lg:w-[65%] relative z-20 py-16 px-8 md:py-24 md:px-24 flex items-center">
              <div className="max-w-3xl">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, type: "spring" }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 mb-8 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                   <Clock className="w-3.5 h-3.5 animate-[spin_6s_linear_infinite]" />
                   <span className="text-[11px] font-black uppercase tracking-widest">{t("shopAboutBadge")}</span>
                </motion.div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-8 leading-tight">
                  {t("shopAboutTitle")} <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 bg-[length:200%_auto] bg-clip-text text-transparent animate-[shine_4s_linear_infinite]">Master.TJ</span>
                </h1>

                {/* Поиск по магазину */}
                <div className="group relative mb-10 max-w-xl">
                  <div className="absolute inset-0 rounded-2xl bg-emerald-500/15 opacity-0 blur-xl transition-opacity duration-300 group-focus-within:opacity-100" />
                  <div className="relative flex gap-2 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl transition-all duration-300 group-focus-within:border-emerald-300 group-hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                      <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && goSearch()}
                        placeholder={tx("Найти смеситель, розетку, кабель...", "Find a faucet, socket, cable...", "Ҷустуҷӯи смеситель, розетка, сим...")}
                        className="h-12 border-none pl-12 text-base shadow-none focus-visible:ring-0"
                      />
                    </div>
                    <Button onClick={goSearch} className="h-12 rounded-xl bg-emerald-500 px-6 font-bold text-white shadow-lg shadow-emerald-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-emerald-300 active:scale-95">
                      {tx("Найти", "Search", "Ёфтан")}
                    </Button>
                  </div>
                </div>

                <div className="space-y-6 mb-12 text-slate-500 dark:text-slate-400">
                  <p className="text-base md:text-lg leading-relaxed">
                    {t("shopAboutPara1")}
                  </p>
                  <p className="text-base md:text-lg leading-relaxed">
                    {t("shopAboutPara2")}
                  </p>
                  <p className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                    {t("shopAboutPara3")}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-8">
                  <ShopFeatureItem icon={<Shield />} title={t("shopFeatQuality")} desc={t("shopFeatQualityDesc")} />
                  <ShopFeatureItem icon={<Truck />} title={t("shopFeatDelivery")} desc={t("shopFeatDeliveryDesc")} />
                  <ShopFeatureItem icon={<Wrench />} title={t("shopFeatInstall")} desc={t("shopFeatInstallDesc")} />
                  <ShopFeatureItem icon={<CreditCard />} title={t("shopFeatPayment")} desc={t("shopFeatPaymentDesc")} />
                  <ShopFeatureItem icon={<RotateCcw />} title={t("shopFeatReturn")} desc={t("shopFeatReturnDesc")} />
                  <ShopFeatureItem icon={<Headset />} title={t("shopFeatSupport")} desc={t("shopFeatSupportDesc")} />
                </div>
              </div>
            </div>

            {/* Right Photo Column */}
            <div className="w-full lg:w-[35%] relative min-h-[400px] lg:min-h-full overflow-hidden">
               <img 
                 src={heroImage} 
                 alt="Workshop" 
                 className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1500ms] group-hover/hero:scale-105"
               />
               {/* Mask for smooth transition */}
               <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-slate-900 via-white/5 dark:via-slate-900/5 to-transparent z-10" />
               
               {/* Rating Badge - Absolute inside the photo column but fixed to bottom right */}
               <div className="absolute bottom-10 right-10 z-30 hidden xl:block scale-90 origin-bottom-right">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/50 w-[400px] transition-shadow duration-300 hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.25)]"
                  >
                    <div className="flex items-center justify-between mb-5">
                       <div className="space-y-1">
                         <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{t("shopTrustLine1")}</p>
                         <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{t("shopTrustLine2")}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-2xl font-black text-slate-900 dark:text-white">4.8</p>
                       </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 + i * 0.08, type: "spring", stiffness: 300 }}>
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              </motion.span>
                            ))}
                          </div>
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 ml-1">{t("shopTrustReviewsCount")}</span>
                       </div>
                       <div className="flex -space-x-2">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-sm">
                              <img src={`https://i.pravatar.cc/100?u=user${i}`} alt="user" />
                            </div>
                          ))}
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-white dark:bg-slate-900 flex items-center justify-center shadow-lg">
                            <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          </div>
                       </div>
                    </div>
                  </motion.div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Быстрые разделы магазина */}
      <section className="py-8 bg-white dark:bg-slate-900">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:grid lg:grid-cols-7 lg:overflow-visible">
            {quickLinks.map((l, i) => (
              <motion.div key={l.to} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ y: -6 }} whileTap={{ scale: 0.95 }} className="shrink-0">
                <Link to={l.to} className="group flex w-28 flex-col items-center gap-2 rounded-3xl border border-slate-100 bg-white p-4 text-center shadow-sm transition-shadow duration-300 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/60 dark:border-slate-800 dark:bg-slate-900 lg:w-auto">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${l.color} text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-8deg]`}>
                    <l.icon className="h-6 w-6" />
                  </span>
                  <span className="text-xs font-bold text-slate-700 transition-colors group-hover:text-emerald-600 dark:text-slate-200">{l.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }}>
              <StatItem icon={<Users className="w-8 h-8 text-emerald-500" />} value="1000+" label={t("shopStatClients")} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <StatItem icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />} value="5000+" label={t("shopStatOrders")} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <StatItem icon={<Award className="w-8 h-8 text-emerald-500" />} value="50+" label={t("shopStatBrands")} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              <StatItem icon={<Trophy className="w-8 h-8 text-emerald-500" />} value="98%" label={t("shopStatReviews")} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              {t("shopPopularProductsTitle")}
            </h2>
            <Link to="/shop/search" className="group text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-2">
              {t("shopViewAllProducts")} <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
            {popularProducts.map((p, i) => {
              const discount = p.old_price && p.old_price > p.price
                ? Math.round((1 - p.price / p.old_price) * 100)
                : 0;
              const isNew = !!p.created_at
                && Date.now() - new Date(p.created_at).getTime() < 1000 * 60 * 60 * 24 * 45;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 20 }}
                  whileHover={{ y: -8 }}
                  className="h-full"
                >
                  <Card className="group relative h-full border-slate-100 dark:border-slate-800 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100/60 transition-all duration-500 rounded-[2rem] overflow-hidden flex flex-col">
                    <Link to={`/shop/product/${p.id}`} className="relative aspect-square bg-slate-50 dark:bg-slate-800 p-6 flex items-center justify-center overflow-hidden">
                      <SmartProductImage
                        product={p}
                        alt={p.name}
                        className="max-w-full max-h-full object-contain group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700"
                      />
                      <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-4 whitespace-nowrap rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-emerald-600 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-slate-900/95">
                        {tx("Подробнее →", "Details →", "Муфассал →")}
                      </span>

                      <div className="absolute top-4 left-4 flex max-w-[80%] flex-wrap gap-1.5">
                        {discount > 0 && (
                          <Badge className="bg-red-500 text-white font-black text-[10px] px-3 py-1 rounded-full shadow-lg animate-pulse">
                            {t("shopBadgeDiscountN", { percent: discount })}
                          </Badge>
                        )}
                        {p.is_popular && discount === 0 && (
                          <Badge className="bg-purple-600 text-white font-black text-[10px] px-3 py-1 rounded-full shadow-lg">
                            {t("shopBadgeBestseller")}
                          </Badge>
                        )}
                        {isNew && discount === 0 && !p.is_popular && (
                          <Badge className="bg-orange-500 text-white font-black text-[10px] px-3 py-1 rounded-full shadow-lg">
                            {t("shopBadgeNew")}
                          </Badge>
                        )}
                      </div>
                    </Link>

                    <CardContent className="p-3 sm:p-5 flex flex-col flex-1">
                      <Link to={`/shop/product/${p.id}`}>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-snug h-10 transition-colors duration-300 group-hover:text-emerald-600">
                          {productName(p.name)}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-1 mb-4">
                         <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                         <span className="text-[11px] font-bold text-slate-900 dark:text-white">{p.rating}</span>
                         <span className="text-[11px] text-slate-400 dark:text-slate-500">({p.reviews_count || 0})</span>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-1.5">
                        <div className="min-w-0">
                          <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">{p.price} {t("currencySomoni")}</p>
                          {p.old_price && <p className="text-[11px] text-slate-400 dark:text-slate-500 line-through truncate">{p.old_price} {t("currencySomoni")}</p>}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <FavoriteButton itemType="product" itemId={p.id} size="sm" />
                          <Button
                            size="icon"
                            aria-label={tx("В корзину", "Add to cart", "Ба сабад")}
                            className={`h-7 w-7 sm:h-9 sm:w-9 rounded-full text-white shadow-lg shrink-0 transition-all duration-300 hover:scale-110 hover:rotate-6 active:scale-90 ${addedId === p.id ? "bg-teal-500 shadow-teal-200" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100"}`}
                            onClick={() => handleAdd(p.id)}
                          >
                            <AnimatePresence mode="wait" initial={false}>
                              {addedId === p.id ? (
                                <motion.span key="ok" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}><Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></motion.span>
                              ) : (
                                <motion.span key="cart" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></motion.span>
                              )}
                            </AnimatePresence>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Row */}
      <section className="py-14 bg-emerald-50/30 border-y border-emerald-100/50">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }}>
              <BenefitSmallItem icon={<Truck />} text={t("shopBenefitDelivery")} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}>
              <BenefitSmallItem icon={<Shield />} text={t("shopBenefitWarranty")} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }}>
              <BenefitSmallItem icon={<CreditCard />} text={t("shopBenefitPayment")} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.24 }}>
              <BenefitSmallItem icon={<RotateCcw />} text={t("shopBenefitReturn")} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.32 }}>
              <BenefitSmallItem icon={<Wrench />} text={t("shopBenefitInstall")} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Consultation Banner */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container px-4 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#F1F5F9] dark:bg-slate-800/60 rounded-[3rem] p-8 md:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12"
          >
             <motion.div aria-hidden className="pointer-events-none absolute top-0 right-0 w-1/3 h-full bg-emerald-500/10 blur-3xl rounded-full" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
             
             <motion.div
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="w-full lg:w-1/3 flex justify-center lg:justify-start"
             >
               <div className="group relative">
                 <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                 <img src={specialistImage} alt="Specialist" className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-full border-8 border-white shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105" />
                 <div className="absolute bottom-4 right-4 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-xl z-20 transition-all duration-300 group-hover:bg-emerald-500 group-hover:scale-110 group-hover:rotate-12">
                   <Wrench className="w-8 h-8 text-emerald-500 transition-colors duration-300 group-hover:text-white" />
                 </div>
               </div>
             </motion.div>

             <motion.div
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               className="flex-1 z-10"
             >
               <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6">{t("shopConsultTitle")}</h2>
               <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-xl">{t("shopConsultDesc")}</p>

               <div className="space-y-4 mb-10">
                 <CheckPoint text={t("shopCheckPoint1")} />
                 <CheckPoint text={t("shopCheckPoint2")} />
                 <CheckPoint text={t("shopCheckPoint3")} />
               </div>
               
               <div className="flex flex-col sm:flex-row items-center gap-8">
                 <a href="tel:+992979117007" className="group flex items-center gap-4 text-slate-900 dark:text-white hover-soft rounded-2xl">
                    <div className="relative w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                      <span className="absolute inset-0 rounded-2xl bg-emerald-400/60 animate-ping" />
                      <Phone className="relative w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-black">+992 979 117 007</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{t("shopWorkHours")}</p>
                    </div>
                 </a>

                 <Button asChild className="group/wa relative overflow-hidden bg-[#10B981] hover:bg-[#059669] text-white font-black rounded-2xl px-10 h-16 flex items-center gap-3 shadow-xl shadow-emerald-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-300 active:scale-95">
                   <a href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent("Здравствуйте! Нужна консультация по товарам магазина Master.TJ")}`} target="_blank" rel="noopener noreferrer">
                     <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/wa:translate-x-full" />
                     <MessageCircle className="relative w-6 h-6 transition-transform duration-300 group-hover/wa:-rotate-12 group-hover/wa:scale-110" /> <span className="relative">{t("shopWhatsAppButton")}</span>
                   </a>
                 </Button>
               </div>
             </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Топ-5 товаров: сначала популярные, потом по рейтингу.
function pickTop(list: any[]) {
  return [...list]
    .sort((a, b) => (b.is_popular ? 1 : 0) - (a.is_popular ? 1 : 0) || (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);
}

function ScrollExtras() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25, restDelta: 0.001 });
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <>
      <motion.div style={{ scaleX }} className="fixed left-0 right-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />
      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            aria-label="Наверх"
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            whileHover={{ scale: 1.1, y: -3 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-300/50"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

function ShopFeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group flex gap-3 cursor-default transition-transform duration-300 hover:translate-x-1">
      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg group-hover:shadow-emerald-200">
        {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 leading-tight">{title}</h4>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal max-w-[150px]">{desc}</p>
      </div>
    </div>
  );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="group flex items-center gap-3 sm:gap-5 min-w-0 cursor-default">
      <div className="w-16 h-16 rounded-[1.25rem] bg-emerald-50 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-emerald-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-lg group-hover:shadow-emerald-200">
        {React.cloneElement(icon as React.ReactElement, { className: "w-8 h-8 text-emerald-500 transition-colors duration-300 group-hover:text-white" })}
      </div>
      <div className="min-w-0">
        <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-2">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest leading-tight break-words">{label}</p>
      </div>
    </div>
  );
}

function BenefitSmallItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="group rounded-[1.75rem] border border-slate-200 dark:border-slate-700 bg-[#fbfcfb] dark:bg-slate-900 p-6 sm:p-7 text-center hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-100/60 hover:border-emerald-200 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300">
      <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition-all duration-500 group-hover:bg-emerald-500 group-hover:text-white group-hover:rotate-[360deg]">
        {React.cloneElement(icon as React.ReactElement, { className: "h-7 w-7" })}
      </div>
      <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-snug">{text}</p>
    </div>
  );
}

function CheckPoint({ text }: { text: string }) {
  return (
    <div className="group flex items-center gap-3 cursor-default transition-transform duration-300 hover:translate-x-1">
      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center transition-all duration-300 group-hover:bg-emerald-500 group-hover:scale-110">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 transition-colors duration-300 group-hover:text-white" />
      </div>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{text}</span>
    </div>
  );
}
