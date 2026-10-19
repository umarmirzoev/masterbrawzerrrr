import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { tx } from "@/lib/localizeNames";

interface Props {
  reviews: any[];
  master: any;
}

const PER_PAGE = 5;

const clientNames = [
  "Мадина Р.", "Фирдавс К.", "Нигора С.", "Рустам Ш.", "Зарина Х.",
  "Баҳром И.", "Дилноза М.", "Шерзод А.", "Гулнора Т.", "Ҷамшед Н.",
  "Сорбон Д.", "Парвина Б.", "Маликшо З.", "Тоҳира Ғ.", "Файзулло О.",
];

// Секция отзывов собирает средний рейтинг, распределение оценок и клиентские комментарии.
export default function MasterReviews({ reviews, master }: Props) {
  const { t } = useLanguage();
  const [showCount, setShowCount] = useState(PER_PAGE);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length)
    : Number(master.average_rating) || 0;

  const distribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach((r: any) => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++; });
    return dist;
  }, [reviews]);

  const totalReviews = reviews.length || master.total_reviews || 0;
  const visibleReviews = reviews.slice(0, showCount);

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, ease: "easeOut" }}>
      <Card className="group/sec overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-100/50 hover:ring-1 hover:ring-primary/20">
        <CardContent className="p-5 sm:p-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 transition-transform duration-500 group-hover/sec:rotate-[72deg]"><Star className="w-4 h-4 fill-amber-400 text-amber-500" /></span> {tx("Отзывы клиентов", "Client reviews", "Шарҳҳои мизоҷон")}
          </h2>

          {/* Rating summary - premium look */}
          {totalReviews > 0 && (
            <div className="flex flex-col sm:flex-row gap-6 mb-6 p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-emerald-500/5 border border-primary/10">
              <div className="text-center shrink-0 sm:pr-6 sm:border-r sm:border-primary/10">
                <motion.p initial={{ scale: 0.6, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 200, damping: 12 }} className="text-6xl font-bold text-foreground tracking-tight">{avgRating.toFixed(1)}</motion.p>
                <div className="flex gap-0.5 justify-center mt-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`w-5 h-5 ${i <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1.5 font-medium">{t("mpReviewsShort", { count: totalReviews })}</p>
              </div>

              {reviews.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
                  {tx(
                    "Оценка рассчитана по заказам мастера. Отзывы с текстом появятся после ваших заказов.",
                    "Rating is based on the master's orders. Written reviews will appear after orders.",
                    "Баҳо аз рӯи фармоишҳои усто ҳисоб шудааст. Шарҳҳо баъди фармоишҳо пайдо мешаванд.",
                  )}
                </div>
              ) : (
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = distribution[star - 1];
                  const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2.5 text-sm">
                      <div className="flex items-center gap-1 w-8">
                        <span className="font-medium text-foreground">{star}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + (5 - star) * 0.08, duration: 0.7, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-400"
                        />
                      </div>
                      <span className="w-10 text-right text-muted-foreground text-xs font-medium">{count}</span>
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          )}

          {/* Review cards */}
          {reviews.length === 0 ? (
            totalReviews === 0 ? <p className="text-center text-muted-foreground py-8">{tx("Пока нет отзывов", "No reviews yet", "Ҳанӯз шарҳ нест")}</p> : null
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {visibleReviews.map((review: any, idx: number) => {
                  const name = clientNames[idx % clientNames.length];
                  const initial = name.charAt(0);
                  const colors = [
                    "from-primary to-emerald-400",
                    "from-blue-500 to-cyan-400",
                    "from-violet-500 to-purple-400",
                    "from-amber-500 to-orange-400",
                    "from-rose-500 to-pink-400",
                  ];

                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (idx % PER_PAGE) * 0.06 }}
                      whileHover={{ y: -3 }}
                      className="group p-4 sm:p-5 rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:border-emerald-200 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[idx % colors.length]} flex items-center justify-center text-sm font-bold text-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}>
                            {initial}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-foreground block">{name}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"}`} />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <div className="relative pl-4 border-l-2 border-primary/20">
                          <Quote className="w-3.5 h-3.5 text-primary/30 absolute -left-2 -top-0.5 bg-card" />
                          <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {reviews.length > showCount && (
                <div className="text-center pt-3">
                  <Button
                    variant="outline"
                    className="rounded-full px-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white"
                    onClick={() => setShowCount((c) => c + PER_PAGE)}
                  >
                    {tx("Показать ещё", "Show more", "Боз нишон додан")} {Math.min(PER_PAGE, reviews.length - showCount)}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
