import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  LogIn, UserPlus, Mail, Lock, User, Phone, Eye, EyeOff, Loader2,
  ShieldCheck, Zap, Star, Wrench, Home, ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MasterRegistrationFields from "@/components/dashboard/MasterRegistrationFields";

type AuthMode = "login" | "register" | "master_details";
type RoleChoice = "client" | "master";

// Поле ввода с иконкой, подсветкой при фокусе и плавным появлением.
function Field({
  icon: Icon,
  right,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ElementType; right?: React.ReactNode }) {
  return (
    <div className="group relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-emerald-500" />
      <input
        {...props}
        className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 ${right ? "pr-12" : "pr-4"} text-[15px] text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-emerald-300 hover:bg-white focus:border-emerald-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(16,185,129,0.15)] dark:border-slate-700 dark:bg-slate-800/60 dark:text-white`}
      />
      {right}
    </div>
  );
}

const BENEFITS = [
  { icon: ShieldCheck, title: "Проверенные мастера", text: "Документы и отзывы каждого мастера проверены" },
  { icon: Zap, title: "Выезд от 20 минут", text: "Срочный вызов 24/7 по всему Душанбе" },
  { icon: Star, title: "Честные цены", text: "Цена известна заранее, без доплат" },
];

// Страница входа (/auth) и регистрации (/register): анкета мастера открывается после регистрации.
const Auth = () => {
  const { t } = useLanguage();
  const { user, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const routeMode: AuthMode = location.pathname.startsWith("/register") ? "register" : "login";
  const [mode, setMode] = useState<AuthMode>(routeMode);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [roleChoice, setRoleChoice] = useState<RoleChoice>("client");
  const [newUserId, setNewUserId] = useState<string | null>(null);

  // Адрес страницы определяет режим: /auth — вход, /register — регистрация.
  useEffect(() => {
    if (mode !== "master_details") setMode(routeMode);
  }, [routeMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Уже вошедшего пользователя сразу отправляем в его кабинет.
  useEffect(() => {
    if (user && !loading && mode !== "master_details") {
      navigate(getDashboardPath(), { replace: true });
    }
  }, [user, loading, mode, navigate, getDashboardPath]);

  const switchMode = (next: "login" | "register") => {
    navigate(next === "register" ? "/register" : "/auth", { replace: true });
  };

  // Вход по email и паролю с обработкой типовых ошибок Supabase.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        let description = error.message;
        if (error.message.toLowerCase().includes("invalid login credentials")) description = t("authWrongCredentials");
        else if (error.message.toLowerCase().includes("email not confirmed")) description = t("authEmailNotConfirmed");
        toast({ title: t("authLoginError"), description, variant: "destructive" });
        setLoading(false);
        return;
      }
      if (data.user) {
        toast({ title: "Успешный вход", description: "Добро пожаловать обратно!" });
      }
    } catch (err) {
      console.error("Login unexpected error:", err);
      toast({ title: t("authLoginError"), description: "Произошла непредвиденная ошибка", variant: "destructive" });
      setLoading(false);
    }
  };

  // Параллельно регистрируем клиента в .NET-бэкенде (для Flutter-приложения). Ошибки не мешают регистрации.
  const syncToLegacyBackend = async () => {
    try {
      const [firstName, ...rest] = fullName.trim().split(/\s+/);
      await supabase.functions.invoke("legacy-sync", {
        body: {
          action: "register",
          phone,
          password,
          role: roleChoice,
          firstName: firstName || undefined,
          lastName: rest.join(" ") || undefined,
          email,
        },
      });
    } catch (err) {
      console.warn("legacy-sync register skipped:", err);
    }
  };

  // Регистрация создаёт аккаунт, а для мастера дополнительно открывает анкету.
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: t("error"), description: t("authPasswordMinLength"), variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName, phone, desired_role: roleChoice }, emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      let description = error.message;
      if (error.message.includes("User already registered")) {
        description = "Этот email уже зарегистрирован. Войдите в аккаунт или используйте другой email.";
      }
      toast({ title: t("error"), description, variant: "destructive" });
      return;
    }
    if (!data.user) {
      toast({ title: t("error"), description: "Не удалось создать аккаунт. Попробуйте ещё раз.", variant: "destructive" });
      return;
    }
    if (!data.session) {
      toast({
        title: "Проверьте почту",
        description: "Мы отправили письмо для подтверждения на " + email + ". Перейдите по ссылке из письма, чтобы войти.",
        duration: 10000,
      });
      return;
    }
    toast({
      title: "Регистрация успешна!",
      description: roleChoice === "master" ? "Заполните данные мастера" : "Добро пожаловать!",
    });
    void syncToLegacyBackend();
    if (roleChoice === "master") {
      setNewUserId(data.user.id);
      setMode("master_details");
    } else {
      navigate("/dashboard");
    }
  };

  const handleMasterComplete = () => navigate("/pending-approval");
  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <Header />

      <div className="relative overflow-hidden">
        {/* Плавающие цветные пятна на фоне */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-teal-300/25 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="container relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:py-20 lg:grid-cols-2">
          {/* Левая колонка — преимущества */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
              <Home className="h-3.5 w-3.5" /> Master.TJ — мастера на дом в Душанбе
            </span>
            <h1 className="mt-6 text-5xl font-black leading-[1.05] tracking-tight text-slate-900 dark:text-white">
              {isLogin ? "С возвращением!" : "Присоединяйтесь"}
              <br />
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                {isLogin ? "Рады вас видеть" : "к Master.TJ"}
              </span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-slate-500">
              Вызывайте проверенных мастеров, следите за заказами и общайтесь с мастером в одном месте.
            </p>
            <div className="mt-10 space-y-4">
              {BENEFITS.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.12 }}
                  whileHover={{ x: 6 }}
                  className="flex max-w-md cursor-default items-center gap-4 rounded-2xl border border-white bg-white/80 p-4 shadow-sm backdrop-blur transition-shadow hover:shadow-lg hover:shadow-emerald-500/10"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30">
                    <b.icon className="h-6 w-6" />
                  </span>
                  <span>
                    <span className="block font-bold text-slate-900">{b.title}</span>
                    <span className="block text-sm text-slate-500">{b.text}</span>
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Правая колонка — форма */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-full max-w-md"
          >
            {mode === "master_details" && newUserId ? (
              <Card className="rounded-3xl border-white shadow-2xl shadow-emerald-500/10">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{t("authMasterDetails")}</CardTitle>
                  <CardDescription>{t("authMasterDetailsDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <MasterRegistrationFields userId={newUserId} onComplete={handleMasterComplete} />
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-3xl border border-white bg-white/90 p-6 shadow-2xl shadow-emerald-500/10 backdrop-blur sm:p-8 dark:border-slate-800 dark:bg-slate-900/90">
                {/* Иконка */}
                <motion.div
                  key={mode}
                  initial={{ scale: 0.6, rotate: -15, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30"
                >
                  {isLogin ? <LogIn className="h-8 w-8 text-white" /> : <UserPlus className="h-8 w-8 text-white" />}
                </motion.div>

                <h2 className="text-center text-2xl font-black text-slate-900 dark:text-white">
                  {isLogin ? t("authSignIn") : t("authRegistration")}
                </h2>
                <p className="mt-1 text-center text-sm text-slate-500">
                  {isLogin ? t("authLoginToAccount") : t("authCreateAccount")}
                </p>

                {/* Переключатель Вход / Регистрация */}
                <div className="relative mt-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
                  {(["login", "register"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => switchMode(m)}
                      className={`relative z-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                        mode === m ? "text-emerald-700 dark:text-white" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {mode === m && (
                        <motion.span
                          layoutId="auth-tab"
                          className="absolute inset-0 -z-10 rounded-xl bg-white shadow-md dark:bg-slate-700"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      {m === "login" ? t("authSignIn") : t("authRegistration")}
                    </button>
                  ))}
                </div>

                <form onSubmit={isLogin ? handleLogin : handleRegister} className="mt-6 space-y-3">
                  <AnimatePresence initial={false}>
                    {!isLogin && (
                      <motion.div
                        key="register-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3 overflow-hidden"
                      >
                        {/* Выбор роли */}
                        <div className="grid grid-cols-2 gap-2 pt-0.5">
                          {([
                            { value: "client", label: t("authClient"), icon: User, hint: "Заказываю услуги" },
                            { value: "master", label: t("authMaster"), icon: Wrench, hint: "Выполняю работы" },
                          ] as const).map((r) => {
                            const active = roleChoice === r.value;
                            return (
                              <motion.button
                                key={r.value}
                                type="button"
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setRoleChoice(r.value)}
                                className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center transition-all ${
                                  active
                                    ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/15 dark:bg-emerald-500/10"
                                    : "border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800"
                                }`}
                              >
                                <r.icon className={`h-5 w-5 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                                <span className={`text-sm font-bold ${active ? "text-emerald-700" : "text-slate-700 dark:text-slate-200"}`}>
                                  {r.label}
                                </span>
                                <span className="text-[11px] text-slate-400">{r.hint}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                        <Field icon={User} placeholder={t("authYourName")} value={fullName} onChange={(e) => setFullName(e.target.value)} required={!isLogin} />
                        <Field icon={Phone} placeholder={t("authPhone")} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" required={!isLogin} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Field icon={Mail} placeholder={t("authEmail")} value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required />
                  <Field
                    icon={Lock}
                    placeholder={t("authPassword")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    right={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition-shadow hover:shadow-xl hover:shadow-emerald-500/40 disabled:opacity-70"
                  >
                    {/* Блик при наведении */}
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        {isLogin ? t("authSignIn") : t("authRegister")}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </motion.button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                  {isLogin ? "Нет аккаунта? " : "Уже есть аккаунт? "}
                  <button
                    type="button"
                    onClick={() => switchMode(isLogin ? "register" : "login")}
                    className="font-bold text-emerald-600 underline-offset-4 transition-colors hover:text-emerald-700 hover:underline"
                  >
                    {isLogin ? "Зарегистрируйтесь" : "Войдите"}
                  </button>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Auth;
