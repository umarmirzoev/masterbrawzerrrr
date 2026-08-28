import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Search, ClipboardList, UserCheck, Wrench, Wallet, ShieldCheck,
  Phone, MessageCircle, Star, Clock, CheckCircle2, ArrowRight,
} from "lucide-react";

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Search,
      title: t("howItWorksStep1Title"),
      desc: t("howItWorksStep1Desc"),
    },
    {
      icon: ClipboardList,
      title: t("howItWorksStep2Title"),
      desc: t("howItWorksStep2Desc"),
    },
    {
      icon: Wrench,
      title: t("howItWorksStep3Title"),
      desc: t("howItWorksStep3Desc"),
    },
  ];

  const afterSteps = [
    { icon: UserCheck, title: "Мастер подтверждает заказ", desc: "Специалист получает заявку, связывается с вами и уточняет детали перед выездом." },
    { icon: Clock, title: "Приезжает точно ко времени", desc: "В среднем мастер добирается за 45–60 минут в зависимости от района Душанбе." },
    { icon: CheckCircle2, title: "Выполняет работу", desc: "Ремонт, установка или обслуживание — мастер работает аккуратно и объясняет, что делает." },
    { icon: Wallet, title: "Вы оплачиваете после проверки", desc: "Наличными или переводом — только когда убедились, что всё сделано качественно." },
  ];

  const guarantees = [
    { icon: ShieldCheck, title: "Проверенные мастера", desc: "Каждый специалист проходит проверку документов и опыта перед подключением к платформе." },
    { icon: Star, title: "Рейтинг и отзывы", desc: "Вы видите реальные оценки и отзывы клиентов о каждом мастере ещё до заказа." },
    { icon: Phone, title: "Поддержка 24/7", desc: "Если что-то пошло не так — наша служба поддержки на связи в любое время." },
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
              Как это работает
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-5 tracking-tight">
              {t("howItWorksTitle")}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
              От заявки до готовой работы — простой и прозрачный путь, без скрытых шагов и лишних звонков.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3 steps */}
      <section className="py-20">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800"
              >
                <div className="absolute -top-5 -left-2 text-7xl font-black text-emerald-50 dark:text-emerald-500/10 select-none">
                  {i + 1}
                </div>
                <div className="relative w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="relative text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                <p className="relative text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* After order timeline */}
      <section className="py-20 bg-[#f9fafb] dark:bg-slate-900/60">
        <div className="container px-4 mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              Что происходит после заявки
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Подробный путь заказа — чтобы вы точно знали, чего ожидать на каждом шаге.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {afterSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-20">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6">
            {guarantees.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 bg-emerald-50/60 dark:bg-emerald-500/10 rounded-2xl p-6"
              >
                <div className="w-11 h-11 shrink-0 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                  <item.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">{item.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link to="/guarantee" className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group">
              Подробнее об условиях гарантии
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="container px-4 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-emerald-600 rounded-[2.5rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl shadow-emerald-200/50"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">Готовы попробовать?</h2>
              <p className="text-emerald-50 text-lg font-medium opacity-90">Оставьте заявку — мастер приедет уже сегодня.</p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <a href="https://wa.me/992979117007" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-emerald-700 shadow-lg transition-all hover:bg-emerald-50 active:scale-95">
                <MessageCircle className="w-4 h-4" />
                Написать в WhatsApp
              </a>
              <a href="tel:+992979117007" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/15 px-6 py-4 text-sm font-black text-white border border-white/25 transition-all hover:bg-white/25 active:scale-95">
                <Phone className="w-4 h-4" />
                +992 979 117 007
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;
