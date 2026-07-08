import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Banknote,
  CheckCircle,
  Clock3,
  Headphones,
  Star,
  Users,
  Shield,
  Sparkles,
  MessageCircle,
  Wrench,
  Handshake,
  UserCheck,
  ShieldCheck,
  Timer,
  PhoneCall,
  Heart,
  Gauge,
  Target,
  Lock,
} from "lucide-react";

const About = () => {
  const heroImage = new URL("../hero-cropped.jpg", import.meta.url).href;
  const missionImage = new URL("../п.jpg", import.meta.url).href;

  const topStats = [
    { icon: Users, value: "1000+", label: "проверенных мастеров" },
    { icon: BadgeCheck, value: "5000+", label: "выполненных заявок" },
    { icon: Wrench, value: "120+", label: "видов услуг" },
    { icon: Star, value: "4.8", label: "средняя оценка" },
    { icon: Heart, value: "95%", label: "довольных клиентов" },
  ];

  const clientBenefits = [
    { icon: Timer, title: "Быстро", desc: "Находим мастера за 30 минут и отправляем к вам в удобное время." },
    { icon: UserCheck, title: "Надёжно", desc: "Только проверенные специалисты с опытом и реальными отзывами." },
    { icon: Sparkles, title: "Чисто", desc: "Проводим гарантийный контроль и придерживаемся стандартов сервиса." },
    { icon: ShieldCheck, title: "С гарантией", desc: "Гарантия на все работы до 30 дней после завершения заказа." },
  ];

  const masterAdvantages = [
    { icon: Banknote, title: "Постоянные заказы", desc: "Стабильный поток заявок каждый день по всему городу." },
    { icon: Handshake, title: "Свободный график", desc: "Работайте тогда, когда удобно именно вам." },
    { icon: Shield, title: "Честная система", desc: "Прозрачные условия и понятные выплаты без скрытых комиссий." },
    { icon: Headphones, title: "Поддержка 24/7", desc: "Администратор всегда на связи и помогает по всем вопросам." },
    { icon: Clock3, title: "Быстрые выплаты", desc: "Получайте оплату оперативно после выполнения заказов." },
    { icon: Lock, title: "Безопасные заказы", desc: "Работаем по правилам сервиса и защищаем ваши интересы." },
  ];

  const values = [
    { icon: ShieldCheck, title: "Надёжность", desc: "Мы работаем на качество и выполняем обещания." },
    { icon: Gauge, title: "Скорость", desc: "Ценим ваше время и быстро закрываем заявки." },
    { icon: Target, title: "Качество", desc: "Каждый заказ проходит контроль перед закрытием." },
    { icon: Heart, title: "Честность", desc: "Прозрачные условия оплаты и открытая коммуникация." },
  ];

  return (
    <div className="min-h-screen bg-[#f7f9f8]">
      <Header />

      <section className="bg-white pb-8 pt-10 md:pt-14">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">О компании</p>
              <h1 className="mb-5 text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
                Мастер ТЧ — сервис,
                <br />
                которому доверяют
                <br />в Душанбе
              </h1>
              <p className="mb-5 text-sm leading-6 text-slate-600 md:text-base">
                Мы объединяем клиентов и проверенных мастеров, чтобы любые бытовые задачи решались
                быстро, безопасно и по прозрачной цене.
              </p>
              <ul className="mb-7 space-y-2">
                {[
                  "Более 1000 проверенных мастеров",
                  "Честные фиксированные цены",
                  "Быстрый выезд в течение 30 минут",
                  "Работаем по всему Душанбе",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/categories"
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Выбрать услугу
                </Link>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("about-contacts")?.scrollIntoView({ behavior: "smooth" })}
                  className="rounded-lg border-emerald-200 px-6 py-3 text-sm text-emerald-700 hover:bg-emerald-50"
                >
                  Есть вопросы
                </Button>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative group lg:ml-10"
            >
              {/* Background glow effects */}
              <div className="absolute -inset-10 bg-emerald-500/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="absolute -inset-10 bg-sky-500/5 blur-[80px] rounded-full translate-x-20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-100" />
              
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white bg-white shadow-[0_32px_80px_-16px_rgba(15,23,42,0.15)] hover-lift transition-all duration-700">
                <div className="relative h-[420px] md:h-[480px] overflow-hidden">
                  <img
                    src={heroImage}
                    alt="Мастер ТЧ"
                    className="h-full w-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
                
                {/* Integrated Info Panel */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-5 md:p-6 border border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center justify-between transition-transform duration-500 group-hover:translate-y-[-4px]">
                    <div>
                      <p className="text-xl font-black text-slate-900 leading-tight mb-1">Мастер ТЧ</p>
                      <p className="text-sm text-slate-500 font-semibold tracking-wide">Ремонт, уборка, электрика</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-2xl text-sm font-black shadow-lg shadow-emerald-200 transition-colors group-hover:bg-emerald-600">
                        <Star className="h-4 w-4 fill-current" />
                        4.8
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 uppercase tracking-[0.2em] font-bold">рейтинг</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 hidden lg:block">
                <div className="h-20 w-20 rounded-3xl bg-white shadow-xl border border-slate-100 flex items-center justify-center animate-bounce-slow">
                   <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Wrench className="h-5 w-5" />
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {topStats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <Icon className="mx-auto mb-2 h-5 w-5 text-emerald-600" />
                  <p className="text-2xl font-extrabold text-slate-900">{item.value}</p>
                  <p className="text-xs text-slate-500">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-center text-2xl font-bold text-slate-900 md:text-3xl">Что мы даём клиентам</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {clientBenefits.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-xs leading-5 text-slate-500">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-center text-2xl font-bold text-slate-900 md:text-3xl">Преимущества для мастеров</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {masterAdvantages.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-[#fbfcfb] p-4 text-center">
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="mb-1 text-sm font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-xs leading-5 text-slate-500">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-5 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[#f8f8f6] p-8 md:p-10 shadow-sm hover-soft hover-glow min-h-[340px] flex flex-col justify-center"
            >
              <div className="relative z-10 max-w-full md:max-w-[60%]">
                <h3 className="mb-4 text-3xl font-black text-slate-900">Наша миссия</h3>
                <p className="text-base leading-relaxed text-slate-600 mb-3">
                  Сделать жизнь в Душанбе комфортнее, соединяя людей с надёжными мастерами.
                </p>
                <p className="text-base leading-relaxed text-slate-600">
                  Мы ценим ваше время, доверие и стремимся к лучшему сервису каждый день.
                </p>
              </div>
              <div className="absolute -bottom-4 -right-4 top-0 hidden w-[60%] md:block">
                <img
                  src={missionImage}
                  alt="Машина сервиса"
                  className="h-full w-full object-contain object-right-bottom transition-transform duration-700 group-hover:scale-110 group-hover:-translate-x-4"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#f8f8f6] via-[#f8f8f6]/50 to-transparent pointer-events-none" />
              </div>
              <div className="mt-8 block md:hidden">
                <div className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm">
                  <img
                    src={missionImage}
                    alt="Машина сервиса"
                    className="h-40 w-full object-contain"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[#f8f8f6] p-8 md:p-10 shadow-sm hover-soft hover-glow min-h-[340px] flex flex-col justify-center"
            >
              <div className="relative z-10 max-w-full md:max-w-[70%]">
                <h3 className="mb-4 text-3xl font-black text-slate-900">Безопасность и гарантии</h3>
                <p className="mb-6 text-base leading-relaxed text-slate-600">
                  Мы заботимся о вашей безопасности и качестве услуг. Каждый мастер проходит проверку, а каждая работа
                  выполняется с гарантией.
                </p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {[
                    "Проверка документов",
                    "Реальные отзывы",
                    "Гарантия на работы",
                    "Поддержка 24/7",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle className="h-3 w-3" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="absolute -bottom-10 -right-10 hidden md:block">
                <div className="flex h-64 w-64 items-center justify-center rounded-full bg-emerald-50/50">
                  <ShieldCheck className="h-40 w-40 text-emerald-500/20" strokeWidth={1} />
                </div>
              </div>
              <div className="absolute right-6 top-6 hidden lg:block">
                <div className="rounded-2xl bg-white/80 p-3 shadow-xl backdrop-blur-sm border border-emerald-50">
                   <ShieldCheck className="h-10 w-10 text-emerald-600" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-center text-2xl font-bold text-slate-900 md:text-3xl">Наши ценности</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-[#fbfcfb] p-5 text-center">
                  <div className="mx-auto mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-xs leading-5 text-slate-500">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="about-contacts" className="py-10">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-emerald-600 p-6 text-white md:p-8">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                Есть вопросы? Мы на связи!
              </p>
              <h2 className="mb-2 text-2xl font-bold md:text-3xl">+992 979 117 007</h2>
              <p className="mb-5 text-sm text-emerald-50">WhatsApp / Звонки</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
                <a href="https://wa.me/992979117007" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Написать в WhatsApp
                </a>
              </Button>
              <Link
                to="/categories"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                Выбрать услугу
              </Link>
              <a
                href="tel:+992979117007"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                <PhoneCall className="mr-2 h-4 w-4" />
                Позвонить
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
