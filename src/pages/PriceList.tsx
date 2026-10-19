import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import OrderModal from "@/components/OrderModal";
import { ServiceIllustration } from "@/components/services/ServiceIllustration";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SAMPLE_SERVICE_CATEGORIES, SAMPLE_SERVICES } from "@/data/seedData";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Search, ArrowRight, Wrench, Clock, Star, Zap, Droplets, Paintbrush, Sofa, Hammer,
  Camera, Flame, Home, Cpu, MoreHorizontal, Wind, ChevronRight, ChevronDown,
  Sparkles, Shield, TrendingUp, HelpCircle, DollarSign, MapPin, Ruler, 
  CheckCircle2, Headset, Users, Trophy, MessageCircle, Phone, 
  LayoutGrid, Settings, Brush, ArrowLeft, ArrowUp
} from "lucide-react";
import { tx } from "@/lib/localizeNames";

// Картинка в шапке категории и в баннере. Для сантехники — свои картинки, для остальных — иллюстрации категорий.
const CATEGORY_VISUALS: Array<[RegExp, { header?: string; banner: string; text?: [string, string, string, string, string, string]; sub?: [string, string, string]; accent?: "orange" | "violet" }]> = [
  [/сантех/i, { header: "/images/services/plumbing-header.png", banner: "/images/services/plumbing-banner.png" }],
  [/отделк/i, { header: "/images/services/finishing-header.png", banner: "/images/services/finishing-banner.png", text: ["Аккуратная отделка", "для вашего дома", "Neat finishing", "for your home", "Ороиши бодиққат", "барои хонаи шумо"] }],
  [/электр/i, { header: "/images/services/electric-header.png", banner: "/images/services/electric-banner.png", text: ["Безопасная электрика", "для дома", "Safe electrics", "for your home", "Барқи бехатар", "барои хона"] }],
  [/уборк|клининг/i, { banner: "/images/services/cleaning-banner.png", sub: ["Чистота дома и офиса", "Clean home and office", "Тозагии хона ва офис"], text: ["Чистый дом", "без лишних забот", "A clean home", "without the hassle", "Хонаи тоза", "бе ташвиши зиёдатӣ"] }],
  [/кондиц/i, { header: "/images/services/ac-header.png", banner: "/images/services/ac-banner.png", text: ["Прохлада и чистый", "воздух в вашем доме", "Cool and clean air", "in your home", "Салқинӣ ва ҳавои тоза", "дар хонаи шумо"] }],
  [/отоплен/i, { header: "/images/services/heating-header.png", banner: "/images/services/heating-banner.png", accent: "orange", text: ["Тепло и комфорт", "в вашем доме", "Warmth and comfort", "in your home", "Гармӣ ва бароҳатӣ", "дар хонаи шумо"] }],
  [/мебел|двер/i, { banner: "/images/services/furniture-banner.png", text: ["Соберём и установим", "мебель аккуратно", "We assemble and install", "furniture with care", "Мебелро бодиққат", "ҷамъ ва насб мекунем"] }],
  [/умн/i, { header: "/images/services/smarthome-header.png", banner: "/images/services/smarthome-banner.png", text: ["Сделаем дом умнее", "и безопаснее", "We make your home smarter", "and safer", "Хонаро оқилтар", "ва бехатартар мекунем"] }],
  [/видео/i, { banner: "/images/services/cctv-banner.png", text: ["Надёжная защита", "для дома и бизнеса", "Reliable protection", "for home and business", "Муҳофизати боэътимод", "барои хона ва тиҷорат"] }],
  [/пол|ламинат/i, { header: "/images/services/floors-header.png", banner: "/images/services/floors-banner.png", text: ["Красивый и ровный пол", "для вашего дома", "A beautiful, even floor", "for your home", "Фарши зебо ва ҳамвор", "барои хонаи шумо"] }],
  [/малярн/i, { header: "/images/services/painting-header.png", banner: "/images/services/painting-banner.png", text: ["Свежий цвет и", "аккуратная отделка", "Fresh colour and", "neat finishing", "Ранги тоза ва", "ороиши бодиққат"] }],
  [/отделк|малярн|ремонт/i, { header: "/images/categories/renovation.png", banner: "/images/categories/renovation.png" }],
  [/друг/i, { header: "/images/services/other-header.png", banner: "/images/services/other-banner.png", accent: "violet", sub: ["Помощь по дому", "Help around the house", "Кӯмак дар хона"], text: ["Поможем с любыми", "домашними задачами", "We help with any", "household task", "Дар ҳама корҳои", "хона кӯмак мекунем"] }],
  [/.*/, { header: "/images/categories/other.png", banner: "/images/categories/other.png" }],
];
// Цвета карточек: по умолчанию зелёные, для «Отопления» — тёплые оранжевые.
const CATEGORY_THEMES = {
  green: {
    tile: "bg-emerald-50 dark:bg-emerald-950/30",
    banner: "bg-emerald-50 dark:bg-emerald-950/30",
    bannerText: "text-teal-800 dark:text-teal-300",
    card: "border-emerald-100/70 hover:border-emerald-200",
    price: "text-emerald-600",
    button: "border-emerald-500 text-emerald-600 hover:bg-emerald-500",
  },
  violet: {
    tile: "bg-emerald-50 dark:bg-emerald-950/30",
    banner: "bg-gradient-to-r from-emerald-50 to-violet-100 dark:from-emerald-950/30 dark:to-violet-950/30",
    bannerText: "text-slate-900 dark:text-violet-100",
    card: "border-emerald-100/70 hover:border-emerald-200",
    price: "text-emerald-600",
    button: "border-emerald-500 text-emerald-600 hover:bg-emerald-500",
  },
  orange: {
    tile: "bg-orange-50 dark:bg-orange-950/30",
    banner: "bg-gradient-to-r from-orange-50 to-amber-100 dark:from-orange-950/30 dark:to-amber-950/20",
    bannerText: "text-slate-900 dark:text-orange-200",
    card: "border-orange-100 hover:border-orange-200",
    price: "text-orange-500",
    button: "border-orange-400 text-orange-500 hover:bg-orange-500",
  },
};
const pickCategoryTheme = (name: string) => {
  const accent = pickCategoryVisual(name)?.accent;
  if (accent === "orange") return CATEGORY_THEMES.orange;
  if (accent === "violet") return CATEGORY_THEMES.violet;
  return CATEGORY_THEMES.green;
};

