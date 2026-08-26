import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Star, MapPin, Clock, Phone, MessageCircle, CheckCircle, Briefcase, TrendingUp } from "lucide-react";

interface Props {
  master: any;
  reviews: any[];
  completedOrders: number;
  onBook: () => void;
}

export default function MasterProfileCard({ master, reviews, completedOrders, onBook }: Props) {
  const { t } = useLanguage();

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
    : master.average_rating || "5.0";

  const initials = master.full_name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2) || "М";
  const totalReviews = reviews.length || master.total_reviews || 0;
  const isTopRated = Number(avgRating) >= 4.5;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden border-0 shadow-xl hover-lift hover-glow">
        {/* Зелёная шапка: аватар, имя, статус и категория — белым прямо на ней.
            Высота 210px совпадает с шапкой карточки цены в боковой колонке. */}
        <div className="relative flex min-h-[210px] flex-col bg-gradient-to-br from-primary via-primary to-emerald-400 px-5 pt-5 pb-6 sm:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.15),transparent_60%)]" />

          <div className="relative flex min-h-[30px] justify-end">
            {isTopRated && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <Badge className="bg-card/95 text-foreground border-0 shadow-lg px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                  <TrendingUp className="w-3.5 h-3.5 mr-1 text-primary" /> {t("mpTopMaster")}
                </Badge>
              </motion.div>
            )}
          </div>

          <div className="relative mt-auto flex flex-col gap-4 pt-2 sm:flex-row sm:items-end sm:gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
              className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border-4 border-white/85 bg-white/20 text-4xl font-bold text-white backdrop-blur-sm sm:h-32 sm:w-32 sm:text-5xl hover-soft"
            >
              {initials}
            </motion.div>

            <div className="min-w-0 sm:pb-1.5">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight break-words">
                  {master.full_name}
                </h1>
                <Badge className="shrink-0 border-white/35 bg-white/20 text-white backdrop-blur-sm">
                  <CheckCircle className="w-3 h-3 mr-1" /> {t("mpVerified")}
                </Badge>
              </div>

              {master.service_categories?.length > 0 && (
                <p className="mt-2 text-base font-medium text-white/85">{master.service_categories[0]}</p>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-5 sm:p-8">
          {/* Рейтинг */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-accent px-3 py-1.5 rounded-full">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(Number(avgRating)) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <span className="text-base font-bold">{avgRating}</span>
              <span className="text-muted-foreground text-sm">({totalReviews})</span>
            </div>
          </div>

          {/* Короткие показатели */}
          <div className="flex flex-wrap gap-2 mt-4">
            {master.experience_years > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm font-medium text-foreground">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" /> {t("mpExperience", { count: master.experience_years })}
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm font-medium text-foreground">
              <Briefcase className="w-3.5 h-3.5 text-muted-foreground" /> {t("mpOrdersChip", { count: completedOrders })}
            </div>
            {master.working_districts?.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm font-medium text-foreground">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {master.working_districts[0]}
              </div>
            )}
          </div>

          {/* Цена — только там, где нет боковой колонки с той же ценой. */}
          <div className="mt-5 inline-flex items-baseline gap-1 px-5 py-3 rounded-2xl bg-primary/5 border border-primary/15 lg:hidden">
            <span className="text-sm text-muted-foreground">{t("mpPriceFrom")}</span>
            <span className="text-3xl font-bold text-foreground">{master.price_min || 50}</span>
            <span className="text-base text-muted-foreground">{t("mpCurrency")}</span>
          </div>

          {/* Категории */}
          {master.service_categories?.length > 1 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {master.service_categories.map((cat: string) => (
                <Badge key={cat} variant="secondary" className="text-sm px-3 py-1.5">{cat}</Badge>
              ))}
            </div>
          )}

          {/* Доступность */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-5 flex items-center gap-2 text-sm"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-muted-foreground">{t("mpOnlineNote")}</span>
          </motion.div>

          {/* Кнопки для мобильных и планшетов */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 lg:hidden">
            <Button
              size="lg"
              className="flex-1 rounded-full h-13 text-base font-semibold shadow-lg bg-gradient-to-r from-primary to-emerald-500 hover:shadow-xl transition-shadow hover-soft"
              onClick={onBook}
            >
              {t("mpBookMaster")}
            </Button>
            {master.phone && (
              <div className="flex gap-2">
                <Button size="lg" variant="outline" className="flex-1 rounded-full h-12 gap-2 hover-soft" asChild>
                  <a href={`tel:${master.phone}`}><Phone className="w-4 h-4" /> {t("mpCall")}</a>
                </Button>
                <Button size="lg" variant="outline" className="flex-1 rounded-full h-12 gap-2 hover-soft" asChild>
                  <a href={`https://wa.me/${master.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
