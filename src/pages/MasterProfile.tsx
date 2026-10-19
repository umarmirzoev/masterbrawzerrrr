import { SUPPORT_PHONE, SUPPORT_WHATSAPP } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star, MapPin, Phone, MessageCircle,
  ArrowLeft, CheckCircle, Zap, ArrowUp,
} from "lucide-react";

import MasterProfileCard from "@/components/master-profile/ProfileCard";
import MasterAbout from "@/components/master-profile/AboutSection";
import MasterServices from "@/components/master-profile/ServicesSection";
import MasterReviews from "@/components/master-profile/ReviewsSection";
import MasterPortfolio from "@/components/master-profile/PortfolioSection";
import MasterDistricts from "@/components/master-profile/DistrictsSection";
import MasterTrust from "@/components/master-profile/TrustBadges";
import SimilarMasters from "@/components/master-profile/SimilarMasters";
import { SAMPLE_MASTERS } from "@/data/seedData";
import MasterBookingBar from "@/components/master-profile/BookingBar";
import MasterBookingDialog from "@/components/master-profile/BookingDialog";

// Страница полного профиля мастера показывает его данные, услуги, отзывы, портфолио и форму бронирования.
export default function MasterProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [master, setMaster] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [similarMasters, setSimilarMasters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [searchParams] = useSearchParams();

  // Загружаем профиль мастера, отзывы, портфолио и похожих специалистов для полной карточки.
  // При переходе на другого мастера (из «Похожих») поднимаемся наверх.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  useEffect(() => {
    // Если Supabase не отвечает, не ждём бесконечно — берём встроенных мастеров.
    const withTimeout = <T,>(p: PromiseLike<T>, ms = 6000): Promise<T> =>
      Promise.race([
        Promise.resolve(p),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
      ]);

    const applySample = () => {
      const sample: any = SAMPLE_MASTERS.find((m) => m.id === id);
      if (!sample) return false;
      setMaster(sample);
      setReviews([]);
      setPortfolio([]);
      setSimilarMasters(
        SAMPLE_MASTERS.filter(
          (m) => m.id !== sample.id && m.service_categories.some((c) => sample.service_categories.includes(c)),
        ).slice(0, 4),
      );
      if (searchParams.get("book") === "1") setBookingOpen(true);
      return true;
    };

    const load = async () => {
      if (!id) return;
      // Встроенный мастер — показываем сразу, без ожидания базы.
      if (applySample()) {
        setLoading(false);
        return;
      }
      try {
        let masterData: any = null;
        const { data: listingData } = await withTimeout(
          supabase.from("master_listings").select("*").eq("id", id).maybeSingle(),
        );

        if (listingData) {
          masterData = listingData;
        } else {
          const { data: listingByUser } = await withTimeout(
            supabase.from("master_listings").select("*").eq("user_id", id).maybeSingle(),
          );
          if (listingByUser) {
            masterData = listingByUser;
          } else {
            const { data: profileData } = await withTimeout(
              supabase.from("profiles").select("*").eq("user_id", id).maybeSingle(),
            );
            masterData = profileData;
          }
        }

        if (!masterData) {
          applySample();
          setLoading(false);
          return;
        }
        setMaster(masterData);
        // «Повторить заказ» / «Заказать снова» из кабинета клиента сразу открывает форму заказа.
        if (searchParams.get("book") === "1") setBookingOpen(true);

        const masterId = masterData.user_id || masterData.id;
        const [reviewsRes, portfolioRes] = await withTimeout(
          Promise.all([
            supabase.from("reviews").select("*").eq("master_id", masterId).order("created_at", { ascending: false }),
            supabase.from("master_portfolio").select("*").eq("master_id", masterId).order("created_at", { ascending: false }),
          ]),
        );

        setReviews(reviewsRes.data || []);
        setPortfolio(portfolioRes.data || []);

        if (masterData.service_categories?.length > 0) {
          const { data: similar } = await withTimeout(
            supabase
              .from("master_listings").select("*")
              .eq("is_active", true).neq("id", masterData.id)
              .contains("service_categories", [masterData.service_categories[0]])
              .order("average_rating", { ascending: false }).limit(4),
          );
          setSimilarMasters(similar || []);
        }
      } catch (error) {
        console.warn("MasterProfile load failed, using sample data:", error);
        if (!master) applySample();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Хук обязан вызываться до любых ранних return, иначе React ругается
  // на разное количество хуков между рендерами.
  const orderedToday = useMemo(() => Math.floor(Math.random() * 5 + 3), [master?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!master) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-muted-foreground">{t("mpNotFound")}</p>
          <Button onClick={() => navigate("/masters")} variant="outline" className="mt-4 rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> {t("mpBackToList")}
          </Button>
        </div>
      </div>
    );
  }

  const completedOrders = Math.round((master.total_reviews || 0) * 2.5 + (master.experience_years || 0) * 15);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-muted/30">
      <Header />
      <ScrollExtras />
      <motion.div aria-hidden className="pointer-events-none absolute left-[-10%] top-40 -z-0 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" animate={{ x: [0, 60, 0], y: [0, 40, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div aria-hidden className="pointer-events-none absolute right-[-10%] top-[30rem] -z-0 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl" animate={{ x: [0, -50, 0], y: [0, 50, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} />

      <div key={id} className="relative container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" className="group mb-4 rounded-full text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/masters"))}>
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" /> {t("mpBack")}
          </Button>
        </motion.div>

        {/* Введение о мастерах */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-6 overflow-hidden p-6 bg-gradient-to-r from-primary/5 to-emerald-500/5 rounded-2xl border border-primary/10 transition-all duration-300 hover:shadow-lg hover:border-primary/25"
        >
          <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500" />
          <p className="text-base text-muted-foreground leading-relaxed">
            {t("mpIntro")}
          </p>
        </motion.div>

        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6">
          {/* Основная колонка раскрывает профиль мастера, его услуги, отзывы и географию работы. */}
          <div className="space-y-5">
            <MasterProfileCard
              master={master}
              reviews={reviews}
              completedOrders={completedOrders}
              onBook={() => setBookingOpen(true)}
            />

            <MasterTrust />
            <MasterAbout master={master} />
            <MasterServices master={master} onBook={() => setBookingOpen(true)} />
            {portfolio.length > 0 && <MasterPortfolio portfolio={portfolio} />}
            <MasterReviews reviews={reviews} master={master} />
            <MasterDistricts master={master} />
          </div>

          {/* Боковая колонка на десктопе фиксирует цену, быстрые контакты и кнопку бронирования. */}
          <div className="hidden lg:block">
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="sticky top-24 space-y-4">
              <Card className="group overflow-hidden shadow-xl border-0 ring-1 ring-primary/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-200/60">
                {/* Высота 210px совпадает с зелёной шапкой карточки мастера — полосы идут вровень. */}
                <div className="h-[210px] bg-gradient-to-br from-primary via-primary to-emerald-400 relative flex flex-col items-center justify-center text-primary-foreground">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
                  <motion.div aria-hidden className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
                  <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                  <p className="relative text-xs uppercase tracking-wider font-medium text-primary-foreground/80">{t("mpServicePrice")}</p>
                  <div className="relative flex items-baseline gap-1 mt-1.5">
                    <span className="text-sm text-primary-foreground/80">{t("mpPriceFrom")}</span>
                    <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 12, delay: 0.35 }} className="inline-block text-4xl font-bold tracking-tight">{master.price_min || 50}</motion.span>
                    <span className="text-lg text-primary-foreground/80">{t("mpCurrency")}</span>
                  </div>
                </div>
                <CardContent className="p-6">

                  {/* Короткие показатели помогают быстро оценить мастера до чтения полного профиля. */}
                  <div className="space-y-3 mb-5">
                    {[
                      { icon: Star, label: t("mpRating"), value: master.average_rating || "5.0", iconClass: "fill-yellow-400 text-yellow-400" },
                      { icon: Zap, label: t("mpResponseTime"), value: t("mpResponseValue"), iconClass: "text-primary" },
                      { icon: CheckCircle, label: t("mpOrdersLabel"), value: String(completedOrders), iconClass: "text-primary" },
                    ].map((item) => (
                      <div key={item.label} className="group/row -mx-2 flex items-center justify-between rounded-xl px-2 py-2 border-b border-border/50 last:border-0 transition-colors duration-300 hover:bg-emerald-50/70 dark:hover:bg-emerald-500/10">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <item.icon className={`w-4 h-4 transition-transform duration-300 group-hover/row:scale-125 group-hover/row:rotate-12 ${item.iconClass}`} /> {item.label}
                        </span>
                        <span className="text-sm font-bold text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Индикатор показывает, что мастер условно доступен для быстрого обращения. */}
                  <div className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                    {t("mpOnline")}
                  </div>

                  <Button
                    size="lg"
                    className="relative w-full overflow-hidden rounded-full h-13 text-base font-semibold shadow-lg shadow-emerald-300/40 bg-gradient-to-r from-primary to-emerald-500 hover:shadow-xl hover:shadow-emerald-400/50 transition-all duration-300 hover:scale-[1.03] active:scale-95"
                    onClick={() => setBookingOpen(true)}
                  >
                    {t("mpBookMaster")}
                  </Button>

                  <div className="flex gap-2 mt-3">
                    {SUPPORT_PHONE && (
                      <>
                        <Button size="sm" variant="outline" className="group/b flex-1 rounded-full gap-1.5 h-10 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white" asChild>
                          <a href={`tel:${SUPPORT_PHONE}`}>
                            <Phone className="w-3.5 h-3.5 transition-transform duration-300 group-hover/b:rotate-12" /> {t("mpCall")}
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" className="group/b flex-1 rounded-full gap-1.5 h-10 transition-all duration-300 hover:-translate-y-0.5 hover:border-green-500 hover:bg-green-500 hover:text-white" asChild>
                          <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="w-3.5 h-3.5 transition-transform duration-300 group-hover/b:-rotate-12" /> WhatsApp
                          </a>
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Небольшой блок социального доверия подталкивает пользователя не откладывать заказ. */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-emerald-500/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-medium text-foreground">
                    🔥 {t("mpOrderedToday", { count: orderedToday })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{t("mpOrderSooner")}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {similarMasters.length > 0 && <SimilarMasters masters={similarMasters} />}
      </div>

      <MasterBookingBar master={master} onBook={() => setBookingOpen(true)} />
      <MasterBookingDialog open={bookingOpen} onOpenChange={setBookingOpen} master={master} />

      {/* Дополнительный отступ нужен, чтобы мобильная панель бронирования не перекрывала контент. */}
      <div className="h-20 lg:hidden" />
      <Footer />
    </div>
  );
}

// Полоса прогресса прокрутки и кнопка «Наверх».
function ScrollExtras() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25, restDelta: 0.001 });
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
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
            className="fixed bottom-24 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-300/50 lg:bottom-6"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
