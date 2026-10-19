import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { SAMPLE_SERVICE_CATEGORIES } from "@/data/seedData";
import { Zap, Phone, MapPin, CheckCircle, Loader2, Clock, ShieldCheck, FileText, LayoutGrid, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { buildLocalizedNotification } from "@/lib/notifications";
import { syncOrderToLegacyBackend } from "@/lib/legacySync";
import RecipientFields from "@/components/RecipientFields";
import { emptyRecipient, insertOrder, recipientError, withRecipient, type OrderRecipient } from "@/lib/orderRecipient";

interface QuickBookingProps { open: boolean; onOpenChange: (open: boolean) => void; }

// Компонент быстрого заказа позволяет срочно отправить проблему без выбора конкретной услуги.
export default function QuickBooking({ open, onOpenChange }: QuickBookingProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>(SAMPLE_SERVICE_CATEGORIES as any[]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [recipient, setRecipient] = useState<OrderRecipient>(emptyRecipient);

  // Загружаем категории, чтобы пользователь при желании мог уточнить направление работ.
  useEffect(() => {
    supabase.from("service_categories").select("id, name_ru").order("sort_order").then(({ data }) => { if (data && data.length) setCategories(data); });
  }, []);

  // Быстрый заказ создаёт срочную заявку и уведомляет администраторов платформы.
  const handleSubmit = async () => {
    if (!user) {
      toast({ title: t("qbLoginRequired"), description: t("qbLoginRequiredDesc"), variant: "destructive" });
      navigate("/auth"); return;
    }
    if (!description.trim() || !phone.trim() || !address.trim()) {
      toast({ title: t("qbFillAllFields"), variant: "destructive" }); return;
    }
    const recipientProblem = recipientError(recipient);
    if (recipientProblem) {
      toast({ title: recipientProblem, variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
    // Демо-категории (cat-1...) не существуют в базе — отправляем название в описании.
    const isSampleCat = categoryId.startsWith("cat-");
    const catName = categories.find((c) => c.id === categoryId)?.name_ru;
    const fullDescription = isSampleCat && catName ? `[${catName}] ${description.trim()}` : description.trim();
    const orderPayload = withRecipient({ client_id: user.id, description: fullDescription, phone: phone.trim(), address: address.trim(), category_id: isSampleCat ? null : (categoryId || null), status: "new", budget: 0 }, recipient, { phone: phone.trim() });
    const { error } = (await Promise.race([
      insertOrder(orderPayload),
      new Promise((resolve) => setTimeout(() => resolve({ error: { message: "Сервер не отвечает. Попробуйте ещё раз или позвоните нам." } }), 15000)),
    ])) as any;
    if (error) {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    } else {
      setSuccess(true);
      syncOrderToLegacyBackend({
        title: "Срочная заявка с сайта emaster.tj",
        description: String(orderPayload.description ?? ""),
        address: address.trim(),
      });
      void (async () => {
      const { data: admins } = await supabase.from("user_roles").select("user_id").in("role", ["admin", "super_admin"]);
      if (admins) {
        await Promise.all(
          admins.map((admin) =>
            supabase.from("notifications").insert(
              buildLocalizedNotification({
                userId: admin.user_id,
                fallbackTitle: `⚡ ${t("qbUrgentOrder")}`,
                fallbackMessage: description.slice(0, 60),
                titleKey: "notifUrgentOrderTitle",
                messageKey: "notifUrgentOrderMessage",
                params: { description: description.slice(0, 60) },
                type: "urgent_order",
              }),
            ),
          ),
        );
      }
      })().catch(() => {});
      toast({ title: "✅ " + t("qbOrderCreated"), description: t("qbOrderCreatedDesc") });
      setTimeout(() => { setSuccess(false); setDescription(""); setPhone(""); setAddress(""); setCategoryId(""); onOpenChange(false); }, 2000);
    }
    } catch (e: any) {
      toast({ title: t("error"), description: String(e?.message || e), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !!description.trim() && !!phone.trim() && !!address.trim();
  const fieldCls = "h-14 rounded-2xl border-slate-200 bg-slate-50/70 pl-12 text-base transition-all focus-visible:border-amber-400 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-amber-200 dark:border-slate-700 dark:bg-slate-800/60";
  const Label = ({ icon: Icon, children }: { icon: any; children: React.ReactNode }) => (
    <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
      <Icon className="h-4 w-4" /> {children}
    </p>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[100dvh] flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:max-h-[90vh] sm:max-w-[460px] sm:rounded-[28px] [&>button]:right-4 [&>button]:top-4 [&>button]:z-20 [&>button]:flex [&>button]:h-9 [&>button]:w-9 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-white/20 [&>button]:text-white [&>button]:opacity-100 [&>button]:backdrop-blur hover:[&>button]:bg-white/30">
        {/* Шапка как в «Вызвать мастера», только в срочных оранжевых тонах */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-6 pb-6 pt-6 text-white">
          <motion.div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 5, repeat: Infinity }} />
          <motion.div initial={{ scale: 0.6, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur">
            <span className="absolute inset-0 rounded-2xl bg-white/20 animate-ping" />
            <Zap className="relative h-7 w-7" />
          </motion.div>
          <DialogTitle className="text-2xl font-black sm:text-3xl">{t("qbUrgentOrder")}</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-white/90">{t("qbDescribeProblem")}</DialogDescription>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-white/95">
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {t("qbAvgResponse")}</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Проверенные мастера</span>
          </div>
        </div>

        {success ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 15 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/30">
              <CheckCircle className="h-10 w-10" />
            </motion.div>
            <p className="text-lg font-black text-foreground">{t("qbOrderSent")}</p>
            <p className="text-sm text-muted-foreground">{t("qbWillFindMaster")}</p>
          </div>
        ) : (
          <>
            {/* Прокручиваемая часть: шапка и кнопка остаются на месте */}
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
              <RecipientFields value={recipient} onChange={setRecipient} />

              <div>
                <Label icon={FileText}>{t("qbWhatHappened")}</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("qbWhatHappenedPlaceholder")}
                  className="min-h-[96px] rounded-2xl border-slate-200 bg-slate-50/70 text-base transition-all focus-visible:border-amber-400 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-amber-200 dark:border-slate-700 dark:bg-slate-800/60" maxLength={500} />
                <p className="mt-1 text-right text-[11px] text-slate-400">{description.length}/500</p>
              </div>

              <div>
                <Label icon={LayoutGrid}>{t("qbCategoryOptional")}</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/70 px-4 text-base dark:border-slate-700 dark:bg-slate-800/60"><SelectValue placeholder={t("qbAutoDetect")} /></SelectTrigger>
                  <SelectContent className="max-h-72">{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name_ru}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div>
                <Label icon={Phone}>{t("qbPhone")}</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+992 900 000 000" className={fieldCls} maxLength={20} />
                </div>
              </div>

              <div>
                <Label icon={MapPin}>{t("qbAddress")}</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input autoComplete="street-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("qbAddressPlaceholder")} className={fieldCls} maxLength={200} />
                </div>
              </div>
            </div>

            {/* Кнопка всегда видна внизу, как в мобильном приложении */}
            <div className="shrink-0 border-t border-slate-100 bg-white px-5 pb-5 pt-4 dark:border-slate-800 dark:bg-slate-950 sm:px-6">
              <button type="button" onClick={handleSubmit} disabled={submitting || !canSubmit}
                className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-base font-black text-white shadow-xl shadow-orange-500/25 transition-all hover:shadow-orange-500/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50">
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5 transition-transform group-hover:scale-125" />}
                {submitting ? t("qbSending") : t("qbSendUrgent")}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <Lock className="h-3.5 w-3.5" /> Мы перезвоним для подтверждения заявки
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
