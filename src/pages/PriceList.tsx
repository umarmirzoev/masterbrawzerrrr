import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import OrderModal from "@/components/OrderModal";
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
  LayoutGrid, Settings, Brush
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  "Электрика": Zap, "Сантехника": Droplets, "Отделка": LayoutGrid, "Мебель и двери": Sofa,
  "Умный дом": Cpu, "Водоснабжение": Droplets, "Уборка": Sparkles, "Кондиционеры": Wind,
  "Отопление": Flame, "Малярные работы": Brush, "Полы и ламинат": Hammer, "Другие услуги": MoreHorizontal,
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
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderModal, setOrderModal] = useState<{ open: boolean; categoryId?: string; serviceId?: string; name?: string }>({ open: false });

  useEffect(() => {
    const load = async () => {
      try {
        const [catsRes, servicesRes] = await Promise.all([
          supabase.from("service_categories").select("*").order("sort_order"),
          supabase.from("services").select("*").order("sort_order"),
        ]);

        const cats = catsRes.data?.length ? catsRes.data : SAMPLE_SERVICE_CATEGORIES;
        const servicesData = servicesRes.data?.length ? servicesRes.data : SAMPLE_SERVICES;

        setCategories(cats);
        setServices(servicesData);
        if (cats.length > 0) setActiveCategory(cats[0].id);
      } catch (error) {
        console.error("PriceList load error:", error);
        setCategories(SAMPLE_SERVICE_CATEGORIES);
        setServices(SAMPLE_SERVICES);
        setActiveCategory(SAMPLE_SERVICE_CATEGORIES[0]?.id || null);
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
    { name: "Ремонт и отделка", price: "200", icon: LayoutGrid, color: "bg-blue-500" },
    { name: "Установка и монтаж", price: "150", icon: Settings, color: "bg-amber-500" },
    { name: "Чистка и уборка", price: "120", icon: Sparkles, color: "bg-purple-500" },
    { name: "Сантехнические работы", price: "150", icon: Droplets, color: "bg-emerald-500" },
    { name: "Электромонтажные работы", price: "150", icon: Zap, color: "bg-orange-500" },
    { name: "Мастер на час", price: "100", icon: Clock, color: "bg-blue-700" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-slate-400 font-medium animate-pulse">Загрузка услуг...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentCategory = categories.find(c => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-[#F0FDF4] pt-12 pb-20 overflow-hidden border-b border-green-100">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-left z-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-4 leading-tight">
                  Найдите нужную услугу <br /> и мастера в <span className="text-emerald-600">Душанбе</span>
                </h1>
                <p className="text-lg text-slate-600 mb-10 max-w-xl font-medium">
                  Более 1000 проверенных мастеров готовы помочь вам с любой задачей
                </p>

                <div className="relative max-w-2xl group mb-10">
                  <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        placeholder="Поиск услуги (например: сантехник, электрик, уборка)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 h-14 border-none shadow-none text-base focus-visible:ring-0"
                      />
                    </div>
                    <Button className="h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-95">
                      Найти мастера
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <BenefitItem icon={<Clock className="w-5 h-5 text-emerald-500" />} title="Быстрый выезд" sub="от 30 минут" />
                  <BenefitItem icon={<Users className="w-5 h-5 text-emerald-500" />} title="Проверенные мастера" sub="Рейтинг и отзывы" />
                  <BenefitItem icon={<Shield className="w-5 h-5 text-emerald-500" />} title="Честные цены" sub="Без скрытых платежей" />
                  <BenefitItem icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} title="Гарантия на работу" sub="Поддержка после заказа" />
                </div>
              </motion.div>
            </div>

            <div className="hidden lg:block w-1/3">
              <div className="relative">
                <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl rounded-full" />
                <div className="relative hover-lift hover-glow overflow-hidden rounded-[2.5rem] border border-white bg-white shadow-2xl">
                   <img src={heroImage} alt="Master" className="h-[420px] w-full object-cover object-[78%_center]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              Популярные услуги
            </h2>
            <Link to="#" className="text-sm font-bold text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-1">
              Смотреть все услуги <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularServicesData.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group h-full border-slate-100 hover:border-emerald-100 hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden cursor-pointer hover-lift">
                  <CardContent className="p-5 flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <s.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1 leading-tight">{s.name}</h3>
                    <p className="text-xs text-slate-400 mb-4">от {s.price} сомони</p>
                    <Button variant="ghost" className="h-8 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-500 transition-colors">
                      Заказать
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Services with Sidebar */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="container px-4 mx-auto max-w-7xl">
          <h2 className="text-3xl font-black text-slate-900 mb-10">Все услуги по категориям</h2>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full lg:w-1/4 space-y-2">
              <div className="bg-white rounded-3xl p-3 shadow-sm border border-slate-100 sticky top-24">
                {categories.map((cat) => {
                  const Icon = iconMap[cat.name_ru] || Wrench;
                  const isActive = activeCategory === cat.id;
                  const count = groupedByCategory.get(cat.id)?.length || 0;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-left group ${
                        isActive 
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" 
                        : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-500"}`} />
                      <span className="flex-1 font-bold text-sm">{getName(cat)}</span>
                      <span className={`text-[10px] font-bold ${isActive ? "text-emerald-100" : "text-slate-400"}`}>
                        {count} мастеров
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100 min-h-[600px]">
                {activeCategory && (
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                        {(() => {
                          const Icon = currentCategory ? (iconMap[currentCategory.name_ru] || Wrench) : Wrench;
                          return <Icon className="w-8 h-8" />;
                        })()}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">
                          {getName(currentCategory)}
                        </h3>
                        <p className="text-sm text-slate-500">Монтаж, замена и ремонт</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {(groupedByCategory.get(activeCategory) || []).map((s) => (
                        <div key={s.id} className="group flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all">
                          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-50 group-hover:scale-110 transition-transform">
                             {(() => {
                               const Icon = currentCategory ? (iconMap[currentCategory.name_ru] || Wrench) : Wrench;
                               return <Icon className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />;
                             })()}
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <h4 className="font-bold text-slate-900 mb-0.5">{getName(s)}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">{s.note || "Профессиональное выполнение работ любой сложности"}</p>
                          </div>
                          <div className="text-center sm:text-right min-w-[120px]">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">от</p>
                            <p className="text-lg font-black text-slate-900">{s.price_min} <span className="text-xs font-normal text-slate-400">сомони</span></p>
                          </div>
                          <Button 
                            variant="outline" 
                            className="rounded-xl px-6 border-slate-200 font-bold hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shrink-0"
                            onClick={() => setOrderModal({ open: true, serviceId: s.id, name: getName(s) })}
                          >
                            Выбрать
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <button className="w-full mt-8 py-4 text-sm font-bold text-slate-400 hover:text-emerald-500 transition-colors flex items-center justify-center gap-2 border-t border-slate-50">
                      Показать больше услуг <ChevronDown className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatItem icon={<Users className="w-8 h-8 text-emerald-500" />} value="1000+" label="проверенных мастеров" />
            <StatItem icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />} value="5000+" label="выполненных заказов" />
            <StatItem icon={<Star className="w-8 h-8 text-emerald-500" />} value="4.8" label="средний рейтинг сервиса" />
            <StatItem icon={<Trophy className="w-8 h-8 text-emerald-500" />} value="95%" label="довольных клиентов" />
          </div>
        </div>
      </section>

      {/* Info Sections */}
      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* How it works */}
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-8">Как это работает</h3>
              <div className="space-y-8">
                <StepItem num="1" title="Выберите услугу" desc="Выберите нужную услугу и опишите задачу" />
                <StepItem num="2" title="Оставьте заявку" desc="Мы подберём подходящего мастера и свяжемся с вами" />
                <StepItem num="3" title="Мастер приезжает" desc="Мастер приезжает в удобное для вас время" />
                <StepItem num="4" title="Оплата по факту" desc="Вы оплачиваете только после выполнения работы" />
              </div>
            </div>

            {/* Price Formation */}
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-8">Как формируется цена</h3>
              <div className="space-y-6">
                <PriceFactor icon={<LayoutGrid />} title="Сложность работы" desc="Чем сложнее задача, тем выше стоимость" />
                <PriceFactor icon={<MapPin />} title="Расстояние" desc="Удалённость объекта может влиять на цену" />
                <PriceFactor icon={<Clock />} title="Срочность" desc="Срочные заказы выполняются в приоритетном порядке" />
                <PriceFactor icon={<Wrench />} title="Материалы" desc="Стоимость материалов обсуждается отдельно с мастером" />
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-8">Часто задаваемые вопросы</h3>
              <Accordion type="single" collapsible className="space-y-3">
                {[
                  { q: "Сколько стоит вызов мастера?", a: "Вызов мастера бесплатный при условии выполнения работ. В случае отказа стоимость выезда составляет 30 сомони." },
                  { q: "Как быстро приедет мастер?", a: "Обычно мастер приезжает в течение 1 часа по Душанбе. Для срочных заказов — от 30 минут." },
                  { q: "Можно ли выбрать конкретного мастера?", a: "Да, вы можете просмотреть профили мастеров, их рейтинг и отзывы перед выбором." },
                  { q: "Есть ли гарантия на работу?", a: "Да, мы предоставляем официальную гарантию на все виды выполненных работ." },
                  { q: "Как происходит оплата?", a: "Оплата производится наличными или переводом после завершения и проверки всех работ." },
                ].map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border rounded-2xl px-5 bg-slate-50/50 border-transparent hover:border-slate-200 transition-all">
                    <AccordionTrigger className="py-4 hover:no-underline font-bold text-slate-700 text-sm text-left leading-tight">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-500 text-xs leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Link to="#" className="inline-block mt-6 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                Смотреть все вопросы →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="pb-20 bg-white">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="bg-emerald-600 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-emerald-100">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/50 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                  <Headset className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">Не нашли нужную услугу?</h3>
                  <p className="text-emerald-50/80 font-medium">Оставьте заявку, и мы подберём мастера под вашу задачу в Душанбе</p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black">+992 979 117 007</p>
                    <p className="text-xs text-emerald-100 font-medium">WhatsApp / Звонок</p>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  className="bg-white text-emerald-600 hover:bg-emerald-50 font-black rounded-2xl px-10 h-16 shadow-xl active:scale-95 transition-all"
                  onClick={() => setOrderModal({ open: true })}
                >
                  Оставить заявку
                </Button>
              </div>
            </div>
          </div>
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

function BenefitItem({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">{icon}</div>
      <div>
        <p className="text-xs font-black text-slate-900 leading-tight mb-0.5">{title}</p>
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{sub}</p>
      </div>
    </div>
  );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-5">
      <div className="w-16 h-16 rounded-[1.25rem] bg-emerald-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900 leading-none mb-2">{value}</p>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest leading-tight">{label}</p>
      </div>
    </div>
  );
}

function StepItem({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center shrink-0 shadow-lg shadow-emerald-100">
        {num}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function PriceFactor({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 text-sm mb-1">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
