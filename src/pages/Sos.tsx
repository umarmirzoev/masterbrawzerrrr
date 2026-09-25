import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Droplets, Zap, Flame, Lock, Thermometer, Wrench, Siren, Phone, Loader2,
  AlertTriangle, CheckCircle2, MapPin,
} from "lucide-react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { buildLocalizedNotification } from "@/lib/notifications";
import { SUPPORT_PHONE } from "@/lib/utils";

const GAS_EMERGENCY_PHONE = "104";

const SOS_BUTTON_CLS =
  "relative w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-red-500 to-rose-700 text-white shadow-[0_0_60px_-10px_rgba(239,68,68,0.7)] flex flex-col items-center justify-center active:scale-95 transition-transform disabled:opacity-70";

const EMERGENCIES = [
  { id: "flood", icon: Droplets, title: "Затопление", sub: "Прорыв трубы, потоп", color: "text-blue-500", ring: "border-blue-500 bg-blue-50 dark:bg-blue-500/10" },
  { id: "power", icon: Zap, title: "Нет света", sub: "Авария электрики, искрит", color: "text-amber-500", ring: "border-amber-500 bg-amber-50 dark:bg-amber-500/10" },
  { id: "gas", icon: Flame, title: "Запах газа", sub: "Утечка газа", color: "text-red-500", ring: "border-red-500 bg-red-50 dark:bg-red-500/10" },
  { id: "door", icon: Lock, title: "Захлопнулась дверь", sub: "Не могу попасть домой", color: "text-violet-500", ring: "border-violet-500 bg-violet-50 dark:bg-violet-500/10" },
  { id: "heat", icon: Thermometer, title: "Нет отопления", sub: "Холодно в квартире", color: "text-teal-500", ring: "border-teal-500 bg-teal-50 dark:bg-teal-500/10" },
  { id: "other", icon: Wrench, title: "Другое", sub: "Срочная проблема", color: "text-slate-500", ring: "border-slate-500 bg-slate-50 dark:bg-slate-500/10" },
] as const;

type EmergencyId = (typeof EMERGENCIES)[number]["id"];

