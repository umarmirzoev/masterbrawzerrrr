import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Star, CheckCircle2, Clock, ShieldCheck, 
  Wallet, Users, ArrowRight, Phone, MessageSquare,
  Zap, Droplets, Hammer, Sofa, Cpu, Waves, 
  Trash2, Snowflake, Thermometer, Construction, Layers, Grid
} from "lucide-react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import OrderModal from "@/components/OrderModal";
import QuickBooking from "@/components/QuickBooking";
import AiMasterMatch from "@/components/AiMasterMatch";

const AVATAR_COLORS = [
  "bg-emerald-500", "bg-blue-500", "bg-orange-500",
  "bg-violet-500", "bg-amber-500", "bg-sky-500",
];

const getInitials = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
};

interface TopMasterCard {
  name: string;
  rating: number;
  reviews: number;
  exp: string;
  color: string;
  initials: string;
}

const Index = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [quickBookOpen, setQuickBookOpen] = useState(false);
  const [aiMatchOpen, setAiMatchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/masters?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (name: string) => {
    navigate(`/masters?category=${encodeURIComponent(name)}`);
  };

  const services = [
    { icon: <Zap className="text-amber-500" />, name: "Электрика", price: "от 100 сомони", color: "bg-amber-50" },
    { icon: <Droplets className="text-blue-500" />, name: "Сантехника", price: "от 100 сомони", color: "bg-blue-50" },
    { icon: <Hammer className="text-emerald-500" />, name: "Отделка и ремонт", price: "от 120 сомони", color: "bg-emerald-50" },
    { icon: <Sofa className="text-orange-500" />, name: "Мебель и двери", price: "от 80 сомони", color: "bg-orange-50" },
    { icon: <Cpu className="text-violet-500" />, name: "Умный дом", price: "от 200 сомони", color: "bg-violet-50" },
    { icon: <Waves className="text-sky-500" />, name: "Водоснабжение", price: "от 120 сомони", color: "bg-sky-50" },
    { icon: <Trash2 className="text-green-500" />, name: "Уборка", price: "от 80 сомони", color: "bg-green-50" },
    { icon: <Snowflake className="text-cyan-500" />, name: "Кондиционеры", price: "от 150 сомони", color: "bg-cyan-50" },
    { icon: <Thermometer className="text-red-500" />, name: "Отопление", price: "от 150 сомони", color: "bg-red-50" },
    { icon: <Construction className="text-pink-500" />, name: "Мелкие работы", price: "от 60 сомони", color: "bg-pink-50" },
    { icon: <Layers className="text-orange-600" />, name: "Полы и ламинат", price: "от 100 сомони", color: "bg-orange-50" },
    { icon: <Grid className="text-slate-500" />, name: "Другие услуги", price: "уточняйте", color: "bg-slate-50" },
  ];

  const [topMasters, setTopMasters] = useState<TopMasterCard[]>([]);

  // Подтягиваем реальных топ-мастеров из Supabase вместо статичного списка.
  useEffect(() => {
    let isMounted = true;

    async function loadTopMasters() {
      const { data, error } = await supabase
        .from("master_listings")
        .select("full_name, average_rating, total_reviews, experience_years")
        .eq("is_active", true)
        .order("ranking_score", { ascending: false })
        .limit(6);

      if (!isMounted) return;

      if (error || !data || data.length === 0) {
        setTopMasters([]);
        return;
      }

      setTopMasters(
        data.map((m, idx) => ({
          name: m.full_name ?? "",
          rating: m.average_rating ?? 0,
          reviews: m.total_reviews ?? 0,
          exp: `Опыт ${m.experience_years ?? 0} лет`,
          color: AVATAR_COLORS[idx % AVATAR_COLORS.length],
          initials: getInitials(m.full_name ?? ""),
        })),
      );
    }

    loadTopMasters();
    return () => {
      isMounted = false;
    };
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1, transition: { staggerChildren: 0.1 } },
    viewport: { once: true }
  };

  return (
    <div className="min-h-screen bg-white selection:bg-emerald-100 selection:text-emerald-900">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 overflow-hidden bg-gradient-to-b from-[#f9fafb] to-white">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Hero Left Content */}
            <div className="w-full lg:w-1/2 relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 mb-8"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {t("heroBadgeText")}
                </motion.div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-8 leading-[1.05] tracking-tight">
                  {t("heroTitle")}
                </h1>

                <p className="text-xl text-slate-500 mb-12 max-w-lg leading-relaxed font-medium">
                  {t("heroDescription")}
                </p>

                <div className="relative max-w-xl mb-12 group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-500" />
                  <div className="relative flex items-center bg-white p-2.5 rounded-2xl border border-slate-100 shadow-2xl shadow-slate-200/50">
                    <Search className="w-6 h-6 text-slate-400 ml-5 mr-3" />
                    <Input 
                      placeholder={t("heroSearchPlaceholder")} 
                      className="border-0 focus-visible:ring-0 text-slate-900 text-lg font-medium placeholder:text-slate-400 h-14"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button 
                      onClick={handleSearch}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-10 h-14 rounded-xl transition-all shadow-xl shadow-emerald-100 active:scale-95"
                    >
                      {t("heroSearchButton")}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-10">
                   <div className="flex items-center -space-x-4">
                      {[
                        { i: "ФК", c: "bg-emerald-500" },
                        { i: "БА", c: "bg-blue-500" },
                        { i: "СХ", c: "bg-orange-500" },
                        { i: "РС", c: "bg-violet-500" }
                      ].map((item, i) => (
                        <motion.div 
                          key={i} 
                          whileHover={{ y: -5, scale: 1.1, zIndex: 10 }}
                          className={`w-12 h-12 rounded-full border-4 border-white ${item.c} flex items-center justify-center text-[11px] font-black text-white shadow-xl cursor-default transition-transform`}
                        >
                          {item.i}
                        </motion.div>
                      ))}
                      <div className="w-12 h-12 rounded-full border-4 border-white bg-slate-50 flex items-center justify-center text-[11px] font-black text-slate-400 shadow-xl">
                        +500
                      </div>
                   </div>
                   <div className="space-y-1">
                      <p className="text-sm font-black text-slate-900 tracking-tight">{t("trustMastersInDushanbe")}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                        </div>
                        <span className="text-xs font-bold text-slate-400">{t("trustRatingDesc")}</span>
                      </div>
                   </div>
                </div>
              </motion.div>
            </div>

            {/* Hero Right Image Area */}
            <div className="w-full lg:w-1/2 relative">
               <motion.div
                 initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                 animate={{ opacity: 1, scale: 1, rotate: 0 }}
                 transition={{ duration: 1, ease: "easeOut" }}
                 className="relative"
               >
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 rounded-full blur-[120px] -z-10" 
                  />
                  <motion.img 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    src="/shop/specialist.png" 
                    alt="Master" 
                    className="relative z-10 w-full h-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.12)]"
                  />
                  
                  {/* Floating Rating Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="absolute bottom-2 right-0 md:-right-2 z-20 bg-white/80 backdrop-blur-xl p-5 sm:p-7 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 w-48 sm:w-64 cursor-default"
                  >
                     <div className="flex items-center justify-between mb-5">
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">4.8</p>
                        <div className="text-right">
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Рейтинг</p>
                           <div className="flex gap-0.5 justify-end">
                              {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                           </div>
                        </div>
                     </div>
                     <ul className="space-y-4">
                        <FloatingCardItem text="Быстрый выезд" />
                        <FloatingCardItem text="Честные цены" />
                        <FloatingCardItem text="Гарантия на работы" />
                     </ul>
                  </motion.div>
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-12 bg-white border-b border-slate-50">
        <div className="container px-4 mx-auto max-w-7xl">
           <motion.div 
             variants={staggerContainer}
             initial="initial"
             whileInView="whileInView"
             viewport={{ once: true }}
             className="grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-16"
           >
              <FeatureItem icon={<Clock />} title="Быстрый выезд" sub="от 30 минут" />
              <FeatureItem icon={<ShieldCheck />} title="Гарантия на все работы" sub="до 12 месяцев" />
              <FeatureItem icon={<Wallet />} title="Оплата после работы" sub="удобным способом" />
              <FeatureItem icon={<Users />} title="Проверенные мастера" sub="с опытом от 3 лет" />
           </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-28 bg-white">
        <div className="container px-4 mx-auto max-w-7xl">
           <motion.div 
             {...fadeInUp}
             className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 gap-6"
           >
              <div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{t("categoriesTitle")}</h2>
                <p className="text-lg text-slate-500 font-medium">{t("categoriesDescription")}</p>
              </div>
              <Button variant="ghost" className="text-emerald-600 font-black hover:text-emerald-700 hover:bg-emerald-50 px-6 py-6 rounded-2xl flex items-center gap-3 group text-base">
                 {t("viewAllCategories")} <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Button>
           </motion.div>

           <motion.div 
             variants={staggerContainer}
             initial="initial"
             whileInView="whileInView"
             viewport={{ once: true }}
             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-5"
           >
              {services.map((service, idx) => (
                <motion.div 
                  key={idx}
                  variants={{
                    initial: { opacity: 0, scale: 0.9 },
                    whileInView: { opacity: 1, scale: 1 }
                  }}
                  whileHover={{ 
                    y: -10, 
                    boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.15)",
                    borderColor: "rgba(16, 185, 129, 0.3)"
                  }}
                  onClick={() => handleCategoryClick(service.name)}
                  className="group p-7 bg-white rounded-3xl border border-slate-100 transition-all cursor-pointer text-center md:text-left"
                >
                  <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center mb-6 mx-auto md:mx-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                     {React.cloneElement(service.icon as React.ReactElement, { className: "w-7 h-7" })}
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-emerald-600 transition-colors">{service.name}</h3>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{service.price}</p>
                </motion.div>
              ))}
           </motion.div>
        </div>
      </section>

      {/* Best Masters Section */}
      {topMasters.length > 0 && (
      <section className="py-28 bg-[#f9fafb] relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-50/50 via-transparent to-transparent opacity-50 -z-10" />
        
        <div className="container px-4 mx-auto max-w-7xl">
           <motion.div 
             {...fadeInUp}
             className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 gap-6"
           >
              <div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Лучшие мастера недели</h2>
                <p className="text-lg text-slate-500 font-medium">Мастера с лучшими оценками и большим опытом работы</p>
              </div>
              <Button variant="ghost" className="text-emerald-600 font-black hover:text-emerald-700 hover:bg-emerald-50 px-6 py-6 rounded-2xl flex items-center gap-3 group text-base">
                 Все мастера <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Button>
           </motion.div>

           <motion.div 
             variants={staggerContainer}
             initial="initial"
             whileInView="whileInView"
             viewport={{ once: true }}
             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5"
           >
              {topMasters.map((master, idx) => (
                <motion.div
                  key={idx}
                  variants={{
                    initial: { opacity: 0, y: 20 },
                    whileInView: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -8 }}
                >
                  <Card className="border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden group rounded-[2rem] h-full">
                    <CardContent className="p-6">
                      <div className="relative mb-6">
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={`w-16 h-16 rounded-2xl ${master.color} flex items-center justify-center text-white text-xl font-black shadow-lg shadow-slate-200 transition-transform`}
                        >
                           {master.initials}
                        </motion.div>
                        <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-lg">
                           <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                        </div>
                      </div>
                      <h3 className="text-base font-black text-slate-900 mb-2 leading-tight group-hover:text-emerald-600 transition-colors">{master.name}</h3>
                      <div className="flex items-center gap-1.5 mb-5">
                         <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                         <span className="text-xs font-black text-slate-900">{master.rating}</span>
                         <span className="text-xs font-bold text-slate-400">({master.reviews})</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest bg-slate-50 py-2 px-3 rounded-xl w-fit">
                         <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                         {master.exp}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
           </motion.div>
        </div>
      </section>
      )}

      {/* How it Works */}
      <section className="py-32 bg-white relative">
        <div className="container px-4 mx-auto max-w-7xl text-center mb-24">
           <motion.h2 
             {...fadeInUp}
             className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight"
           >
             {t("howItWorksTitle")}
           </motion.h2>
           <motion.div 
             initial={{ width: 0 }}
             whileInView={{ width: 80 }}
             viewport={{ once: true }}
             className="h-1.5 bg-emerald-500 rounded-full mx-auto"
           />
        </div>
        
        <div className="container px-4 mx-auto max-w-7xl">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
              <StepItem 
                num="01" 
                icon={<Search className="text-emerald-500" />} 
                title={t("howItWorksStep1Title")} 
                desc={t("howItWorksStep1Desc")}
              />
              <StepItem 
                num="02" 
                icon={<MessageSquare className="text-emerald-500" />} 
                title={t("howItWorksStep2Title")} 
                desc={t("howItWorksStep2Desc")}
              />
              <StepItem 
                num="03" 
                icon={<Clock className="text-emerald-500" />} 
                title={t("howItWorksStep3Title")} 
                desc={t("howItWorksStep3Desc")}
              />
           </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-32 bg-[#f9fafb] relative overflow-hidden">
        <div className="container px-4 mx-auto max-w-7xl relative z-10">
           <motion.div 
             {...fadeInUp}
             className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8"
           >
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t("reviewsTitle")}</h2>
              <Button variant="ghost" className="text-emerald-600 font-black hover:text-emerald-700 hover:bg-emerald-50 px-8 py-7 rounded-2xl flex items-center gap-3 group text-lg">
                 {t("viewAllReviews")} <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Button>
           </motion.div>

           <motion.div 
             variants={staggerContainer}
             initial="initial"
             whileInView="whileInView"
             viewport={{ once: true }}
             className="grid grid-cols-1 md:grid-cols-3 gap-10"
           >
              <ReviewCard 
                text="Отличный мастер! Приехал вовремя, быстро устранил проблему с розеткой. Очень вежливый и аккуратный."
                author="Малика Р."
                index={0}
              />
              <ReviewCard 
                text="Заказывал установку кондиционера. Работа выполнена идеально, чисто и профессионально."
                author="Фирдавс К."
                index={1}
              />
              <ReviewCard 
                text="Очень удобно, что можно оплатить после работы. Сервис на высшем уровне. Рекомендую!"
                author="Шахноза М."
                index={2}
              />
           </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto max-w-7xl">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
             className="bg-emerald-600 rounded-[3.5rem] p-12 md:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl shadow-emerald-200"
           >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-800 opacity-60" />
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              
              <div className="relative z-10 text-center lg:text-left max-w-2xl">
                 <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">Нужна помощь прямо сейчас?</h2>
                 <p className="text-xl text-emerald-50 font-medium opacity-90 leading-relaxed">Позвоните нам или оставьте заявку — мы подберем мастера и перезвоним вам в течение 5 минут.</p>
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8 w-full lg:w-auto">
                 <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-5 bg-white/10 backdrop-blur-xl px-10 py-6 rounded-3xl border border-white/20 w-full sm:w-auto"
                 >
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                       <Phone className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-2xl font-black text-white tracking-tight">+992 979 117 007</p>
                       <p className="text-[11px] text-white/60 font-black uppercase tracking-widest">Круглосуточно 24/7</p>
                    </div>
                 </motion.div>
                 <Button 
                   onClick={() => setIsOrderModalOpen(true)}
                   className="w-full sm:w-auto bg-white text-emerald-700 hover:bg-emerald-50 font-black h-20 px-12 rounded-[2rem] text-xl shadow-2xl shadow-black/10 transition-all active:scale-95"
                 >
                    Оставить заявку
                 </Button>
              </div>
           </motion.div>
        </div>
      </section>

      <Footer />

      <AnimatePresence>
        {isOrderModalOpen && (
          <OrderModal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} />
        )}
      </AnimatePresence>
      <QuickBooking open={quickBookOpen} onOpenChange={setQuickBookOpen} />
      <AiMasterMatch open={aiMatchOpen} onOpenChange={setAiMatchOpen} />
    </div>
  );
};

// Sub-components
const FloatingCardItem = ({ text }: { text: string }) => (
  <motion.li 
    whileHover={{ x: 10 }}
    className="flex items-center gap-3 group cursor-default"
  >
    <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-500 transition-colors duration-300">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 group-hover:text-white transition-colors duration-300" />
    </div>
    <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition-colors duration-300">{text}</span>
  </motion.li>
);

const FeatureItem = ({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) => (
  <motion.div 
    variants={{
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 }
    }}
    whileHover={{ y: -5 }}
    className="flex items-center gap-5 group cursor-default"
  >
    <div className="w-14 h-14 rounded-[1.25rem] bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-sm">
      {React.cloneElement(icon as React.ReactElement, { className: "w-7 h-7" })}
    </div>
    <div>
      <h4 className="font-black text-slate-900 text-base leading-tight mb-1 group-hover:text-emerald-600 transition-colors">{title}</h4>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{sub}</p>
    </div>
  </motion.div>
);

const StepItem = ({ num, icon, title, desc }: { num: string; icon: React.ReactNode; title: string; desc: string }) => (
  <motion.div 
    variants={{
      initial: { opacity: 0, y: 30 },
      whileInView: { opacity: 1, y: 0 }
    }}
    whileHover={{ y: -10 }}
    className="relative p-10 flex flex-col items-center text-center group bg-white rounded-[3rem] border border-transparent hover:border-emerald-100 hover:shadow-2xl transition-all duration-500"
  >
    <div className="relative mb-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="text-9xl font-black text-slate-50 absolute -top-16 left-1/2 -translate-x-1/2 -z-10 group-hover:text-emerald-50/50 transition-colors"
      >
        {num}
      </motion.div>
      <div className="w-20 h-20 rounded-[2.5rem] bg-white shadow-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white group-hover:rotate-12 transition-all duration-500 relative z-10 border border-slate-50">
        {React.cloneElement(icon as React.ReactElement, { className: "w-9 h-9" })}
      </div>
    </div>
    <h3 className="text-2xl font-black text-slate-900 mb-5 group-hover:text-emerald-600 transition-colors">{title}</h3>
    <p className="text-base text-slate-500 leading-relaxed max-w-[280px] font-medium">{desc}</p>
  </motion.div>
);

const ReviewCard = ({ text, author, index }: { text: string; author: string; index: number }) => (
  <motion.div
    variants={{
      initial: { opacity: 0, y: 30 },
      whileInView: { opacity: 1, y: 0 }
    }}
    whileHover={{ y: -10, scale: 1.02 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="rounded-[3rem] border-slate-100 shadow-xl shadow-slate-200/20 bg-white p-10 h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/30 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />
      <CardContent className="p-0 relative z-10">
        <div className="flex gap-1.5 mb-8">
          {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
        </div>
        <p className="text-slate-600 font-bold italic text-lg leading-relaxed mb-10">“{text}”</p>
        <div className="flex items-center gap-4">
          <div className="w-10 h-1 bg-emerald-500 rounded-full group-hover:w-16 transition-all duration-500" />
          <p className="text-base font-black text-slate-900">— {author}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default Index;
