import { useState, useMemo } from "react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Star, MessageCircle, Phone, Users, Award } from "lucide-react";

interface Review {
  author: string;
  category: string;
  rating: number;
  text: string;
  date: string;
}

const REVIEWS: Review[] = [
  { author: "Малика Р.", category: "Электрика", rating: 5, text: "Отличный мастер! Приехал вовремя, быстро устранил проблему с розеткой. Очень вежливый и аккуратный.", date: "2 недели назад" },
  { author: "Фирдавс К.", category: "Кондиционеры", rating: 5, text: "Заказывал установку кондиционера. Работа выполнена идеально, чисто и профессионально.", date: "3 недели назад" },
  { author: "Шахноза М.", category: "Сантехника", rating: 5, text: "Очень удобно, что можно оплатить после работы. Сервис на высшем уровне. Рекомендую!", date: "1 месяц назад" },
  { author: "Умед С.", category: "Отделка и ремонт", rating: 4, text: "Мастер сделал качественную поклейку обоев в двух комнатах. Немного задержался, но результатом доволен.", date: "1 месяц назад" },
  { author: "Гулнора А.", category: "Уборка", rating: 5, text: "Заказала генеральную уборку перед переездом — квартира сияет. Приятные и аккуратные девушки.", date: "1 месяц назад" },
  { author: "Далер Н.", category: "Мебель и двери", rating: 5, text: "Собрали шкаф-купе за пару часов, всё ровно и надёжно закреплено. Спасибо мастеру!", date: "2 месяца назад" },
  { author: "Зарина Х.", category: "Электрика", rating: 4, text: "Поменяли всю проводку в старой квартире. Работали аккуратно, объяснили каждый шаг.", date: "2 месяца назад" },
  { author: "Джамшед Т.", category: "Сантехника", rating: 5, text: "Прорвало трубу поздно вечером — мастер приехал через 40 минут и всё устранил. Реально 24/7.", date: "2 месяца назад" },
  { author: "Наргис П.", category: "Умный дом", rating: 5, text: "Настроили умные розетки и камеры видеонаблюдения. Мастер разбирается в теме, всё работает стабильно.", date: "3 месяца назад" },
];

const CATEGORIES = ["Все", ...Array.from(new Set(REVIEWS.map((r) => r.category)))];

const StarRow = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-700"}`}
      />
    ))}
  </div>
);

const Reviews = () => {
  const [activeCategory, setActiveCategory] = useState("Все");

  const filtered = useMemo(() => {
    if (activeCategory === "Все") return REVIEWS;
    return REVIEWS.filter((r) => r.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative bg-[#F0FDF4] dark:bg-emerald-950/20 border-b border-green-100 dark:border-emerald-900/30 pt-14 pb-16 overflow-hidden">
        <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="container relative px-4 mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-5 inline-flex rounded-full border border-emerald-200 bg-white/80 dark:bg-slate-900/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400 shadow-sm backdrop-blur">
              Отзывы
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-5 tracking-tight">
              Отзывы клиентов из Душанбе
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium mb-10">
              Реальные оценки людей, которые уже вызывали мастеров через Master.TJ.
            </p>

            <div className="inline-flex flex-wrap items-center justify-center gap-8 sm:gap-12 bg-white/70 dark:bg-slate-900/70 backdrop-blur rounded-[2rem] px-8 py-6 border border-white/60 dark:border-slate-700/60 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-500 dark:text-amber-400 fill-current" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-black text-slate-900 dark:text-white leading-none">4.9 / 5</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">средняя оценка</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-black text-slate-900 dark:text-white leading-none">320+</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">отзывов</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-black text-slate-900 dark:text-white leading-none">3000+</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">клиентов</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="py-20">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-none"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((review, i) => (
              <motion.div
                key={`${review.author}-${i}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-900 rounded-[1.75rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <StarRow rating={review.rating} />
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">{review.date}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed flex-1">&laquo;{review.text}&raquo;</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{review.author}</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    {review.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="container px-4 mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-emerald-600 rounded-[2.5rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl shadow-emerald-200/50"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10 flex items-center gap-4 text-center md:text-left">
              <div className="hidden md:flex w-14 h-14 shrink-0 rounded-2xl bg-white/15 items-center justify-center">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Уже пользовались нашими услугами?</h2>
                <p className="text-emerald-50 font-medium opacity-90">Поделитесь своим опытом — это поможет другим выбрать проверенного мастера.</p>
              </div>
            </div>
            <a
              href="https://wa.me/992979117007"
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-emerald-700 shadow-lg transition-all hover:bg-emerald-50 active:scale-95 whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4" />
              Оставить отзыв
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Reviews;