// SOS — срочный вызов мастера. Создаёт заявку с пометкой «СРОЧНО» и уведомляет администраторов.
// Гостям и при любой ошибке показываем прямой звонок диспетчеру.
export default function Sos() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [type, setType] = useState<EmergencyId | null>(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (profile?.phone && !phone) setPhone(profile.phone);
  }, [profile?.phone]); // eslint-disable-line react-hooks/exhaustive-deps

  const selected = EMERGENCIES.find((e) => e.id === type);

  // Сохраняем заявку в Supabase (только для вошедших) — для кабинета клиента и уведомлений админам сайта.
  const saveToSupabase = async (title: string): Promise<boolean> => {
    if (!user) return false;
    const description = `🚨 СРОЧНО (SOS): ${title}. ${comment}`.trim();
    const { data, error } = await supabase
      .from("orders")
      .insert({ client_id: user.id, description, address: address.trim(), phone: phone.trim(), status: "new" })
      .select("id");
    if (error) return false;
    const orderId = data?.[0]?.id;
    const { data: admins } = await supabase.from("user_roles").select("user_id").in("role", ["admin", "super_admin"]);
    if (admins?.length) {
      await Promise.all(
        admins.map((a) =>
          supabase.from("notifications").insert(
            buildLocalizedNotification({
              userId: a.user_id,
              fallbackTitle: "🚨 SOS-вызов",
              fallbackMessage: `${title} • ${address.trim()} • ${phone.trim()}`,
              type: "order_created",
              relatedId: orderId ?? null,
            }),
          ),
        ),
      );
    }
    return true;
  };

  // Отправляем заявку в админку admin.emaster.tj (раздел «Заказы → SOS»). Работает и для гостей.
  const sendToAdminPanel = async (title: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke("sos-order", {
        body: { type: title, phone: phone.trim(), address: address.trim(), comment: comment.trim(), name: profile?.full_name ?? "" },
      });
      return !error && Boolean(data?.success);
    } catch {
      return false;
    }
  };

  const submit = async () => {
    if (!selected) {
      toast({ title: "Выберите, что случилось", variant: "destructive" });
      return;
    }
    if (phone.replace(/\D/g, "").length < 9 || address.trim().length < 3) {
      toast({ title: "Укажите телефон и адрес", variant: "destructive" });
      return;
    }

    setSending(true);
    const [adminOk, localOk] = await Promise.all([sendToAdminPanel(selected.title), saveToSupabase(selected.title)]);
    setSending(false);

    if (!adminOk && !localOk) {
      toast({ title: "Не удалось отправить", description: "Позвоните диспетчеру — это быстрее.", variant: "destructive" });
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="container mx-auto px-4 py-10 md:py-16 max-w-3xl">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300 text-xs font-bold mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            SOS · 24/7
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Экстренный вызов мастера</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Выберите, что случилось, — диспетчер сразу направит ближайшего свободного мастера.
          </p>
        </div>

        {sent ? (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Срочная заявка отправлена</h2>
            <p className="text-slate-500 dark:text-slate-400">Диспетчер перезвонит вам в ближайшие минуты. Если ждать нельзя — позвоните сами.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="h-12 rounded-xl bg-red-600 hover:bg-red-700 font-bold">
                <a href={`tel:${SUPPORT_PHONE}`}><Phone className="w-4 h-4 mr-2" /> Позвонить диспетчеру</a>
              </Button>
              {user && <Button asChild variant="outline" className="h-12 rounded-xl"><Link to="/dashboard">Мои заказы</Link></Button>}
            </div>
          </motion.div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {EMERGENCIES.map((e) => {
                const active = type === e.id;
                return (
                  <button key={e.id} onClick={() => setType(e.id)}
                    className={`text-left rounded-2xl border-2 p-3 sm:p-4 transition-all ${active ? e.ring : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600"}`}>
                    <e.icon className={`w-7 h-7 mb-3 ${e.color}`} />
                    <p className="font-bold text-slate-900 dark:text-white">{e.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{e.sub}</p>
                  </button>
                );
              })}
            </div>

            {type === "gas" && (
              <div className="rounded-2xl border-2 border-red-500 bg-red-50 dark:bg-red-500/10 p-5 space-y-3">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-black text-lg">
                  <AlertTriangle className="w-6 h-6" /> Сначала позвоните в газовую службу — {GAS_EMERGENCY_PHONE}
                </div>
                <ul className="text-sm text-red-800 dark:text-red-200 list-disc pl-5 space-y-1">
                  <li>Не включайте и не выключайте свет и электроприборы</li>
                  <li>Не зажигайте огонь, не курите</li>
                  <li>Откройте окна и выйдите из квартиры</li>
                  <li>Звоните в 104 уже с улицы</li>
                </ul>
                <Button asChild className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 font-black text-base">
                  <a href={`tel:${GAS_EMERGENCY_PHONE}`}><Phone className="w-5 h-5 mr-2" /> Позвонить 104</a>
                </Button>
              </div>
            )}

            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+992 900 000 000" className="h-12" maxLength={20} />
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-4" />
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Адрес: район, улица, дом, кв." className="h-12 pl-9" maxLength={200} />
                </div>
              </div>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={300} placeholder="Что именно случилось (необязательно)" />
            </div>

            <div className="flex flex-col items-center gap-4">
              <button onClick={submit} disabled={sending} className={SOS_BUTTON_CLS}>
                <span className="absolute inset-0 rounded-full animate-ping bg-red-500/30" />
                {sending ? <Loader2 className="w-12 h-12 animate-spin" /> : <Siren className="w-12 h-12" />}
                <span className="text-3xl font-black tracking-widest mt-1">SOS</span>
                <span className="text-xs font-semibold opacity-90">Вызвать сейчас</span>
              </button>
              <a href={`tel:${SUPPORT_PHONE}`}
                className="w-full sm:w-auto inline-flex flex-col items-center justify-center rounded-xl border-2 border-red-600 text-red-600 dark:text-red-400 px-6 py-2.5 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                <span className="flex items-center gap-2 text-sm sm:text-base"><Phone className="w-4 h-4 shrink-0" /> Позвонить диспетчеру</span>
                <span className="text-xs font-semibold opacity-80 whitespace-nowrap">+992 979 11 70 07</span>
              </a>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
