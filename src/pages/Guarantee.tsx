import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import {
  ShieldCheck, BadgeCheck, RotateCcw, Wallet, Phone, MessageCircle,
  FileCheck2, Star, Clock, HeartHandshake,
} from "lucide-react";

const Guarantee = () => {
  const periods = [
    { category: "Электрика", period: "6 месяцев" },
    { category: "Сантехника", period: "12 месяцев" },
    { category: "Отделка и ремонт", period: "12 месяцев" },
    { category: "Бытовая техника", period: "3 месяца" },
    { category: "Кондиционеры и климат", period: "6 месяцев" },
    { category: "Мелкие работы", period: "3 месяца" },
  ];

  const steps = [
    { icon: FileCheck2, title: "Проверка мастеров", desc: "Каждый специалист подтверждает документы, опыт и проходит модерацию перед тем, как начать принимать заказы." },
    { icon: Star, title: "Открытые отзывы", desc: "Оценки и комментарии клиентов нельзя скрыть или удалить — вы всегда видите реальную репутацию мастера." },
    { icon: Wallet, title: "Оплата по факту", desc: "Вы платите только после того, как приняли работу — предоплата не требуется." },
    { icon: RotateCcw, title: "Бесплатный повторный визит", desc: "Если в течение гарантийного срока проявилась та же неисправность, мастер приезжает и устраняет её без дополнительной оплаты за работу." },
  ];

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
              Гарантии
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-5 tracking-tight">
              Мы отвечаем за качество каждой работы
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
              Master.TJ подключает только проверенных специалистов и даёт официальную гарантию на выполненные работы.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How guarantee works */}
      <section className="py-20">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-6">
            {steps.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-5 bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-100 dark:border-slate-800 shadow-sm"
              >
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee periods table */}
      <section className="py-20 bg-[#f9fafb] dark:bg-slate-900/60">
        <div className="container px-4 mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              Сроки гарантии по категориям
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Ориентировочные сроки — точный срок гарантии на конкретную работу мастер озвучивает до начала заказа.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
          >
            {periods.map((row, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-6 sm:px-8 py-5 ${
                  i !== periods.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <BadgeCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white">{row.category}</span>
                </div>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full">
                  {row.period}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* What if something goes wrong */}
      <section className="py-20">
        <div className="container px-4 mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-10 md:p-14 text-white relative overflow-hidden"
          >
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/10 flex items-center justify-center">
                <HeartHandshake className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-black mb-3">Если что-то пошло не так</h2>
                <p className="text-slate-300 leading-relaxed max-w-2xl">
                  Свяжитесь с нашей поддержкой в течение гарантийного срока — опишите проблему и приложите фото при возможности.
                  Мы направим мастера для бесплатного исправления или поможем найти другое решение.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <a href="https://wa.me/992979117007" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 px-6 py-3.5 text-sm font-black text-white transition-all active:scale-95">
                  <MessageCircle className="w-4 h-4" />
                  Написать в поддержку
                </a>
                <a href="tel:+992979117007" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/15 px-6 py-3.5 text-sm font-black text-white border border-white/15 transition-all active:scale-95">
                  <Phone className="w-4 h-4" />
                  +992 979 117 007
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Guarantee;
