import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench, ArrowRight } from "lucide-react";
import { tx } from "@/lib/localizeNames";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  master: any;
  onBook?: () => void;
}

// Generate realistic service items based on master categories
const servicesByCategory: Record<string, { name: string; price: number }[]> = {
  "Электрика": [
    { name: "Насб кардани розетка", price: 30 },
    { name: "Иваз кардани симкашӣ", price: 80 },
    { name: "Насб кардани люстра", price: 60 },
    { name: "Насб кардани автомат", price: 50 },
    { name: "Диагностикаи барқ", price: 40 },
  ],
  "Сантехника": [
    { name: "Иваз кардани смеситель", price: 80 },
    { name: "Таъмири обрезонӣ", price: 60 },
    { name: "Насб кардани унитаз", price: 150 },
    { name: "Тоза кардани канализатсия", price: 100 },
    { name: "Насб кардани обгармкунак", price: 200 },
  ],
  "Клининг": [
    { name: "Тозакунии генералӣ", price: 15 },
    { name: "Шустани тиреза", price: 20 },
    { name: "Тоза кардани мубл", price: 80 },
    { name: "Тоза кардани баъди таъмир", price: 20 },
  ],
  "Кондиционеры": [
    { name: "Насб кардани кондитсионер", price: 250 },
    { name: "Тоза кардани кондитсионер", price: 100 },
    { name: "Таъмири кондитсионер", price: 150 },
    { name: "Пур кардани фреон", price: 120 },
  ],
  "Сборка мебели": [
    { name: "Ҷамъ кардани ҷевон", price: 150 },
    { name: "Ҷамъ кардани кат", price: 100 },
    { name: "Ҷамъ кардани ошхона", price: 250 },
    { name: "Насб кардани дарҳои мубл", price: 50 },
  ],
  "Отделка": [
    { name: "Рангкунии девор", price: 25 },
    { name: "Часпонидани обой", price: 30 },
    { name: "Гачкорӣ", price: 35 },
    { name: "Мондани кошин", price: 45 },
  ],
  "Видеонаблюдение": [
    { name: "Насб кардани камера", price: 120 },
    { name: "Танзими системаи мониторинг", price: 200 },
    { name: "Таъмири камера", price: 80 },
  ],
};

// Секция услуг раскладывает специализации мастера по готовым примерам работ и ценам.
export default function MasterServices({ master, onBook }: Props) {
  const { t } = useLanguage();
  const categories = master.service_categories || [];
  
  const services: { name: string; price: number }[] = [];
  for (const cat of categories) {
    const items = servicesByCategory[cat];
    if (items) {
      services.push(...items);
    }
  }

  // Fallback generic services
  if (services.length === 0) {
    services.push(
      { name: "Машварат ва ташхис", price: 50 },
      { name: "Таъмири стандартӣ", price: 100 },
      { name: "Насб кардани таҷҳизот", price: 150 },
      { name: "Кори мураккаб", price: 200 },
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, ease: "easeOut" }}>
      <Card className="group/sec transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-100/50 hover:ring-1 hover:ring-primary/20">
        <CardContent className="p-5 sm:p-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-all duration-500 group-hover/sec:rotate-[-20deg] group-hover/sec:bg-primary"><Wrench className="w-4 h-4 text-primary transition-colors group-hover/sec:text-white" /></span> {tx("Услуги мастера", "Master services", "Хизматҳои мастер")}
          </h2>
          <div className="space-y-2">
            {services.map((svc, i) => (
              <motion.button
                type="button"
                key={i}
                onClick={onBook}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i, 10) * 0.04, duration: 0.35 }}
                whileTap={{ scale: 0.98 }}
                className="group flex w-full items-center justify-between rounded-xl border border-transparent bg-muted/50 p-3 text-left transition-all duration-300 hover:translate-x-1 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md dark:hover:bg-emerald-500/10"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-300 transition-all duration-300 group-hover:scale-150 group-hover:bg-emerald-500" />
                  {svc.name}
                </span>
                <span className="ml-3 flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-primary">
                  {t("mpPriceFrom")} {svc.price} {t("mpCurrency")}
                  <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </span>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
