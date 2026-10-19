import { SUPPORT_PHONE, SUPPORT_WHATSAPP } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Search, Star, MapPin, Clock, Phone, MessageCircle,
  SlidersHorizontal, X, ChevronDown, Users, Award, Shield, Scale,
  CheckCircle2, Headset, Zap, Trophy, Sparkles, CalendarClock, ArrowUp, ArrowRight,
} from "lucide-react";
import MasterComparisonDialog, { CompareBar, useComparison } from "@/components/MasterComparison";
import OrderModal from "@/components/OrderModal";
import QuickBooking from "@/components/QuickBooking";
import AiMasterMatch from "@/components/AiMasterMatch";
import { SAMPLE_MASTERS } from "@/data/seedData";
import { personName, personInitials } from "@/lib/localizeNames";

interface MasterListing {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  bio: string;
  service_categories: string[];
  working_districts: string[];
  experience_years: number;
  average_rating: number;
  total_reviews: number;
  price_min: number;
  price_max: number;
  latitude: number | null;
  longitude: number | null;
  ranking_score: number;
  is_top_master: boolean;
  quality_flag: string;
  completed_orders: number;
}

const ALL_CATEGORIES = [
  "Электрика", "Сантехника", "Отделка", "Мебель и двери", "Умный дом",
  "Видеонаблюдение", "Сад и двор", "Сварочные работы", "Подвалы и гаражи",
  "Уборка", "Ремонт под ключ", "Аварийные 24/7", "Ремонт техники",
];

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  "Электрика": "mastersCatElectric",
  "Сантехника": "mastersCatPlumbing",
  "Отделка": "mastersCatRenovation",
  "Мебель и двери": "mastersCatFurniture",
  "Умный дом": "mastersCatSmartHome",
  "Видеонаблюдение": "mastersCatSecurity",
  "Сад и двор": "mastersCatGarden",
  "Сварочные работы": "mastersCatWelding",
  "Подвалы и гаражи": "mastersCatGarage",
  "Уборка": "mastersCatCleaning",
  "Ремонт под ключ": "mastersCatTurnkey",
  "Аварийные 24/7": "mastersCatEmergency",
  "Ремонт техники": "mastersCatRepair",
};

const ALL_DISTRICTS = ["Сино", "Фирдавси", "Шохмансур", "Исмоили Сомони", "Пригород"];

const DISTRICT_LABEL_KEYS: Record<string, string> = {
  "Сино": "districtSino",
  "Фирдавси": "districtFirdausi",
  "Шохмансур": "districtShomansur",
  "Исмоили Сомони": "districtIsmoili",
  "Пригород": "districtSuburb",
};

