import { useState } from "react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, ChevronDown, Zap, Droplets, Snowflake, Hammer, Wallet, Shield,
} from "lucide-react";

interface Post {
  icon: React.ElementType;
  color: string;
  tag: string;
  title: string;
  readTime: string;
  excerpt: string;
  content: string[];
}

const POSTS: Post[] = [
  {
    icon: Droplets,
    color: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
    tag: "Сантехника",
    title: "Как выбрать сантехника и не переплатить",
    readTime: "4 мин",
    excerpt: "На что смотреть перед вызовом мастера: опыт, отзывы, фиксированная цена и что должно быть включено в стоимость.",
    content: [
      "Перед вызовом мастера уточните, входит ли диагностика в стоимость выезда и что произойдёт, если понадобятся дополнительные детали.",
      "Смотрите на рейтинг и количество отзывов, а не только на среднюю оценку — мастер с 200 отзывами и 4.8 обычно надёжнее, чем с 3 отзывами и 5.0.",
      "Просите называть цену до начала работ, а не по факту. На Мастер ТЧ мастера обязаны согласовать стоимость заранее.",
      "Если проблема периодически повторяется — уточните гарантийный срок на работу, чтобы повторный визит при той же неисправности был бесплатным.",
    ],
  },
  {
    icon: Zap,
    color: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    tag: "Электрика",
    title: "5 признаков, что пора менять проводку",
    readTime: "3 мин",
    excerpt: "Запах гари, искрящие розетки и постоянно выбивающие автоматы — сигналы, которые нельзя игнорировать.",
    content: [
      "Розетки нагреваются или искрят при подключении бытовой техники — явный признак изношенной проводки или плохого контакта.",
      "Автоматы в щитке выбивает без видимой причины чаще одного раза в неделю.",
      "Чувствуется запах гари рядом с розетками или выключателями — это повод немедленно обесточить участок и вызвать электрика.",
      "Свет мигает при включении крупной техники (стиральной машины, чайника) — возможна перегрузка старой проводки.",
      "Проводке больше 20–25 лет и она ни разу не обновлялась — даже без явных симптомов стоит сделать плановую проверку.",
    ],
  },
  {
    icon: Snowflake,
    color: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    tag: "Кондиционеры",
    title: "Как ухаживать за кондиционером летом",
    readTime: "3 мин",
    excerpt: "Простые шаги, которые продлевают срок службы кондиционера и снижают расход электроэнергии в жару Душанбе.",
    content: [
      "Чистите или меняйте фильтры каждые 2–4 недели в сезон активного использования — грязный фильтр снижает эффективность охлаждения на 20–30%.",
      "Не выставляйте температуру слишком низко — разница более 8–10°C с улицей увеличивает нагрузку на компрессор.",
      "Раз в год делайте профилактику: чистку теплообменника и проверку уровня фреона у мастера.",
      "Следите, чтобы наружный блок не был закрыт вещами или растениями — это ухудшает теплообмен.",
    ],
  },
  {
    icon: Hammer,
    color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    tag: "Отделка и ремонт",
    title: "Ремонт или замена: когда что выгоднее",
    readTime: "5 мин",
    excerpt: "Не всегда нужно менять сантехнику, мебель или технику целиком — иногда ремонт обходится в разы дешевле.",
    content: [
      "Если стоимость ремонта превышает 50–60% от цены нового изделия — чаще выгоднее заменить, особенно для бытовой техники старше 7–8 лет.",
      "Смесители, ручки дверей и фурнитуру почти всегда дешевле отремонтировать или заменить локально, чем менять весь узел.",
      "Перед решением попросите мастера дать два варианта: стоимость ремонта и стоимость замены — сравните разницу и ожидаемый срок службы.",
      "Для сложной техники (стиральные машины, кондиционеры) ремонт обычно оправдан, если возраст устройства меньше половины среднего срока службы.",
    ],
  },
  {
    icon: Wallet,
    color: "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400",
    tag: "Полезно",
    title: "Как заранее оценить стоимость ремонта",
    readTime: "4 мин",
    excerpt: "Чтобы бюджет не разъехался в процессе — несколько шагов для реалистичной оценки затрат до начала работ.",
    content: [
      "Составьте список работ по комнатам и отдельно посчитайте материалы и работу мастера — это сразу покажет, где можно сэкономить.",
      "Закладывайте резерв 10–15% сверх сметы на непредвиденные расходы — скрытые дефекты стен, труб или проводки встречаются часто.",
      "Сравнивайте цены минимум у двух-трёх мастеров перед началом крупных работ — в каталоге Мастер ТЧ это можно сделать без лишних звонков.",
      "Фиксируйте согласованную цену в переписке или чеке — это упрощает разговор, если после начала работ появляются дополнительные пункты.",
    ],
  },
  {
    icon: Shield,
    color: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400",
    tag: "Безопасность",
    title: "Как безопасно впускать мастера в дом",
    readTime: "3 мин",
    excerpt: "Несколько простых привычек, которые стоит соблюдать при вызове специалиста на дом — особенно если вы дома одни.",
    content: [
      "Заказывайте мастеров через проверенные платформы, где у специалиста есть подтверждённый профиль, отзывы и рейтинг.",
      "Уточняйте имя и примерное время прибытия мастера заранее — так проще узнать нужного человека при встрече.",
      "Не передавайте предоплату наличными до начала работ — на Мастер ТЧ оплата происходит после выполнения заказа.",
      "Если что-то смущает в поведении мастера — вы вправе прекратить работу и сообщить в поддержку.",
    ],
  },
];

const Blog = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
              Блог
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-5 tracking-tight">
              Советы по дому от Мастер ТЧ
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
              Короткие практичные статьи о ремонте, технике и уходе за домом в Душанбе.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-20">
        <div className="container px-4 mx-auto max-w-3xl space-y-5">
          {POSTS.map((post, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="bg-white dark:bg-slate-900 rounded-[1.75rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-start sm:items-center gap-4 p-6 text-left"
                >
                  <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${post.color}`}>
                    <post.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                        {post.tag}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                        <Clock className="w-3 h-3" />
                        {post.readTime} чтения
                      </span>
                    </div>
                    <h2 className="font-bold text-slate-900 dark:text-white leading-snug">{post.title}</h2>
                    {!isOpen && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{post.excerpt}</p>
                    )}
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-7 pl-[4.5rem] space-y-3">
                        {post.content.map((paragraph, pi) => (
                          <p key={pi} className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