const pickCategoryVisual = (name: string) => (name ? CATEGORY_VISUALS.find(([re]) => re.test(name))?.[1] : undefined);

const iconMap: Record<string, React.ElementType> = {
  "Электрика": Zap, "Сантехника": Droplets, "Отделка": LayoutGrid, "Мебель и двери": Sofa,
  "Умный дом": Cpu, "Водоснабжение": Droplets, "Уборка": Sparkles, "Кондиционеры": Wind,
  "Отопление": Flame, "Малярные работы": Brush, "Полы и ламинат": Hammer, "Другие услуги": MoreHorizontal,
  "Видеонаблюдение": Camera,
};

interface ServiceCategory {
  id: string;
  name_ru: string;
  name_tj: string;
  name_en: string;
  icon: string;
  color: string;
  sort_order: number;
}

interface Service {
  id: string;
  category_id: string;
  name_ru: string;
  name_tj: string;
  name_en: string;
  price_min: number;
  price_avg: number;
  price_max: number;
  unit: string;
  note: string | null;
  sort_order: number;
}

export default function PriceList() {
  // Временное стоковое изображение — замени на реальное фото.
  const heroImage = "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1000&h=800&fit=crop";
  const { language, t } = useLanguage();
  // Сразу показываем встроенный каталог, а данные из базы подменяют его, когда придут.
  const [categories, setCategories] = useState<ServiceCategory[]>(SAMPLE_SERVICE_CATEGORIES as ServiceCategory[]);
  const [services, setServices] = useState<Service[]>(SAMPLE_SERVICES as Service[]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (search.trim()) {
      navigate(`/masters?q=${encodeURIComponent(search.trim())}`);
    }
  };
  const [activeCategory, setActiveCategory] = useState<string | null>(SAMPLE_SERVICE_CATEGORIES[0]?.id || null);
  const [loading, setLoading] = useState(false);
  const [orderModal, setOrderModal] = useState<{ open: boolean; categoryId?: string; serviceId?: string; name?: string }>({ open: false });

  useEffect(() => {
    const load = async () => {
      try {
        // Если Supabase долго не отвечает, не крутим загрузку бесконечно: через 8 секунд показываем базовый прайс.
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("PriceList load timeout")), 8000),
        );
        const [catsRes, servicesRes] = await Promise.race([
          Promise.all([
            supabase.from("service_categories").select("*").order("sort_order"),
            supabase.from("services").select("*").order("sort_order"),
          ]),
          timeout,
        ]);

        // Подменяем встроенный каталог настоящим, только если база вернула данные.
        if (catsRes.data?.length && servicesRes.data?.length) {
          setCategories(catsRes.data);
          setServices(servicesRes.data);
          setActiveCategory((current) =>
            catsRes.data!.some((c: any) => c.id === current) ? current : catsRes.data![0].id,
          );
        }
      } catch (error) {
        console.warn("PriceList: Supabase недоступен, показываем встроенный каталог:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getName = (item: any) => {
    if (!item) return "";
    if (language === "tj") return item.name_tj || item.name_ru;
    if (language === "en") return item.name_en || item.name_ru;
    return item.name_ru;
  };

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const s of services) {
      if (!map.has(s.category_id)) map.set(s.category_id, []);
      map.get(s.category_id)!.push(s);
    }
    return map;
  }, [services]);

  const popularServicesData = [
    { name: t("priceListPopular1"), price: "200", icon: LayoutGrid, color: "bg-blue-500" },
    { name: t("priceListPopular2"), price: "150", icon: Settings, color: "bg-amber-500" },
    { name: t("priceListPopular3"), price: "120", icon: Sparkles, color: "bg-purple-500" },
    { name: t("priceListPopular4"), price: "150", icon: Droplets, color: "bg-emerald-500" },
    { name: t("priceListPopular5"), price: "150", icon: Zap, color: "bg-orange-500" },
    { name: t("priceListPopular6"), price: "100", icon: Clock, color: "bg-blue-700" },
  ];

  // Кнопка «Заказать» у популярных услуг раньше ничего не делала — открываем форму заказа
  // и по возможности подставляем подходящую категорию.
  const openPopularOrder = (name: string) => {
    const key = name.toLowerCase().split(/\s+/)[0].slice(0, 6);
    const match = categories.find((c) => getName(c).toLowerCase().includes(key));
    setOrderModal({ open: true, categoryId: match?.id, name });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-slate-400 dark:text-slate-500 font-medium animate-pulse">{t("priceListLoading")}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentCategory = categories.find(c => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ScrollExtras />

      {/* Hero Section */}
      <section className="relative bg-[#F0FDF4] dark:bg-emerald-950/20 pt-12 pb-20 overflow-hidden border-b border-green-100 dark:border-emerald-900/30">
        <motion.div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" animate={{ x: [0, 40, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div aria-hidden className="pointer-events-none absolute top-1/3 right-1/4 h-56 w-56 rounded-full bg-teal-300/25 blur-3xl" animate={{ x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div aria-hidden className="pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-lime-200/30 blur-3xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
        <div className="relative container px-4 mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-left z-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                  {t("priceListHeroTitle1")} <br /> {t("priceListHeroTitle2")} <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-[length:200%_auto] bg-clip-text text-transparent animate-[shine_4s_linear_infinite]">{t("priceListHeroCity")}</span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 max-w-xl font-medium">
                  {t("priceListHeroDesc")}
                </p>

                <Link to="/calculator" className="inline-flex items-center gap-2 -mt-6 mb-8 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 text-sm font-bold text-emerald-700 dark:text-emerald-300 hover:shadow-lg hover:shadow-emerald-200/60 hover:-translate-y-0.5 hover:border-emerald-400 transition-all duration-300">
                  🧮 Посчитать стоимость в калькуляторе →
                </Link>

                <div className="relative max-w-2xl group mb-10">
                  <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col sm:flex-row gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 transition-all duration-300 group-focus-within:border-emerald-300 group-focus-within:shadow-2xl group-focus-within:shadow-emerald-200/60 group-hover:shadow-2xl">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-emerald-500" />
                      <Input
                        placeholder={t("priceListSearchPlaceholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="pl-12 h-14 border-none shadow-none text-base focus-visible:ring-0"
                      />
                    </div>
                    <Button onClick={handleSearch} className="h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-emerald-300 active:scale-95">
                      {t("priceListSearchButton")}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <BenefitItem icon={<Clock className="w-5 h-5 text-emerald-500" />} title={t("priceListBenefit1Title")} sub={t("priceListBenefit1Sub")} />
                  <BenefitItem icon={<Users className="w-5 h-5 text-emerald-500" />} title={t("priceListBenefit2Title")} sub={t("priceListBenefit2Sub")} />
                  <BenefitItem icon={<Shield className="w-5 h-5 text-emerald-500" />} title={t("priceListBenefit3Title")} sub={t("priceListBenefit3Sub")} />
                  <BenefitItem icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} title={t("priceListBenefit4Title")} sub={t("priceListBenefit4Sub")} />
                </div>
              </motion.div>
            </div>

            <div className="hidden lg:block w-1/3">
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1, y: [0, -12, 0] }}
                transition={{ opacity: { duration: 0.6 }, scale: { duration: 0.6 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
              >
                <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl rounded-full" />
                <div className="group relative hover-glow overflow-hidden rounded-[2.5rem] border border-white bg-white dark:bg-slate-900 shadow-2xl">
                   <img src={heroImage} alt="Master" className="h-[420px] w-full object-cover object-[78%_center] transition-transform duration-700 group-hover:scale-105" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              {t("priceListPopularTitle")}
            </h2>
            <button
              type="button"
              onClick={() => document.getElementById("all-services")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-colors flex items-center gap-1"
            >
              {t("priceListViewAll")} <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularServicesData.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 220, damping: 20 }}
                whileHover={{ y: -8, rotate: i % 2 ? 1 : -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => openPopularOrder(s.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openPopularOrder(s.name);
                    }
                  }}
                  className="group relative h-full border-slate-100 dark:border-slate-800 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100/70 transition-all duration-300 rounded-3xl overflow-hidden cursor-pointer"
                >
                  <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-50/80 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <CardContent className="p-5 flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                      <s.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1 leading-tight">{s.name}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">{t("fromPrice")} {s.price} {t("currencySomoni")}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPopularOrder(s.name);
                      }}
                      className="h-8 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300"
                    >
                      {t("priceListOrderButton")}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Services with Sidebar */}
      <section id="all-services" className="scroll-mt-20 py-16 bg-background">
        <div className="container px-4 mx-auto max-w-7xl">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-10">{t("priceListAllCategoriesTitle")}</h2>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div id="categories-list" className="w-full lg:w-1/4 space-y-2 scroll-mt-24">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 shadow-sm border border-slate-100 dark:border-slate-800 sticky top-24">
                {categories.map((cat) => {
                  const Icon = iconMap[cat.name_ru] || Wrench;
                  const isActive = activeCategory === cat.id;
                  const count = groupedByCategory.get(cat.id)?.length || 0;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        if (typeof window !== "undefined" && window.innerWidth < 1024) {
                          setTimeout(() => document.getElementById("category-content")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                        }
                      }}
                      className={`relative w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 text-left group ${
                        isActive 
                        ? "text-white" 
                        : "hover:bg-emerald-50/70 dark:hover:bg-slate-800 hover:translate-x-1 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="price-cat-pill"
                          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-200/70"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <Icon className={`relative z-10 w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-emerald-500"}`} />
                      <span className="relative z-10 flex-1 font-bold text-sm">{getName(cat)}</span>
                      <span className={`relative z-10 text-[10px] font-bold ${isActive ? "text-emerald-50" : "text-slate-400 dark:text-slate-500"}`}>
                        {t("priceListMastersCount", { count })}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content */}
            <div id="category-content" className="flex-1 min-w-0 scroll-mt-24">
              <div className="sm:bg-white sm:dark:bg-slate-900 sm:rounded-[2rem] sm:p-6 md:p-8 sm:shadow-sm sm:border sm:border-slate-100 sm:dark:border-slate-800 sm:min-h-[400px]">
                <AnimatePresence mode="wait">
                {activeCategory && (
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    {/* Шапка категории */}
                    <button
                      type="button"
                      aria-label="К категориям"
                      onClick={() => document.getElementById("categories-list")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                      className="-ml-2 mb-2 flex h-10 w-10 items-center justify-center rounded-full text-emerald-600 transition-colors hover:bg-emerald-50 lg:hidden"
                    >
                      <ArrowLeft className="h-6 w-6" />
                    </button>
                    {(() => {
                      const visual = pickCategoryVisual(currentCategory?.name_ru || "");
                      const Icon = currentCategory ? (iconMap[currentCategory.name_ru] || Wrench) : Wrench;
                      return (
                        <>
                          <div className="mb-5 flex items-center gap-4">
                            <div className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${pickCategoryTheme(currentCategory?.name_ru || "").tile}`}>
                              {visual?.header ? (
                                <img src={visual.header} alt="" className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" />
                              ) : (
                                <Icon className="h-9 w-9 text-emerald-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">{getName(currentCategory)}</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400 sm:text-base">{visual?.sub ? tx(visual.sub[0], visual.sub[1], visual.sub[2]) : t("priceListCategoryDefaultDesc")}</p>
                            </div>
                          </div>

                          <div className={`mb-7 flex min-h-[110px] items-center justify-between gap-4 overflow-hidden rounded-3xl pl-5 pr-2 sm:pl-7 group/banner transition-shadow duration-300 hover:shadow-lg ${pickCategoryTheme(currentCategory?.name_ru || "").banner}`}>
                            <p className={`py-5 text-base font-bold leading-snug sm:text-2xl ${pickCategoryTheme(currentCategory?.name_ru || "").bannerText}`}>
                              {visual?.text ? tx(visual.text[0], visual.text[2], visual.text[4]) : tx("Надёжные мастера", "Reliable masters", "Устоҳои боэътимод")}
                              <br />
                              {visual?.text ? tx(visual.text[1], visual.text[3], visual.text[5]) : tx("для дома и бизнеса", "for home and business", "барои хона ва тиҷорат")}
                            </p>
                            {visual && <motion.img src={visual.banner} alt="" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="h-20 w-auto max-w-[48%] shrink-0 object-contain transition-transform duration-500 group-hover/banner:scale-105 sm:h-28" />}
                          </div>
                        </>
                      );
                    })()}

                    <h4 className="mb-4 text-2xl font-black text-slate-900 dark:text-white">{tx("Выберите услугу", "Choose a service", "Хизматро интихоб кунед")}</h4>

                    <div className="space-y-3">
                      {(groupedByCategory.get(activeCategory) || []).length === 0 && (
                        <div className="rounded-2xl border border-dashed border-emerald-200 p-8 text-center text-slate-500">
                          {tx("Услуги скоро появятся. Оставьте заявку — мастер подберёт решение.", "Services coming soon. Leave a request and a master will help.", "Хизматҳо ба зудӣ илова мешаванд. Дархост гузоред.")}
                          <div className="mt-4">
                            <Button onClick={() => setOrderModal({ open: true, categoryId: activeCategory })} className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">{t("priceListCtaButton")}</Button>
                          </div>
                        </div>
                      )}
                      {(groupedByCategory.get(activeCategory) || []).map((s, idx) => {
                        const Icon = currentCategory ? (iconMap[currentCategory.name_ru] || Wrench) : Wrench;
                        const theme = pickCategoryTheme(currentCategory?.name_ru || "");
                        return (
                          <motion.div
                            key={s.id}
                            role="button"
                            tabIndex={0}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx, 12) * 0.04, duration: 0.3 }}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setOrderModal({ open: true, serviceId: s.id, categoryId: s.category_id, name: getName(s) })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setOrderModal({ open: true, serviceId: s.id, categoryId: s.category_id, name: getName(s) });
                              }
                            }}
                            className={`group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border bg-white p-3 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-emerald-100/60 dark:border-slate-800 dark:bg-slate-900 sm:gap-4 ${theme.card}`}
                          >
                            <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-50/70 to-transparent transition-transform duration-700 group-hover:translate-x-full dark:via-emerald-500/10" />
                            <div className="relative shrink-0 transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2">
                              <ServiceIllustration
                                name={`${s.name_ru || ""} ${getName(s)}`}
                                fallbackIcon={<Icon className="h-9 w-9 text-slate-500" />}
                                className="h-20 w-20 sm:h-24 sm:w-24"
                              />
                            </div>
                            <div className="relative min-w-0 flex-1">
                              <h5 className="text-[15px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-emerald-700 dark:text-white sm:text-lg">{getName(s)}</h5>
                              <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{s.note || t("priceListServiceDefaultNote")}</p>
                              <p className={`mt-1 flex items-baseline gap-1 whitespace-nowrap ${theme.price}`}>
                                <span className="text-sm font-semibold">{t("fromPrice")}</span>
                                <span className="text-xl font-black sm:text-2xl">{s.price_min}</span>
                                <span className="text-sm font-semibold">{t("currencySomoni")}</span>
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOrderModal({ open: true, serviceId: s.id, categoryId: s.category_id, name: getName(s) });
                              }}
                              className={`group/btn relative inline-flex h-10 shrink-0 items-center justify-center rounded-xl border-2 bg-white px-4 text-sm font-bold transition-all duration-300 hover:scale-105 hover:text-white hover:shadow-lg active:scale-95 dark:bg-transparent sm:h-11 sm:px-5 ${theme.button}`}
                            >
                              {t("priceListChooseButton")}
                              <ArrowRight className="ml-1 hidden h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1 sm:inline" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
            <StatItem icon={<Users className="w-8 h-8 text-emerald-500" />} value="1000+" label={t("priceListStat1")} />
            <StatItem icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />} value="5000+" label={t("priceListStat2")} />
            <StatItem icon={<Star className="w-8 h-8 text-emerald-500" />} value="4.8" label={t("priceListStat3")} />
            <StatItem icon={<Trophy className="w-8 h-8 text-emerald-500" />} value="95%" label={t("priceListStat4")} />
          </div>
        </div>
      </section>

      {/* Info Sections */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* How it works */}
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8">{t("priceListHowItWorks")}</h3>
              <div className="space-y-8">
                <StepItem num="1" title={t("priceListStep1Title")} desc={t("priceListStep1Desc")} />
                <StepItem num="2" title={t("priceListStep2Title")} desc={t("priceListStep2Desc")} />
                <StepItem num="3" title={t("priceListStep3Title")} desc={t("priceListStep3Desc")} />
                <StepItem num="4" title={t("priceListStep4Title")} desc={t("priceListStep4Desc")} />
              </div>
            </div>

            {/* Price Formation */}
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8">{t("priceListPriceFormationTitle")}</h3>
              <div className="space-y-6">
                <PriceFactor icon={<LayoutGrid />} title={t("priceListFactor1Title")} desc={t("priceListFactor1Desc")} />
                <PriceFactor icon={<MapPin />} title={t("priceListFactor2Title")} desc={t("priceListFactor2Desc")} />
                <PriceFactor icon={<Clock />} title={t("priceListFactor3Title")} desc={t("priceListFactor3Desc")} />
                <PriceFactor icon={<Wrench />} title={t("priceListFactor4Title")} desc={t("priceListFactor4Desc")} />
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8">{t("priceListFaqTitle")}</h3>
              <Accordion type="single" collapsible className="space-y-3">
                {[
                  { q: t("priceListFaq1Q"), a: t("priceListFaq1A") },
                  { q: t("priceListFaq2Q"), a: t("priceListFaq2A") },
                  { q: t("priceListFaq3Q"), a: t("priceListFaq3A") },
                  { q: t("priceListFaq4Q"), a: t("priceListFaq4A") },
                  { q: t("priceListFaq5Q"), a: t("priceListFaq5A") },
                ].map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border rounded-2xl px-5 bg-slate-50/50 dark:bg-slate-800/50 border-transparent hover:border-emerald-200 hover:bg-white hover:shadow-md dark:hover:border-slate-700 transition-all duration-300">
                    <AccordionTrigger className="py-4 hover:no-underline font-bold text-slate-700 dark:text-slate-200 text-sm text-left leading-tight">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Link to="/faq" className="group inline-flex items-center mt-6 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                {t("priceListFaqViewAll")} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="pb-20 bg-white dark:bg-slate-900">
        <div className="container px-4 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-emerald-100"
          >
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/50 to-transparent pointer-events-none" />
            <motion.div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
            <motion.div aria-hidden className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/5" animate={{ scale: [1.1, 1, 1.1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-7">
              <div className="flex items-center gap-5 min-w-0">
                <div className="relative w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                  <span className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                  <Headset className="relative w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-white mb-1.5">{t("priceListCtaTitle")}</h3>
                  <p className="text-emerald-50/80 font-medium text-sm md:text-base">{t("priceListCtaDesc")}</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                <a
                  href="tel:+992979117007"
                  className="group flex items-center gap-3 text-white bg-white/10 rounded-[1.25rem] px-4 py-2.5 transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-black whitespace-nowrap">+992 979 117 007</p>
                    <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider whitespace-nowrap">{t("priceListCtaWhatsapp")}</p>
                  </div>
                </a>
                <Button
                  size="lg"
                  className="bg-white dark:bg-slate-900 text-emerald-600 hover:bg-emerald-50 font-black rounded-[1.25rem] px-8 h-16 shadow-xl hover:scale-105 hover:shadow-2xl active:scale-95 transition-all duration-300 whitespace-nowrap shrink-0"
                  onClick={() => setOrderModal({ open: true })}
                >
                  {t("priceListCtaButton")}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <OrderModal
        isOpen={orderModal.open}
        onClose={() => setOrderModal({ open: false })}
        category={null}
        categoryId={orderModal.categoryId}
        serviceId={orderModal.serviceId}
        initialServiceName={orderModal.name}
      />
    </div>
  );
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

function BenefitItem({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="group flex items-center gap-3 cursor-default">
      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:border-emerald-200 group-hover:shadow-md">{icon}</div>
      <div>
        <p className="text-xs font-black text-slate-900 dark:text-white leading-tight mb-0.5">{title}</p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">{sub}</p>
      </div>
    </motion.div>
  );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="group flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-slate-100 p-4 text-center dark:border-slate-800 sm:flex-row sm:gap-5 sm:border-0 sm:p-0 sm:text-left"
    >
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[1.25rem] bg-emerald-50 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-emerald-100 group-hover:shadow-lg group-hover:shadow-emerald-100">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none mb-1 sm:mb-2">{value}</p>
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium sm:uppercase sm:tracking-widest leading-tight">{label}</p>
      </div>
    </motion.div>
  );
}

function StepItem({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: (Number(num) - 1) * 0.08 }}
      className="group flex gap-4"
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-black flex items-center justify-center shrink-0 shadow-lg shadow-emerald-100 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
        {num}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 dark:text-white mb-1 transition-colors group-hover:text-emerald-600">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

function PriceFactor({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group flex gap-4 p-4 rounded-2xl hover:bg-emerald-50/50 hover:translate-x-1 hover:shadow-sm dark:hover:bg-slate-800 transition-all duration-300 border border-transparent hover:border-emerald-100 dark:hover:border-slate-800">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:-rotate-6">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