export default function Masters() {
  // Реальные фото из фирменной фотосессии (public/images).
  const heroImage = "/images/master-dushanbe.jpg";
  const consultantImage = "/images/consultant-support.jpg";
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [masters, setMasters] = useState<MasterListing[]>(SAMPLE_MASTERS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [district, setDistrict] = useState("all");
  const [sortBy, setSortBy] = useState("ranking");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const { compareIds, toggleCompare, clearCompare, isComparing } = useComparison();
  const [compareOpen, setCompareOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [quickBookOpen, setQuickBookOpen] = useState(false);
  const [aiMatchOpen, setAiMatchOpen] = useState(false);

  useEffect(() => {
    async function loadMasters() {
      try {
        const { data, error } = (await Promise.race([
          supabase.from("master_listings").select("*").eq("is_active", true),
          new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
        ])) as any;

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          // Защита от пустых полей из базы, чтобы фильтры и карточки не падали.
          setMasters((data as any[]).map((m) => ({
            ...m,
            full_name: m.full_name || "",
            service_categories: m.service_categories || [],
            working_districts: m.working_districts || [],
            average_rating: Number(m.average_rating) || 0,
            total_reviews: m.total_reviews || 0,
            price_min: m.price_min || 0,
            price_max: m.price_max || 0,
            experience_years: m.experience_years || 0,
            completed_orders: m.completed_orders || 0,
          })) as MasterListing[]);
        } else {
          setMasters(SAMPLE_MASTERS);
        }
      } catch (error) {
        setMasters(SAMPLE_MASTERS);
      } finally {
        setLoading(false);
      }
    }

    loadMasters();
  }, []);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setSearch(q);
    }
    const cat = searchParams.get("category");
    if (cat !== null) {
      setCategory(cat);
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = masters;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.full_name.toLowerCase().includes(q) ||
          (m.bio || "").toLowerCase().includes(q) ||
          m.service_categories.some((c) => c.toLowerCase().includes(q)) ||
          m.working_districts.some((d) => d.toLowerCase().includes(q))
      );
    }

    if (category !== "all") {
      result = result.filter((m) => m.service_categories.includes(category));
    }

    if (district !== "all") {
      result = result.filter((m) => m.working_districts.includes(district));
    }

    if (minRating > 0) {
      result = result.filter((m) => m.average_rating >= minRating);
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "ranking": return (b.ranking_score || 0) - (a.ranking_score || 0);
        case "rating": return b.average_rating - a.average_rating;
        case "price_low": return a.price_min - b.price_min;
        case "price_high": return b.price_max - a.price_max;
        case "experience": return b.experience_years - a.experience_years;
        case "reviews": return b.total_reviews - a.total_reviews;
        default: return 0;
      }
    });

    return result;
  }, [masters, search, category, district, sortBy, minRating]);

  const activeFilters = [category !== "all", district !== "all", minRating > 0].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ScrollExtras />
      
      {/* Hero Section */}
      <section className="relative bg-[#F0FDF4] dark:bg-emerald-950/20 pt-8 pb-12 overflow-hidden border-b border-green-100 dark:border-emerald-900/30">
        <motion.div aria-hidden className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" animate={{ x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div aria-hidden className="pointer-events-none absolute bottom-0 right-1/4 h-60 w-60 rounded-full bg-teal-300/25 blur-3xl" animate={{ x: [0, -40, 0], y: [0, -20, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
        <div className="relative container px-4 mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-8 relative">
            
            {/* Left Image (Master) */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
              transition={{ opacity: { duration: 0.6 }, x: { duration: 0.6 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
              className="hidden lg:block w-1/4"
            >
              <div className="group hover-soft overflow-hidden rounded-[2rem] border border-white/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/70 shadow-lg transition-shadow duration-500 hover:shadow-2xl hover:shadow-emerald-200/60">
                <img src={heroImage} alt="Master" className="h-[360px] w-full object-cover object-center transition-transform duration-700 group-hover:scale-110" />
              </div>
            </motion.div>

            {/* Center Content */}
            <div className="flex-1 text-center lg:px-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-slate-900 via-emerald-700 to-slate-900 dark:from-white dark:via-emerald-300 dark:to-white bg-[length:200%_auto] bg-clip-text text-transparent animate-[shine_5s_linear_infinite]">{t("mastersHeroTitle")}</h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 font-medium">
                  {t("mastersHeroSubtitle", { count: masters.length })}
                </p>

                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-6 rounded-3xl border border-white dark:border-slate-800 max-w-2xl mx-auto mb-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
                    {t("mastersHeroDesc")}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setAiMatchOpen(true)}
                    className="relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-emerald-200/70"
                  >
                    <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[sweep_2.5s_ease-in-out_infinite]" />
                    <Sparkles className="h-5 w-5" /> ИИ подбор мастера
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setQuickBookOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl border-2 border-emerald-500 bg-white px-6 py-3 font-bold text-emerald-600 shadow-sm transition-colors hover:bg-emerald-50 dark:bg-slate-900"
                  >
                    <CalendarClock className="h-5 w-5" /> Быстрая запись
                  </motion.button>
                </div>

                <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                  <BenefitItem icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} text={t("mastersBenefit1Text")} subtext={t("mastersBenefit1Sub")} />
                  <BenefitItem icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} text={t("mastersBenefit2Text")} subtext={t("mastersBenefit2Sub")} />
                  <BenefitItem icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} text={t("mastersBenefit3Text")} subtext={t("mastersBenefit3Sub")} />
                </div>
              </motion.div>
            </div>

            {/* Right Card (Help) */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -6 }}
              className="w-full lg:w-1/4 max-w-sm group"
            >
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden hover-lift hover-glow flex flex-col h-full">
                <div className="relative h-48 shrink-0 overflow-hidden">
                  <img
                    src={consultantImage}
                    alt="Consultant"
                    className="h-full w-full object-cover object-[center_18%] transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-white/20 dark:via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-4 left-6">
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200 border-2 border-white">
                      <span className="absolute inset-0 rounded-2xl bg-emerald-400/60 animate-ping" />
                      <Headset className="relative h-5 w-5" />
                    </div>
                  </div>
                </div>
                <div className="p-7 pt-4 flex flex-col flex-1">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight">{t("mastersHelpTitle")}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed flex-1">
                    {t("mastersHelpDesc")}
                  </p>
                  <Button
                    onClick={() => setIsOrderModalOpen(true)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-[1.25rem] py-6 h-auto font-black shadow-lg shadow-emerald-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-emerald-300 active:scale-95"
                  >
                    {t("mastersHelpButton")}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10">
        <div className="container px-4 mx-auto max-w-7xl">
          
          {/* Search Bar Row */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                placeholder={t("mastersSearchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-12 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm transition-shadow duration-300 hover:shadow-md focus-visible:shadow-xl focus-visible:shadow-emerald-100 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-lg"
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    type="button"
                    aria-label="Очистить"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    onClick={() => setSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:bg-slate-800"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <Button
              variant="outline"
              className={`h-14 gap-2 rounded-2xl shrink-0 px-8 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-500 transition-all font-semibold ${showFilters ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-white dark:bg-slate-900'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className={`w-5 h-5 transition-transform duration-300 ${showFilters ? "rotate-90" : ""}`} />
              {t("mastersFiltersButton")}
              {activeFilters > 0 && (
                <Badge className="ml-1 bg-emerald-500 h-6 w-6 p-0 flex items-center justify-center text-xs rounded-full">
                  {activeFilters}
                </Badge>
              )}
            </Button>
          </div>

          {/* Quick category chips */}
          <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
            {["all", ...ALL_CATEGORIES].map((c) => {
              const active = category === c;
              return (
                <motion.button
                  key={c}
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCategory(c)}
                  className={`relative shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition-colors ${active ? "border-transparent text-white" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}
                >
                  {active && (
                    <motion.span layoutId="masters-cat-chip" className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md shadow-emerald-200" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                  )}
                  <span className="relative z-10">{c === "all" ? t("mastersFilterAllCategories") : (t(CATEGORY_LABEL_KEYS[c] ?? "") || c)}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Filters Panel */}
          <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 block">{t("mastersFilterCategory")}</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("mastersFilterAllCategories")}</SelectItem>
                      {ALL_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{t(CATEGORY_LABEL_KEYS[c] ?? "")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 block">{t("mastersFilterDistrict")}</label>
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("mastersFilterAllDistricts")}</SelectItem>
                      {ALL_DISTRICTS.map((d) => (
                        <SelectItem key={d} value={d}>{t(DISTRICT_LABEL_KEYS[d] ?? "")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 block">{t("mastersFilterSort")}</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ranking">{t("mastersSortRanking")}</SelectItem>
                      <SelectItem value="rating">{t("mastersSortRating")}</SelectItem>
                      <SelectItem value="price_low">{t("mastersSortPriceLow")}</SelectItem>
                      <SelectItem value="price_high">{t("mastersSortPriceHigh")}</SelectItem>
                      <SelectItem value="experience">{t("mastersSortExperience")}</SelectItem>
                      <SelectItem value="reviews">{t("mastersSortReviews")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 block">
                    {t("mastersMinRatingLabel")} {minRating > 0 ? minRating.toFixed(1) : t("mastersAny")}
                  </label>
                  <div className="pt-4">
                    <Slider
                      value={[minRating]}
                      onValueChange={([v]) => setMinRating(v)}
                      max={5}
                      step={0.5}
                      className="[&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
              {activeFilters > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-6 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors"
                  onClick={() => { setCategory("all"); setDistrict("all"); setMinRating(0); }}
                >
                  <X className="w-4 h-4 mr-2" /> {t("mastersResetFilters")}
                </Button>
              )}
            </motion.div>
          )}
          </AnimatePresence>

          {/* Results Summary Row */}
          <div className="flex items-center justify-between mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover-soft">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("mastersFoundCount", { count: filtered.length })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">{t("mastersSortShortLabel")}</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-8 border-none bg-transparent p-0 font-bold text-slate-700 dark:text-slate-200 shadow-none focus:ring-0 w-[140px] gap-1 hover:text-emerald-500 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="ranking">{t("mastersSortRanking")}</SelectItem>
                  <SelectItem value="rating">{t("mastersSortRating")}</SelectItem>
                  <SelectItem value="price_low">{t("mastersSortPriceLow")}</SelectItem>
                  <SelectItem value="price_high">{t("mastersSortPriceHigh")}</SelectItem>
                  <SelectItem value="experience">{t("mastersSortExperience")}</SelectItem>
                  <SelectItem value="reviews">{t("mastersSortReviews")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Masters Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-80 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                <Users className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t("mastersEmptyTitle")}</h3>
              <p className="text-slate-500 dark:text-slate-400">{t("mastersEmptyDesc")}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button
                  variant="outline"
                  className="rounded-xl border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                  onClick={() => { setSearch(""); setCategory("all"); setDistrict("all"); setMinRating(0); }}
                >
                  <X className="w-4 h-4 mr-2" /> {t("mastersResetFilters")}
                </Button>
                <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-600" onClick={() => setAiMatchOpen(true)}>
                  <Sparkles className="w-4 h-4 mr-2" /> ИИ подбор мастера
                </Button>
              </div>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
              {filtered.map((master, index) => (
                <MasterCard
                  key={master.id}
                  master={master}
                  index={index}
                  search={search}
                  isComparing={isComparing(master.id)}
                  onToggleCompare={() => toggleCompare(master.id)}
                  compareDisabled={compareIds.length >= 3 && !isComparing(master.id)}
                />
              ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Bottom Features Row */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Zap className="w-6 h-6 text-emerald-500" />, title: t("mastersFeature1Title"), desc: t("mastersFeature1Desc") },
              { icon: <Trophy className="w-6 h-6 text-emerald-500" />, title: t("mastersFeature2Title"), desc: t("mastersFeature2Desc") },
              { icon: <Shield className="w-6 h-6 text-emerald-500" />, title: t("mastersFeature3Title"), desc: t("mastersFeature3Desc") },
              { icon: <Headset className="w-6 h-6 text-emerald-500" />, title: t("mastersFeature4Title"), desc: t("mastersFeature4Desc") },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <FeatureCard icon={f.icon} title={f.title} desc={f.desc} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CompareBar compareIds={compareIds} onOpen={() => setCompareOpen(true)} onClear={clearCompare} />
      <MasterComparisonDialog open={compareOpen} onOpenChange={setCompareOpen} masterIds={compareIds} />
      
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        category="other"
        initialServiceName={t("mastersConsultationService")}
      />
      <QuickBooking open={quickBookOpen} onOpenChange={setQuickBookOpen} />
      <AiMasterMatch open={aiMatchOpen} onOpenChange={setAiMatchOpen} />

      <Footer />
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

function BenefitItem({ icon, text, subtext }: { icon: React.ReactNode; text: string; subtext: string }) {
  return (
    <div className="group flex items-center gap-3 text-left cursor-default transition-transform duration-300 hover:translate-x-1">
      <div className="bg-emerald-50 p-2 rounded-full border border-emerald-100 transition-colors duration-300 group-hover:bg-emerald-500 [&_svg]:transition-colors [&_svg]:duration-300 group-hover:[&_svg]:text-white">{icon}</div>
      <div>
        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{text}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{subtext}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-3 hover-glow hover:border-emerald-200 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-100/60 transition-all duration-300">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-1 transition-all duration-300 group-hover:bg-emerald-500 group-hover:scale-110 group-hover:rotate-6 [&_svg]:transition-colors [&_svg]:duration-300 group-hover:[&_svg]:text-white">
        {icon}
      </div>
      <h4 className="font-bold text-slate-900 dark:text-white">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
    </div>
  );
}

// Показываем найденную по поиску категорию первой в бейджах карточки — иначе она может
// не попасть в первые 2 показанные категории и результат выглядит так, будто фильтр не сработал.
function getDisplayCategories(categories: string[], search: string) {
  const q = search.trim().toLowerCase();
  if (!q) return categories.slice(0, 2);
  const matched = categories.filter((c) => c.toLowerCase().includes(q));
  const rest = categories.filter((c) => !c.toLowerCase().includes(q));
  return [...matched, ...rest].slice(0, 2);
}

function MasterCard({ master, index, search, isComparing, onToggleCompare, compareDisabled }: { master: MasterListing; index: number; search: string; isComparing: boolean; onToggleCompare: () => void; compareDisabled: boolean }) {
  const { t } = useLanguage();
  const initials = personInitials(master.full_name);

  const colors = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-teal-500",
  ];
  const color = colors[index % colors.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Link to={`/masters/${master.id}`} className="block h-full">
        <Card className={`group h-full bg-white dark:bg-slate-900 hover:shadow-2xl hover:shadow-emerald-100/70 transition-all duration-300 overflow-hidden cursor-pointer rounded-[2.5rem] relative ${isComparing ? "border-2 border-emerald-500 ring-4 ring-emerald-100" : "border-slate-100 dark:border-slate-800 hover:border-emerald-200"}`}>
          {/* Top category bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${color} opacity-80 origin-left transition-transform duration-500 group-hover:scale-y-[3]`} />
          <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-50/70 to-transparent transition-transform duration-1000 group-hover:translate-x-full dark:via-emerald-500/10" />
          {/* Compare toggle */}
          <button
            type="button"
            aria-label="Сравнить"
            title={compareDisabled ? "Можно сравнить максимум 3 мастера" : "Сравнить"}
            disabled={compareDisabled}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleCompare(); }}
            className={`absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${isComparing ? "border-emerald-500 bg-emerald-500 text-white scale-110" : "border-slate-200 bg-white text-slate-400 opacity-70 hover:opacity-100 hover:border-emerald-400 hover:text-emerald-500 group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-900"} disabled:cursor-not-allowed disabled:opacity-30`}
          >
            {isComparing ? <CheckCircle2 className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
          </button>
          
          <CardContent className="relative p-6 flex flex-col h-full">
            {/* Header: Avatar + Info */}
            <div className="flex items-start gap-4 mb-5">
              <div className={`relative w-14 h-14 rounded-2xl ${color} flex items-center justify-center overflow-hidden text-white text-lg font-bold shrink-0 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6`}>
                {master.avatar_url ? (
                  <img src={master.avatar_url} alt="" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  initials
                )}
                {master.is_top_master && <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />}
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 transition-colors truncate">
                    {personName(master.full_name)}
                  </h3>
                  {master.is_top_master && (
                    <Award className="w-4 h-4 text-amber-500 shrink-0 transition-transform duration-500 group-hover:rotate-[360deg]" />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{master.average_rating}</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">{t("mastersReviewsCount", { count: master.total_reviews })}</span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {getDisplayCategories(master.service_categories, search).map((cat) => (
                <span key={cat} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 group-hover:bg-emerald-50 group-hover:text-emerald-700">
                  {t(CATEGORY_LABEL_KEYS[cat] ?? "") || cat}
                </span>
              ))}
            </div>

            {/* Details */}
            <div className="space-y-2 mb-6 flex-1">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-300" />
                <span>{t("mastersYearsExp", { years: master.experience_years })}</span>
                <span className="text-slate-200">•</span>
                <span>{t("mastersJobsCount", { count: master.completed_orders })}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-300" />
                <span className="truncate">{t("mastersCityDistricts", { districts: master.working_districts.map((d) => t(DISTRICT_LABEL_KEYS[d] ?? "") || d).join(", ") })}</span>
              </div>
            </div>

            {/* Footer: Price + Actions */}
            <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{t("fromPrice")}</p>
                <p className="text-lg font-black text-slate-900 dark:text-white leading-none">
                  {master.price_min} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">{t("mastersCurrencyShort")}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `tel:${SUPPORT_PHONE}`; }}
                  aria-label="Позвонить"
                  className="w-9 h-9 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:scale-110 hover:rotate-12 transition-all duration-300 shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(`https://wa.me/${SUPPORT_WHATSAPP}`, "_blank", "noopener"); }}
                  aria-label="WhatsApp"
                  className="w-9 h-9 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-green-500 hover:text-white hover:border-green-500 hover:scale-110 hover:-rotate-12 transition-all duration-300 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <span className="inline-flex h-9 items-center px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-lg shadow-emerald-100 group-hover:shadow-emerald-300">
                  {t("mastersMoreButton")}
                  <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
