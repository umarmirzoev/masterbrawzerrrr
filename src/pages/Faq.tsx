import { useState } from "react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import {
  ClipboardList, Wallet, Users, ShieldCheck, MessageCircle, Phone,
  HelpCircle,
} from "lucide-react";

const FAQ_GROUPS = [
  {
    title: "Заказ и мастера",
    icon: ClipboardList,
    items: [
      { q: "Как заказать мастера?", a: "Оставьте заявку на сайте через форму быстрого заказа, выберите мастера в каталоге или позвоните нам напрямую — мы подберём специалиста в течение нескольких минут." },
      { q: "Можно ли выбрать конкретного мастера?", a: "Да. В каталоге мастеров можно посмотреть профиль, рейтинг, отзывы и опыт каждого специалиста и выбрать того, кто вам подходит." },
      { q: "Как быстро приедет мастер?", a: "В среднем — 45–60 минут после подтверждения заказа, в зависимости от района Душанбе и загруженности дорог." },
      { q: "Можно ли заказать мастера на определённое время?", a: "Да, при оформлении заявки укажите удобную дату и время — мастер подстроится под ваш график." },
    ],
  },
  {
    title: "Оплата и цены",
    icon: Wallet,
    items: [
      { q: "Сколько стоит вызов мастера?", a: "Выезд для осмотра и консультации бесплатен при условии, что вы заказываете работы. Если вы откажетесь от работ после осмотра, стоимость выезда — 30 сомони." },
      { q: "Как оплатить услуги?", a: "Наличными мастеру или переводом на карту/кошелёк — после того как работа выполнена и вы её проверили." },
      { q: "Цены в прайс-листе окончательные?", a: "Цены в разделе «Услуги» — ориентировочные. Точную стоимость мастер называет после осмотра объекта, до начала работ." },
    ],
  },
  {
    title: "Мастера и доверие",
    icon: Users,
    items: [
      { q: "Кто такие мастера Мастер ТЧ?", a: "Это независимые специалисты, прошедшие проверку документов и опыта перед подключением к платформе. Их работу оценивают реальные клиенты." },
      { q: "Как стать мастером на платформе?", a: "Заполните анкету в разделе «Стать мастером» — модерация обычно занимает 1–2 рабочих дня." },
    ],
  },
  {
    title: "Гарантия и поддержка",
    icon: ShieldCheck,
    items: [
      { q: "Какие гарантии на работу?", a: "Мы предоставляем официальную гарантию на все виды выполненных работ. Срок зависит от типа услуги и составляет от 3 до 12 месяцев." },
      { q: "Что делать, если что-то пошло не так?", a: "Свяжитесь с поддержкой по телефону или в WhatsApp в течение гарантийного срока — мы направим мастера для бесплатного устранения проблемы." },
      { q: "Работаете ли вы круглосуточно?", a: "Да, приём заявок и поддержка работают 24/7, без выходных." },
    ],
  },
];

const FAQ = () => {
  const [activeGroup, setActiveGroup] = useState(0);

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
              Вопросы и ответы
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-5 tracking-tight">
              Отвечаем на частые вопросы
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
              Не нашли ответ? Напишите нам — служба поддержки на связи 24/7.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category tabs + accordion */}
      <section className="py-20">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {FAQ_GROUPS.map((group, i) => (
              <button
                key={i}
                onClick={() => setActiveGroup(i)}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
                  activeGroup === i
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-none"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800"
                }`}
              >
                <group.icon className="w-4 h-4" />
                {group.title}
              </button>
            ))}
          </div>

          <motion.div
            key={activeGroup}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Accordion type="single" collapsible className="w-full space-y-4">
              {FAQ_GROUPS[activeGroup].items.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${activeGroup}-${i}`}
                  className="border-none bg-white dark:bg-slate-900 rounded-[2rem] px-6 shadow-sm border border-slate-100 dark:border-slate-800"
                >
                  <AccordionTrigger className="text-left font-bold text-slate-900 dark:text-white hover:no-underline py-6">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-500 dark:text-slate-400 leading-relaxed pb-6">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Still have questions CTA */}
      <section className="pb-20">
        <div className="container px-4 mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-emerald-50 dark:bg-emerald-500/10 rounded-[2rem] p-10 text-center flex flex-col items-center gap-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
              <HelpCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Остались вопросы?</h2>
              <p className="text-slate-500 dark:text-slate-400">Напишите нам — ответим в течение часа.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="https://wa.me/992979117007" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 px-6 py-3.5 text-sm font-black text-white transition-all active:scale-95">
                <MessageCircle className="w-4 h-4" />
                Написать в WhatsApp
              </a>
              <a href="tel:+992979117007" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-3.5 text-sm font-black text-slate-700 dark:text-slate-200 transition-all hover:border-emerald-300 active:scale-95">
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

export default FAQ;
