import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
    <div className="min-h-screen bg-[#f7f9f8]">
      <Header />

      <section className="bg-white pb-8 pt-10 md:pt-14">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">{t("aboutPageBadge")}</p>
              <h1 className="mb-5 text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
                {t("aboutPageHeroTitle1")}
                <br />
                {t("aboutPageHeroTitle2")}
                <br />{t("aboutPageHeroTitle3")}
              </h1>
              <p className="mb-5 text-sm leading-6 text-slate-600 md:text-base">
                {t("aboutPageHeroDesc")}
              </p>
              <ul className="mb-7 space-y-2">
                {[
                  t("aboutPageBullet1"),
                  t("aboutPageBullet2"),
                  t("aboutPageBullet3"),
                  t("aboutPageBullet4"),
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
                  {t("aboutPageChooseService")}
                </Link>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("about-contacts")?.scrollIntoView({ behavior: "smooth" })}
                  className="rounded-lg border-emerald-200 px-6 py-3 text-sm text-emerald-700 hover:bg-emerald-50"
                >
                  {t("aboutPageHaveQuestions")}
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
                      <p className="text-sm text-slate-500 font-semibold tracking-wide">{t("aboutPageCardTagline")}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-2xl text-sm font-black shadow-lg shadow-emerald-200 transition-colors group-hover:bg-emerald-600">
                        <Star className="h-4 w-4 fill-current" />
                        4.8
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 uppercase tracking-[0.2em] font-bold">{t("aboutPageRatingLabel")}</p>
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
          <h2 className="mb-6 text-center text-2xl font-bold text-slate-900 md:text-3xl">{t("aboutPageClientsTitle")}</h2>
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
          <h2 className="mb-6 text-center text-2xl font-bold text-slate-900 md:text-3xl">{t("aboutPageMastersTitle")}</h2>
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
                <h3 className="mb-4 text-3xl font-black text-slate-900">{t("aboutPageMissionTitle")}</h3>
                <p className="text-base leading-relaxed text-slate-600 mb-3">
                  {t("aboutPageMissionDesc1")}
                </p>
                <p className="text-base leading-relaxed text-slate-600">
                  {t("aboutPageMissionDesc2")}
                </p>
              </div>
              <div className="absolute -bottom-4 -right-4 top-0 hidden w-[60%] md:block">
                <img
                  src={missionImage}
                  alt={t("aboutPageMissionImgAlt")}
                  className="h-full w-full object-contain object-right-bottom transition-transform duration-700 group-hover:scale-110 group-hover:-translate-x-4"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#f8f8f6] via-[#f8f8f6]/50 to-transparent pointer-events-none" />
              </div>
              <div className="mt-8 block md:hidden">
                <div className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm">
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
              className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[#f8f8f6] p-8 md:p-10 shadow-sm hover-soft hover-glow min-h-[340px] flex flex-col justify-center"
            >
              <div className="relative z-10 max-w-full md:max-w-[70%]">
                <h3 className="mb-4 text-3xl font-black text-slate-900">{t("aboutPageSafetyTitle")}</h3>
                <p className="mb-6 text-base leading-relaxed text-slate-600">
                  {t("aboutPageSafetyDesc")}
                </p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {[
                    t("aboutPageSafety1"),
                    t("aboutPageSafety2"),
                    t("aboutPageSafety3"),
                    t("aboutPageSafety4"),
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
          <h2 className="mb-6 text-center text-2xl font-bold text-slate-900 md:text-3xl">{t("aboutPageValuesTitle")}</h2>
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
                {t("aboutPageContactBadge")}
              </p>
              <h2 className="mb-2 text-2xl font-bold md:text-3xl">+992 979 117 007</h2>
              <p className="mb-5 text-sm text-emerald-50">{t("aboutPageWhatsappLabel")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
                <a href="https://wa.me/992979117007" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {t("aboutPageWhatsappButton")}
                </a>
              </Button>
              <Link
                to="/categories"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                {t("aboutPageChooseService")}
              </Link>
              <a
                href="tel:+992979117007"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                <PhoneCall className="mr-2 h-4 w-4" />
                {t("aboutPageCallButton")}
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
