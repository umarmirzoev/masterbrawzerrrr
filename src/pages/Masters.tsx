import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
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
  CheckCircle2, Headset, Zap, Trophy,
} from "lucide-react";
import MasterComparisonDialog, { CompareBar, useComparison } from "@/components/MasterComparison";
import OrderModal from "@/components/OrderModal";
import QuickBooking from "@/components/QuickBooking";
import AiMasterMatch from "@/components/AiMasterMatch";
import { SAMPLE_MASTERS } from "@/data/seedData";

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
  // Временные стоковые изображения — замени на реальные фото.
  const heroImage = "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1000&h=800&fit=crop";
  const consultantImage = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=600&fit=crop";
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
        const { data, error } = await supabase
          .from("master_listings")
          .select("*")
          .eq("is_active", true);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setMasters(data as unknown as MasterListing[]);
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
          m.service_categories.some((c) => c.toLowerCase().includes(q))
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
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-[#F0FDF4] pt-8 pb-12 overflow-hidden border-b border-green-100">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-8 relative">
            
            {/* Left Image (Master) */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-1/4"
            >
              <div className="hover-image-zoom hover-soft overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-lg">
                <img src={heroImage} alt="Master" className="h-[360px] w-full scale-[1.12] object-cover object-[78%_center]" />
              </div>
            </motion.div>

            {/* Center Content */}
            <div className="flex-1 text-center lg:px-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">{t("mastersHeroTitle")}</h1>
                <p className="text-lg text-slate-600 mb-8 font-medium">
                  {t("mastersHeroSubtitle", { count: masters.length })}
                </p>

                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-white max-w-2xl mx-auto mb-10 shadow-sm">
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                    {t("mastersHeroDesc")}
                  </p>
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
              className="w-full lg:w-1/4 max-w-sm group"
            >
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden hover-lift hover-glow flex flex-col h-full">
                <div className="relative h-48 shrink-0 overflow-hidden">
                  <img
                    src={consultantImage}
                    alt="Consultant"
                    className="h-full w-full object-cover object-[center_18%] transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                  <div className="absolute bottom-4 left-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200 border-2 border-white">
                      <Headset className="h-5 w-5" />
                    </div>
                  </div>
                </div>
                <div className="p-7 pt-4 flex flex-col flex-1">
                  <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">{t("mastersHelpTitle")}</h3>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed flex-1">
                    {t("mastersHelpDesc")}
                  </p>
                  <Button
                    onClick={() => setIsOrderModalOpen(true)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-[1.25rem] py-6 h-auto font-black shadow-lg shadow-emerald-100 transition-all active:scale-95"
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                placeholder={t("mastersSearchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-14 bg-white border-slate-200 rounded-2xl shadow-sm focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-lg"
              />
            </div>
            <Button
              variant="outline"
              className={`h-14 gap-2 rounded-2xl shrink-0 px-8 border-slate-200 hover:border-emerald-500 hover:text-emerald-500 transition-all font-semibold ${showFilters ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-white'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-5 h-5" />
              {t("mastersFiltersButton")}
              {activeFilters > 0 && (
                <Badge className="ml-1 bg-emerald-500 h-6 w-6 p-0 flex items-center justify-center text-xs rounded-full">
                  {activeFilters}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-6 rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">{t("mastersFilterCategory")}</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200">
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
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">{t("mastersFilterDistrict")}</label>
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200">
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
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">{t("mastersFilterSort")}</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200">
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
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
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
                  className="mt-6 text-slate-400 hover:text-red-500 transition-colors"
                  onClick={() => { setCategory("all"); setDistrict("all"); setMinRating(0); }}
                >
                  <X className="w-4 h-4 mr-2" /> {t("mastersResetFilters")}
                </Button>
              )}
            </motion.div>
          )}

          {/* Results Summary Row */}
          <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover-soft">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-sm font-semibold text-slate-700">
                {t("mastersFoundCount", { count: filtered.length })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{t("mastersSortShortLabel")}</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-8 border-none bg-transparent p-0 font-bold text-slate-700 shadow-none focus:ring-0 w-[140px] gap-1 hover:text-emerald-500 transition-colors">
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
                <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t("mastersEmptyTitle")}</h3>
              <p className="text-slate-500">{t("mastersEmptyDesc")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            </div>
          )}

          {/* Bottom Features Row */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={<Zap className="w-6 h-6 text-emerald-500" />} title={t("mastersFeature1Title")} desc={t("mastersFeature1Desc")} />
            <FeatureCard icon={<Trophy className="w-6 h-6 text-emerald-500" />} title={t("mastersFeature2Title")} desc={t("mastersFeature2Desc")} />
            <FeatureCard icon={<Shield className="w-6 h-6 text-emerald-500" />} title={t("mastersFeature3Title")} desc={t("mastersFeature3Desc")} />
            <FeatureCard icon={<Headset className="w-6 h-6 text-emerald-500" />} title={t("mastersFeature4Title")} desc={t("mastersFeature4Desc")} />
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

function BenefitItem({ icon, text, subtext }: { icon: React.ReactNode; text: string; subtext: string }) {
  return (
    <div className="flex items-center gap-3 text-left">
      <div className="bg-emerald-50 p-2 rounded-full border border-emerald-100">{icon}</div>
      <div>
        <p className="text-sm font-bold text-slate-900 leading-tight">{text}</p>
        <p className="text-[11px] text-slate-500">{subtext}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3 hover-soft hover-glow">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-1">
        {icon}
      </div>
      <h4 className="font-bold text-slate-900">{title}</h4>
      <p className="text-xs text-slate-500">{desc}</p>
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
  const initials = master.full_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link to={`/masters/${master.id}`}>
        <Card className="group h-full bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer border-slate-100 rounded-[2.5rem] relative hover-lift hover-glow">
          {/* Top category bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${color} opacity-80`} />
          
          <CardContent className="p-6 flex flex-col h-full">
            {/* Header: Avatar + Info */}
            <div className="flex items-start gap-4 mb-5">
              <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-lg`}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors truncate">
                    {master.full_name}
                  </h3>
                  {master.is_top_master && (
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold text-slate-800">{master.average_rating}</span>
                  <span className="text-[11px] text-slate-400">{t("mastersReviewsCount", { count: master.total_reviews })}</span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {getDisplayCategories(master.service_categories, search).map((cat) => (
                <span key={cat} className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  {t(CATEGORY_LABEL_KEYS[cat] ?? "") || cat}
                </span>
              ))}
            </div>

            {/* Details */}
            <div className="space-y-2 mb-6 flex-1">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-300" />
                <span>{t("mastersYearsExp", { years: master.experience_years })}</span>
                <span className="text-slate-200">•</span>
                <span>{t("mastersJobsCount", { count: master.completed_orders })}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-300" />
                <span className="truncate">{t("mastersCityDistricts", { districts: master.working_districts.map((d) => t(DISTRICT_LABEL_KEYS[d] ?? "") || d).join(", ") })}</span>
              </div>
            </div>

            {/* Footer: Price + Actions */}
            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-medium">{t("fromPrice")}</p>
                <p className="text-lg font-black text-slate-900 leading-none">
                  {master.price_min} <span className="text-xs font-normal text-slate-400">{t("mastersCurrencyShort")}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => { e.preventDefault(); window.open(`tel:${master.phone}`); }}
                  className="w-9 h-9 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-100 transition-all shadow-sm hover-soft"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.preventDefault(); window.open(`https://wa.me/${master.phone.replace(/\D/g, "")}`); }}
                  className="w-9 h-9 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-100 transition-all shadow-sm hover-soft"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button className="h-9 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-100 hover-soft">
                  {t("mastersMoreButton")}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
