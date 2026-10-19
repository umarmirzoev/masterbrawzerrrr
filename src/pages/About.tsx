import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { tx } from "@/lib/localizeNames";
import { useLanguage } from "@/contexts/LanguageContext";
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
  ArrowUp,
  ArrowRight,
  HardHat,
} from "lucide-react";

const About = () => {
  const { t } = useLanguage();
  // Временные стоковые изображения — замени на реальные фото компании.
  const heroImage = "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&h=1400&fit=crop";
  const missionImage = "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1000&h=800&fit=crop";

  const topStats = [
    { icon: Users, value: "1000+", label: t("aboutPageStat1") },
    { icon: BadgeCheck, value: "5000+", label: t("aboutPageStat2") },
    { icon: Wrench, value: "120+", label: t("aboutPageStat3") },
    { icon: Star, value: "4.8", label: t("aboutPageStat4") },
    { icon: Heart, value: "95%", label: t("aboutPageStat5") },
  ];

  const clientBenefits = [
    { icon: Timer, title: t("aboutPageBenefit1Title"), desc: t("aboutPageBenefit1Desc") },
    { icon: UserCheck, title: t("aboutPageBenefit2Title"), desc: t("aboutPageBenefit2Desc") },
    { icon: Sparkles, title: t("aboutPageBenefit3Title"), desc: t("aboutPageBenefit3Desc") },
    { icon: ShieldCheck, title: t("aboutPageBenefit4Title"), desc: t("aboutPageBenefit4Desc") },
  ];

  const masterAdvantages = [
    { icon: Banknote, title: t("aboutPageAdv1Title"), desc: t("aboutPageAdv1Desc") },
    { icon: Handshake, title: t("aboutPageAdv2Title"), desc: t("aboutPageAdv2Desc") },
    { icon: Shield, title: t("aboutPageAdv3Title"), desc: t("aboutPageAdv3Desc") },
    { icon: Headphones, title: t("aboutPageAdv4Title"), desc: t("aboutPageAdv4Desc") },
    { icon: Clock3, title: t("aboutPageAdv5Title"), desc: t("aboutPageAdv5Desc") },
    { icon: Lock, title: t("aboutPageAdv6Title"), desc: t("aboutPageAdv6Desc") },
  ];

  const values = [
    { icon: ShieldCheck, title: t("aboutPageValue1Title"), desc: t("aboutPageValue1Desc") },
    { icon: Gauge, title: t("aboutPageValue2Title"), desc: t("aboutPageValue2Desc") },
    { icon: Target, title: t("aboutPageValue3Title"), desc: t("aboutPageValue3Desc") },
    { icon: Heart, title: t("aboutPageValue4Title"), desc: t("aboutPageValue4Desc") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ScrollExtras />

      <section className="relative overflow-hidden bg-white dark:bg-slate-900 pb-8 pt-10 md:pt-14">
        <motion.div aria-hidden className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/10" animate={{ x: [0, 60, 0], y: [0, 40, 0] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div aria-hidden className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-teal-200/30 blur-3xl dark:bg-teal-500/10" animate={{ x: [0, -40, 0], y: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} />
        <div className="relative container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}>
              <motion.p variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:bg-emerald-500/10">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> {t("aboutPageBadge")}
              </motion.p>
              <motion.h1 variants={fadeUp} className="mb-5 text-4xl font-extrabold leading-tight text-slate-900 dark:text-white md:text-5xl">
                {t("aboutPageHeroTitle1")}
                <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-[length:200%_auto] bg-clip-text text-transparent animate-[shine_4s_linear_infinite]">{t("aboutPageHeroTitle2")}</span>
                <br />{t("aboutPageHeroTitle3")}
              </motion.h1>
              <motion.p variants={fadeUp} className="mb-5 text-sm leading-6 text-slate-600 dark:text-slate-300 md:text-base">
                {t("aboutPageHeroDesc")}
              </motion.p>
              <motion.ul variants={fadeUp} className="mb-7 space-y-2">
                {[
                  t("aboutPageBullet1"),
                  t("aboutPageBullet2"),
                  t("aboutPageBullet3"),
                  t("aboutPageBullet4"),
                ].map((item) => (
                  <li key={item} className="group flex cursor-default items-start gap-2 text-sm text-slate-700 transition-transform duration-300 hover:translate-x-1 dark:text-slate-200">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600 transition-transform duration-300 group-hover:scale-125" />
                    {item}
                  </li>
                ))}
              </motion.ul>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <Link
                  to="/categories"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-300 active:scale-95"
                >
                  <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">{t("aboutPageChooseService")}</span>
                  <ArrowRight className="relative ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("about-contacts")?.scrollIntoView({ behavior: "smooth" })}
                  className="rounded-xl border-emerald-200 px-6 py-3 text-sm text-emerald-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-50 active:scale-95"
                >
                  {t("aboutPageHaveQuestions")}
                </Button>
              </motion.div>
            </motion.div>

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
              
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white bg-white dark:bg-slate-900 shadow-[0_32px_80px_-16px_rgba(15,23,42,0.15)] hover-lift transition-all duration-700">
                <div className="relative h-[420px] md:h-[480px] overflow-hidden">
                  <img
                    src={heroImage}
                    alt="Master.TJ"
                    className="h-full w-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
                
                {/* Integrated Info Panel */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2rem] p-5 md:p-6 border border-white/50 dark:border-slate-700/50 shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center justify-between transition-transform duration-500 group-hover:translate-y-[-4px]">
                    <div>
                      <p className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-1">Master.TJ</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold tracking-wide">{t("aboutPageCardTagline")}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-2xl text-sm font-black shadow-lg shadow-emerald-200 transition-colors group-hover:bg-emerald-600">
                        <Star className="h-4 w-4 fill-current" />
                        4.8
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 uppercase tracking-[0.2em] font-bold">{t("aboutPageRatingLabel")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 hidden lg:block">
                <motion.div
                  animate={{ y: [0, -12, 0], rotate: [0, 6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="h-20 w-20 rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center"
                >
                   <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Wrench className="h-5 w-5" />
                   </div>
                </motion.div>
              </div>
              <div className="absolute -bottom-6 -left-6 hidden lg:block">
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white"><BadgeCheck className="h-4 w-4" /></span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{tx("Проверенные мастера", "Verified masters", "Устоҳои санҷидашуда")}</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {topStats.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -6 }}
                  className={`group cursor-default rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-5 text-center shadow-sm transition-shadow duration-300 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/60 ${i === topStats.length - 1 && topStats.length % 2 === 1 ? "col-span-2 lg:col-span-1" : ""}`}
                >
                  <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 transition-all duration-500 group-hover:rotate-[360deg] group-hover:bg-emerald-500 dark:bg-emerald-500/10">
                    <Icon className="h-6 w-6 text-emerald-600 transition-colors duration-300 group-hover:text-white" />
                  </span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white"><CountUp value={item.value} /></p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 text-center text-2xl font-bold text-slate-900 dark:text-white md:text-3xl"
          >
            {t("aboutPageClientsTitle")}
          </motion.h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {clientBenefits.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -8 }}
                  className="group relative cursor-default overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm transition-shadow duration-300 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/60"
                >
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition-all duration-500 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-[-8deg] group-hover:shadow-lg group-hover:shadow-emerald-200">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-900 transition-colors group-hover:text-emerald-700 dark:text-white">{item.title}</h3>
                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{item.desc}</p>
                  <span aria-hidden className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-emerald-400 to-teal-500 transition-transform duration-500 group-hover:scale-x-100" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 py-12">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 text-center text-2xl font-bold text-slate-900 dark:text-white md:text-3xl"
          >
            {t("aboutPageMastersTitle")}
          </motion.h2>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="-mt-2 mb-6 flex justify-center">
            <Link to="/become-master" className="group inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 text-sm font-bold text-emerald-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-200 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              <HardHat className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12" />
              {tx("Стать мастером", "Become a master", "Усто шудан")}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {masterAdvantages.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -8 }}
                  className="group cursor-default rounded-2xl border border-slate-200 dark:border-slate-700 bg-[#fbfcfb] dark:bg-slate-900 p-4 text-center transition-all duration-300 hover:border-emerald-200 hover:bg-white hover:shadow-xl hover:shadow-emerald-100/60 dark:hover:bg-slate-800"
                >
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition-all duration-500 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-[-8deg] group-hover:shadow-lg group-hover:shadow-emerald-200">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{item.desc}</p>
                </motion.div>
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
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-slate-700 bg-[#f8f8f6] dark:bg-slate-900 p-8 md:p-10 shadow-sm transition-shadow duration-500 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100/60 min-h-[340px] flex flex-col justify-center"
            >
              <div className="relative z-10 max-w-full md:max-w-[60%]">
                <h3 className="mb-4 text-3xl font-black text-slate-900 dark:text-white">{t("aboutPageMissionTitle")}</h3>
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300 mb-3">
                  {t("aboutPageMissionDesc1")}
                </p>
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                  {t("aboutPageMissionDesc2")}
                </p>
              </div>
              <div className="absolute -bottom-4 -right-4 top-0 hidden w-[60%] overflow-hidden rounded-[2.5rem] md:block">
                <img
                  src={missionImage}
                  alt={t("aboutPageMissionImgAlt")}
                  className="h-full w-full object-contain object-right-bottom transition-transform duration-700 group-hover:scale-110 group-hover:-translate-x-4"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#f8f8f6] dark:from-slate-900 via-[#f8f8f6]/50 dark:via-slate-900/50 to-transparent pointer-events-none" />
              </div>
              <div className="mt-8 block md:hidden">
                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm">
                  <img
                    src={missionImage}
                    alt={t("aboutPageMissionImgAlt")}
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
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-slate-700 bg-[#f8f8f6] dark:bg-slate-900 p-8 md:p-10 shadow-sm transition-shadow duration-500 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100/60 min-h-[340px] flex flex-col justify-center"
            >
              <div className="relative z-10 max-w-full md:max-w-[70%]">
                <h3 className="mb-4 text-3xl font-black text-slate-900 dark:text-white">{t("aboutPageSafetyTitle")}</h3>
                <p className="mb-6 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                  {t("aboutPageSafetyDesc")}
                </p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {[
                    t("aboutPageSafety1"),
                    t("aboutPageSafety2"),
                    t("aboutPageSafety3"),
                    t("aboutPageSafety4"),
                  ].map((item) => (
                    <li key={item} className="group/li flex items-center gap-2 text-sm font-semibold text-slate-700 transition-transform duration-300 hover:translate-x-1 dark:text-slate-200">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-all duration-300 group-hover/li:scale-125 group-hover/li:bg-emerald-500 group-hover/li:text-white">
                        <CheckCircle className="h-3 w-3" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="absolute -bottom-10 -right-10 hidden md:block">
                <div className="flex h-64 w-64 items-center justify-center rounded-full bg-emerald-50/50 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
                  <ShieldCheck className="h-40 w-40 text-emerald-500/20" strokeWidth={1} />
                </div>
              </div>
              <div className="absolute right-6 top-6 hidden lg:block">
                <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 p-3 shadow-xl backdrop-blur-sm border border-emerald-50 dark:border-emerald-900/30 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-6">
                   <ShieldCheck className="h-10 w-10 text-emerald-600" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 py-12">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 text-center text-2xl font-bold text-slate-900 dark:text-white md:text-3xl"
          >
            {t("aboutPageValuesTitle")}
          </motion.h2>
          <div className="grid gap-4 md:grid-cols-4">
            {values.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  viewport={{ once: true }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group cursor-default rounded-2xl border border-slate-200 dark:border-slate-700 bg-[#fbfcfb] dark:bg-slate-900 p-5 text-center transition-all duration-300 hover:border-emerald-200 hover:bg-white hover:shadow-xl hover:shadow-emerald-100/60 dark:hover:bg-slate-800"
                >
                  <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition-all duration-500 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-[-8deg] group-hover:shadow-lg group-hover:shadow-emerald-200">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="about-contacts" className="py-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 p-6 text-white shadow-2xl shadow-emerald-200/60 md:p-8"
          >
            <motion.div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
            <motion.div aria-hidden className="pointer-events-none absolute -bottom-20 right-1/3 h-44 w-44 rounded-full bg-white/5" animate={{ scale: [1.1, 1, 1.1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
            <div className="relative">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                {t("aboutPageContactBadge")}
              </p>
              <h2 className="mb-2 text-2xl font-bold md:text-3xl">+992 979 117 007</h2>
              <p className="mb-5 text-sm text-emerald-50">{t("aboutPageWhatsappLabel")}</p>
            </div>
            <div className="relative flex flex-wrap gap-3">
              <Button asChild className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:bg-emerald-50 active:scale-95">
                <a href="https://wa.me/992979117007" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {t("aboutPageWhatsappButton")}
                </a>
              </Button>
              <Link
                to="/categories"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20 active:scale-95"
              >
                {t("aboutPageChooseService")}
              </Link>
              <a
                href="tel:+992979117007"
                className="group inline-flex items-center justify-center rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 active:scale-95"
              >
                <PhoneCall className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                {t("aboutPageCallButton")}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Число «бежит» от 0 до значения, когда блок появляется на экране (1000+, 4.8, 95%).
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const match = value.match(/^([\d.]+)(.*)$/);
  const target = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : "";
  const decimals = match && match[1].includes(".") ? match[1].split(".")[1].length : 0;
  const [display, setDisplay] = useState(match ? (0).toFixed(decimals) : value);

  useEffect(() => {
    if (!inView || !match) return;
    const controls = animate(0, target, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView]);

  return <span ref={ref}>{match ? `${display}${suffix}` : value}</span>;
}

function ScrollExtras() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25, restDelta: 0.001 });
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <>
      <motion.div style={{ scaleX }} className="fixed left-0 right-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />
      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            aria-label="Наверх"
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            whileHover={{ scale: 1.1, y: -3 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-300/50"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

export default About;
