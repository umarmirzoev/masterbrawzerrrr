import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Clock, MapPin, ArrowRight } from "lucide-react";
import { tx } from "@/lib/localizeNames";
import { useLanguage } from "@/contexts/LanguageContext";
import { personName, personInitials } from "@/lib/localizeNames";

interface Props {
  masters: any[];
}

const gradients = [
  "from-primary to-emerald-400",
  "from-blue-500 to-cyan-400",
  "from-violet-500 to-purple-400",
  "from-amber-500 to-orange-400",
];

export default function SimilarMasters({ masters }: Props) {
  const { t } = useLanguage();
  // Блок похожих мастеров помогает быстро сравнить альтернативных специалистов.
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-10">
      <h2 className="text-xl font-bold text-foreground mb-4">{tx("Похожие мастера", "Similar masters", "Устоҳои монанд")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {masters.slice(0, 4).map((m, i) => {
          const initials = personInitials(m.full_name);
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ y: -6 }} whileTap={{ scale: 0.97 }}>
            <Link to={`/masters/${m.id}`} className="block h-full">
              <Card className="group relative overflow-hidden h-full transition-all duration-300 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/60">
                <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-50/70 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <div className={`h-1.5 bg-gradient-to-r ${gradients[i % gradients.length]}`} />
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white font-bold text-sm shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate text-sm transition-colors group-hover:text-emerald-600">{personName(m.full_name)}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{m.average_rating}</span>
                        <span>·</span>
                        <Clock className="w-3 h-3" />
                        <span>{m.experience_years} {tx("лет", "yrs", "сол")}</span>
                      </div>
                    </div>
                  </div>
                  <p className="flex items-center justify-between text-sm font-semibold text-primary">
                    <span>{t("mpPriceFrom")} {m.price_min || 50} {t("mpCurrency")}</span>
                    <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </p>
                </CardContent>
              </Card>
            </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
