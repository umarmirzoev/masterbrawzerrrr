import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  CheckCircle2,
  DollarSign,
  Headphones,
  Clock,
  Shield,
  Users,
  MessageCircle,
  Phone,
  Send,
  Wrench,
  Zap,
  Star,
  Download,
  AlertCircle,
} from "lucide-react";
import { buildLocalizedNotification } from "@/lib/notifications";
import { useToast } from "@/hooks/use-toast";

const SPECIALIZATIONS = [
  "Электрика",
  "Сантехника",
  "Отделка",
  "Мебель и двери",
  "Умный дом",
  "Видеонаблюдение",
  "Сад и двор",
  "Сварка",
  "Подвалы и гаражи",
  "Клининг",
  "Ремонт под ключ",
  "Аварийные услуги 24/7",
  "Ремонт техники",
  "Кондиционеры",
  "Окна и двери",
  "Потолки",
  "Полы и ламинат",
  "Покраска",
];

const DISTRICTS = ["Сино", "Фирдавси", "Шохмансур", "Исмоили Сомони", "Пригород"];

const BecomeMaster = () => {
  // Временное стоковое изображение — замени на реальное фото.
  const heroImage = "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&h=1400&fit=crop";
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [existingApp, setExistingApp] = useState<any>(null);
  const [checkingApp, setCheckingApp] = useState(true);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    district: "",
    specialization: "",
    experience_years: "",
    description: "",
  });

  const benefits = [
    { icon: Users, title: "Постоянные заказы", desc: "Каждый день новые заявки рядом с вами" },
    { icon: DollarSign, title: "Доход от 3000+", desc: "Сомони в месяц при активной работе" },
    { icon: Clock, title: "Удобный график", desc: "Работайте в свободное время" },
    { icon: Shield, title: "Безопасные клиенты", desc: "Только проверенные заказы" },
  ];

  const steps = [
    {
      title: "Оставьте заявку",
      description: "Заполните короткую анкету и отправьте заявку менеджеру.",
      icon: Users,
    },
    {
      title: "Получите подтверждение",
      description: "Наш менеджер свяжется и предложит первые заказы.",
      icon: Wrench,
    },
    {
      title: "Начните зарабатывать",
      description: "Выполняйте заявки в удобное время и получайте оплату.",
      icon: DollarSign,
    },
  ];

  const reviews = [
    { name: "Фаррух", text: "За месяц заработал 4500 сомони, заказы приходят каждый день.", rating: 5, spec: "Электрик" },
    { name: "Исмоил", text: "Отличная платформа, всё честно и прозрачно. Рекомендую!", rating: 5, spec: "Сантехник" },
    { name: "Далер", text: "Работаю когда хочу, заказы рядом с домом, супер удобно!", rating: 5, spec: "Мастер на все руки" },
  ];

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setCheckingApp(false);
        return;
      }
      const { data } = await supabase
        .from("master_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      if (data && data.length > 0) setExistingApp(data[0]);
      setFormData((prev) => ({
        ...prev,
        full_name: user.user_metadata?.full_name || "",
        email: user.email || "",
      }));
      setCheckingApp(false);
    };
    if (!authLoading) check();
  }, [user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!formData.district || !formData.specialization) {
      toast({ title: "Ошибка", description: "Заполните все обязательные поля", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("master_applications").insert({
      user_id: user.id,
      full_name: formData.full_name,
      phone: formData.phone,
      email: formData.email,
      district: formData.district,
      specialization: formData.specialization,
      experience_years: parseInt(formData.experience_years) || 0,
      description: formData.description,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      return;
    }

    await supabase.from("notifications").insert(
      buildLocalizedNotification({
        userId: user.id,
        fallbackTitle: "Заявка отправлена",
        fallbackMessage: "Ваша заявка на мастера отправлена на рассмотрение.",
        titleKey: "notifApplicationSubmittedTitle",
        messageKey: "notifApplicationSubmittedMessage",
        type: "application",
      }),
    );

    toast({ title: "Заявка отправлена!", description: "С вами свяжется менеджер." });

    const { data } = await supabase
      .from("master_applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (data && data.length > 0) setExistingApp(data[0]);
  };

  const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string; message: string }> = {
    pending: {
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
      label: "На рассмотрении",
      message: "Ваша заявка отправлена. Мы уведомим вас о следующем шаге.",
    },
    approved: {
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
      label: "Одобрена",
      message: "Ваша заявка одобрена! Перейдите в личный кабинет мастера.",
    },
    rejected: {
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
      label: "Отклонена",
      message: "К сожалению, ваша заявка отклонена. Попробуйте отправить новую.",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <Header />
      <section className="relative overflow-hidden pt-10 pb-24">
        <div className="absolute inset-x-0 top-0 h-96 bg-emerald-100/80 blur-3xl" />
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-6"
            >
              <Badge className="mb-6 rounded-full bg-emerald-50 text-emerald-700 px-4 py-2 text-sm font-bold tracking-[0.18em] uppercase">
                Работа в Душанбе
              </Badge>
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tight text-slate-900 leading-tight mb-6">
                Станьте мастером <span className="text-emerald-600">в Душанбе</span> и зарабатывайте каждый день
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-8">
                Мы подключаем вас к проверенным клиентам, организуем заказы и поддерживаем работу 24/7.
              </p>
              <div className="grid gap-3 max-w-xl mb-10">
                {[
                  "Постоянные заказы",
                  "Доход от 3000+ сомони",
                  "Работаете когда удобно",
                  "Безопасные клиенты",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-3xl bg-white/80 border border-slate-200 px-5 py-3 shadow-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-semibold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" })}
                  className="rounded-full bg-emerald-600 text-white px-10 h-14 shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition-all hover-soft"
                >
                  Стать мастером
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full h-14 px-8 text-slate-700 border-slate-300 hover:bg-slate-50 hover-soft"
                >
                  <a href="https://wa.me/992979117007" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-emerald-500" />
                    Написать в WhatsApp
                  </a>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-6"
            >
              <div className="relative mx-auto max-w-2xl lg:max-w-none">
                <div className="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-emerald-200/50 blur-3xl" />
                <div className="absolute -right-16 top-24 w-64 h-64 rounded-full bg-slate-200/70 blur-3xl" />
                <div className="relative overflow-hidden rounded-[3rem] shadow-[0_40px_120px_rgba(15,23,42,0.08)] hover-image-zoom hover-lift">
                  <img
                    src={heroImage}
                    alt="Мастер с инструментами"
                    className="h-full w-full scale-[1.12] object-cover object-[78%_center]"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 grid gap-6 md:grid-cols-3"
          >
            <div className="rounded-[2.25rem] border border-slate-200 bg-white/95 p-6 shadow-xl hover-soft hover-glow flex flex-col justify-between">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Гибкий график</p>
                  <p className="font-bold text-slate-900">Работайте в удобное время</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Вы сами выбираете, когда принимать заказы и сколько заявок брать в день.</p>
            </div>

            <div className="rounded-[2.25rem] border border-slate-200 bg-white/95 p-6 shadow-xl hover-soft hover-glow flex flex-col justify-between">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-3xl bg-emerald-600 text-white flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Мастер ТЧ</p>
                  <p className="font-bold text-slate-900">Ремонт и обслуживание</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Средний доход наших мастеров — от 3000 сомони при активной работе.</p>
            </div>

            <div className="rounded-[2.25rem] border border-slate-200 bg-white/95 p-6 shadow-xl hover-soft hover-glow flex flex-col justify-between">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Надёжная платформа</p>
                  <p className="font-bold text-slate-900">Проверенные клиенты</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Все заявки проходят через сервис, а поддержка помогает на каждом этапе работы.</p>
            </div>
          </motion.div>

          <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition-shadow hover-lift hover-glow"
              >
                <div className="w-12 h-12 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-500">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-24 bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { value: "120+", label: "мастеров с нами" },
                { value: "5000+", label: "выполненных заказов" },
                { value: "4.8★", label: "средний рейтинг" },
                { value: "95%", label: "довольных клиентов" },
              ].map((item) => (
                <div key={item.value} className="rounded-[2rem] bg-white/5 p-6 text-center hover-soft">
                  <p className="text-3xl font-black">{item.value}</p>
                  <p className="text-sm text-slate-300 mt-2">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-24 text-center">
            <p className="text-sm uppercase font-bold tracking-[0.3em] text-emerald-500">Как это работает</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-4">Всё просто: регистрация, подтверждение и первые заказы</h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-[2.5rem] border border-slate-200 bg-white p-8 text-center shadow-sm hover:shadow-xl transition-shadow hover-lift hover-glow"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
                  <step.icon className="w-7 h-7" />
                </div>
                <p className="text-xl font-bold text-slate-900 mb-3">{step.title}</p>
                <p className="text-sm text-slate-500">{step.description}</p>
                <div className="mt-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white font-black text-lg">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-24 grid gap-10 lg:grid-cols-12 items-start" id="apply-form">
            <div className="lg:col-span-5">
              <div className="rounded-[3rem] border border-slate-200 bg-white p-10 shadow-sm hover-soft hover-glow">
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-600 mb-4 font-bold">Готовы начать</p>
                <h2 className="text-3xl font-black text-slate-900 mb-6">Оставьте заявку и работайте на своих условиях</h2>
                <p className="text-slate-600 mb-8">
                  Заполните простую форму, и наш менеджер свяжется с вами для подтверждения.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-4">
                    <Phone className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Позвоните</p>
                      <p className="font-semibold text-slate-900">+992 979 117 007</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-4">
                    <MessageCircle className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Напишите</p>
                      <p className="font-semibold text-slate-900">WhatsApp / Telegram</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              {authLoading || checkingApp ? (
                <div className="flex justify-center py-16">
                  <div className="flex items-center justify-center rounded-full bg-emerald-100 p-6">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
                  </div>
                </div>
              ) : !user ? (
                <Card className="rounded-[3rem] border border-slate-200 bg-white shadow-sm hover-soft hover-glow">
                  <CardContent className="p-12 text-center">
                    <Download className="mx-auto mb-6 h-16 w-16 text-emerald-500" />
                    <h3 className="text-2xl font-black text-slate-900 mb-4">Установите приложение</h3>
                    <p className="text-slate-500 mb-8">Установите приложение Мастер ТЧ, чтобы отправить заявку на статус мастера и начать получать заказы.</p>
                    <Button onClick={() => navigate("/install-app")} className="mb-2 rounded-full bg-emerald-600 text-white px-10 h-14 hover:bg-emerald-700">
                      Установить приложение
                    </Button>
                    <div className="hidden">
                    <h3 className="text-2xl font-black text-slate-900 mb-4">Войдите в аккаунт</h3>
                    <p className="text-slate-500 mb-8">Авторизуйтесь, чтобы отправить заявку на статус мастера и начать получать заказы.</p>
                    <Button onClick={() => navigate("/install-app")} className="rounded-full bg-emerald-600 text-white px-10 h-14 hover:bg-emerald-700">
                      Войти / Регистрация
                    </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : existingApp && existingApp.status !== "rejected" ? (
                <Card className={`rounded-[3rem] border border-slate-200 p-10 text-center hover-soft hover-glow ${statusConfig[existingApp.status]?.bg || "bg-slate-50"}`}>
                  <CardContent>
                    {(() => {
                      const status = statusConfig[existingApp.status] || statusConfig.pending;
                      const StatusIcon = status.icon;
                      return (
                        <>
                          <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-white ${status.bg}`}>
                            <StatusIcon className={`w-10 h-10 ${status.color}`} />
                          </div>
                          <Badge className={`mb-6 inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.25em] ${status.color}`}>
                            {status.label}
                          </Badge>
                          <h3 className="text-2xl font-black text-slate-900 mb-4">Статус заявки</h3>
                          <p className="text-slate-500 mb-8">{status.message}</p>
                        </>
                      );
                    })()}
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400 mb-8">Отправлено {new Date(existingApp.created_at).toLocaleDateString("ru-RU")}</p>
                    {existingApp.status === "approved" && (
                      <Button onClick={() => navigate("/master-dashboard")} className="rounded-full bg-emerald-600 px-10 h-14 text-white hover:bg-emerald-700">
                        Перейти в кабинет
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="rounded-[3rem] border border-slate-200 bg-white shadow-sm hover-soft hover-glow">
                  <CardContent className="p-10">
                    <h3 className="text-3xl font-black text-slate-900 mb-8">Оформить заявку</h3>
                    {existingApp?.status === "rejected" && (
                      <div className="mb-8 rounded-[2rem] bg-red-50 p-5 border border-red-100 text-red-700">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-6 h-6" />
                          <div>
                            <p className="font-bold">Заявка отклонена</p>
                            <p className="text-sm text-red-600">Проверьте данные и отправьте новую заявку.</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Имя</label>
                          <Input
                            placeholder="Назаров Фарход"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            required
                            className="h-14 rounded-3xl bg-slate-50 border-none focus-visible:ring-emerald-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Телефон</label>
                          <Input
                            placeholder="+992 900 00 00 00"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            type="tel"
                            className="h-14 rounded-3xl bg-slate-50 border-none focus-visible:ring-emerald-500"
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Email</label>
                          <Input
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            type="email"
                            className="h-14 rounded-3xl bg-slate-50 border-none focus-visible:ring-emerald-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Район</label>
                          <Select value={formData.district} onValueChange={(value) => setFormData({ ...formData, district: value })}>
                            <SelectTrigger className="h-14 rounded-3xl bg-slate-50 border-none focus-visible:ring-emerald-500">
                              <SelectValue placeholder="Выберите район" />
                            </SelectTrigger>
                            <SelectContent>
                              {DISTRICTS.map((district) => (
                                <SelectItem key={district} value={district}>
                                  {district}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Специализация</label>
                          <Select
                            value={formData.specialization}
                            onValueChange={(value) => setFormData({ ...formData, specialization: value })}
                          >
                            <SelectTrigger className="h-14 rounded-3xl bg-slate-50 border-none focus-visible:ring-emerald-500">
                              <SelectValue placeholder="Выберите специализацию" />
                            </SelectTrigger>
                            <SelectContent>
                              {SPECIALIZATIONS.map((specialty) => (
                                <SelectItem key={specialty} value={specialty}>
                                  {specialty}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Опыт (лет)</label>
                          <Input
                            placeholder="5"
                            type="number"
                            min={0}
                            max={50}
                            value={formData.experience_years}
                            onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                            className="h-14 rounded-3xl bg-slate-50 border-none focus-visible:ring-emerald-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">О себе</label>
                        <Textarea
                          placeholder="Расскажите о своем опыте и специализации"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                          className="rounded-3xl bg-slate-50 border-none focus-visible:ring-emerald-500 p-5"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-full bg-emerald-600 text-white h-16 font-black text-lg hover:bg-emerald-700 transition-all"
                      >
                        {submitting ? "Отправка..." : "Отправить заявку"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="mt-20 grid gap-6 md:grid-cols-3">
            {reviews.map((review, index) => (
              <Card key={review.name} className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="h-14 w-14 rounded-3xl bg-slate-50 flex items-center justify-center text-emerald-600 text-lg font-black">
                      {review.name.slice(0, 1)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{review.name}</p>
                      <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">{review.spec}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4 text-yellow-400">
                    {Array.from({ length: review.rating }).map((_, starIndex) => (
                      <Star key={starIndex} className="w-4 h-4" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-500">“{review.text}”</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-24 rounded-[3rem] bg-emerald-600 px-8 py-12 text-white shadow-2xl overflow-hidden">
            <div className="relative">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="relative grid gap-8 lg:grid-cols-2 items-center">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-emerald-200 mb-3 font-bold">Готовы начать</p>
                  <h2 className="text-3xl md:text-4xl font-black mb-4">Начните зарабатывать уже сегодня</h2>
                  <p className="max-w-xl text-slate-100/90 leading-relaxed">
                    Присоединяйтесь к команде профессионалов и получайте заказы с первого дня.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" })}
                    className="rounded-full bg-white text-emerald-700 h-14 px-10 font-black hover:bg-slate-50"
                  >
                    Оставить заявку
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full h-14 px-10 text-white border-white/30 hover:bg-white/10"
                  >
                    <a href="https://wa.me/992979117007" target="_blank" rel="noopener noreferrer">
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BecomeMaster;
