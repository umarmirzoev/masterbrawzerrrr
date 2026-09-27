import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BadgeCheck, CalendarClock, CheckCircle, Clock, Home, Loader2, Lock, MapPin, MessageSquareText, Navigation, Phone, Send, ShieldCheck, Sparkles, User, Wallet, Wrench } from "lucide-react";
import { tx } from "@/lib/localizeNames";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { buildLocalizedNotification } from "@/lib/notifications";
import { syncOrderToLegacyBackend } from "@/lib/legacySync";
import RecipientFields from "@/components/RecipientFields";
import { emptyRecipient, insertOrder, recipientError, withRecipient, type OrderRecipient } from "@/lib/orderRecipient";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string | null;
  initialServiceName?: string;
  categoryId?: string;
  serviceId?: string;
}

// Это универсальное модальное окно создаёт заявку клиента на вызов мастера.
export default function OrderModal({ isOpen, onClose, category, initialServiceName, categoryId, serviceId }: OrderModalProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [recipient, setRecipient] = useState<OrderRecipient>(emptyRecipient);

  // При каждом открытии модалки сбрасываем промежуточные состояния отправки.
  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setSubmitting(false);
      setRecipient(emptyRecipient);
    }
  }, [isOpen]);

  // После проверки авторизации отправляем заказ в таблицу orders.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: t("login"), description: "Пожалуйста, войдите в аккаунт", variant: "destructive" });
      navigate("/auth");
      onClose();
      return;
    }

    const recipientProblem = recipientError(recipient);
    if (recipientProblem) {
      toast({ title: recipientProblem, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const orderPayload = withRecipient({
      client_id: user.id,
      category_id: categoryId || null,
      service_id: serviceId || null,
      description: `${initialServiceName ? initialServiceName + ". " : ""}${comment}`.trim(),
      address: `${district ? t(district) + ", " : ""}${address}`,
      phone,
      preferred_time: preferredTime || null,
      status: "new",
    }, recipient, { name, phone });
    const { data: createdOrders, error } = await insertOrder(orderPayload);

    setSubmitting(false);

    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      return;
    }

    const createdOrder = createdOrders?.[0];
    if (createdOrder) {
      const { data: admins } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["admin", "super_admin"]);

      if (admins?.length) {
        await Promise.all(
          admins.map((admin) =>
            supabase.from("notifications").insert(
              buildLocalizedNotification({
                userId: admin.user_id,
                fallbackTitle: "Новый заказ",
                fallbackMessage: `${initialServiceName || "Новая заявка"} • ${district ? `${t(district)}, ` : ""}${address}`,
                titleKey: "notifNewOrderTitle",
                messageKey: "notifNewOrderMessage",
                params: {
                  serviceName: initialServiceName || "Новая заявка",
                  location: `${district ? `${t(district)}, ` : ""}${address}`,
                },
                type: "order_created",
                relatedId: createdOrder.id,
              }),
            )
          )
        );
      }
    }

    syncOrderToLegacyBackend({
      title: initialServiceName || category || "Заявка с сайта emaster.tj",
      description: String(orderPayload.description ?? ""),
      address: `${district ? t(district) + ", " : ""}${address}`,
    });

    setSubmitted(true);
    toast({ title: t("orderModalSuccess") });

    setTimeout(() => {
      setSubmitted(false);
      setName("");
      setPhone("");
      setComment("");
      setDistrict("");
      setAddress("");
      setPreferredTime("");
      onClose();
    }, 2000);
  };

  const fieldWrap = "group relative";
  const fieldIcon = "pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600";
  const fieldInput =
    "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-[15px] text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white";
  const sectionLabel = "mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400";
  const timeChips = [
    tx("Как можно скорее", "As soon as possible", "Ҳарчи зудтар"),
    tx("Сегодня вечером", "This evening", "Имрӯз бегоҳ"),
    tx("Завтра утром", "Tomorrow morning", "Пагоҳ саҳар"),
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[100dvh] flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:max-h-[90vh] sm:max-w-[460px] sm:rounded-[28px] [&>button]:right-4 [&>button]:top-4 [&>button]:z-20 [&>button]:flex [&>button]:h-9 [&>button]:w-9 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-white/20 [&>button]:text-white [&>button]:opacity-100 [&>button]:backdrop-blur hover:[&>button]:bg-white/30">
        {/* Зелёная шапка */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 px-6 pb-6 pt-6 text-white">
          <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10 blur-xl" />
          <div className="pointer-events-none absolute -bottom-16 left-10 h-32 w-32 rounded-full bg-teal-300/30 blur-2xl" />
          <DialogHeader className="relative space-y-0 text-left">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 shadow-lg shadow-emerald-900/10 ring-1 ring-white/30 backdrop-blur">
              <Wrench className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-white">{t("orderModalTitle")}</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-emerald-50/90">
              {initialServiceName ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/25">
                  <Sparkles className="h-3.5 w-3.5" /> {initialServiceName}
                </span>
              ) : (
                t("orderModalDesc")
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="relative mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-semibold text-emerald-50">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> {tx("Проверенные мастера", "Verified masters", "Устоҳои санҷидашуда")}</span>
            <span className="flex items-center gap-1"><BadgeCheck className="h-3.5 w-3.5" /> {tx("Гарантия", "Warranty", "Кафолат")}</span>
            <span className="flex items-center gap-1"><Wallet className="h-3.5 w-3.5" /> {tx("Оплата после работы", "Pay after the job", "Пардохт баъди кор")}</span>
          </div>
        </div>

        {/* После отправки показываем состояние успеха, иначе форму создания заявки. */}
        {submitted ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/30">
                <CheckCircle className="h-10 w-10" />
              </div>
            </div>
            <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">{tx("Заявка отправлена!", "Request sent!", "Дархост фиристода шуд!")}</p>
            <p className="max-w-xs text-sm text-slate-500">{t("orderModalSuccess")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
              <RecipientFields value={recipient} onChange={setRecipient} />

              <div>
                <p className={sectionLabel}><User className="h-3.5 w-3.5" /> {tx("Ваши контакты", "Your contacts", "Тамосҳои шумо")}</p>
                <div className="space-y-2.5">
                  <div className={fieldWrap}>
                    <User className={fieldIcon} />
                    <input placeholder={t("formName")} value={name} onChange={(e) => setName(e.target.value)} required className={fieldInput} />
                  </div>
                  <div className={fieldWrap}>
                    <Phone className={fieldIcon} />
                    <input placeholder={t("formPhone")} value={phone} onChange={(e) => setPhone(e.target.value)} required type="tel" className={fieldInput} />
                  </div>
                </div>
              </div>

              <div>
                <p className={sectionLabel}><MapPin className="h-3.5 w-3.5" /> {tx("Куда приехать", "Where to come", "Ба куҷо омадан")}</p>
                <div className="space-y-2.5">
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/70 pl-3.5 text-[15px] focus:ring-4 focus:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-800/60 [&>span]:flex [&>span]:items-center [&>span]:gap-2.5">
                      <span className="flex items-center gap-2.5">
                        <Navigation className="h-[18px] w-[18px] text-slate-400" />
                        <SelectValue placeholder={t("formDistrict")} />
                      </span>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {["districtSino", "districtFirdausi", "districtShomansur", "districtIsmoili"].map((d) => (
                        <SelectItem key={d} value={d} className="rounded-xl">{t(d)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className={fieldWrap}>
                    <Home className={fieldIcon} />
                    <input placeholder={tx("Улица, дом, квартира", "Street, building, apartment", "Кӯча, хона, ҳуҷра")} value={address} onChange={(e) => setAddress(e.target.value)} required className={fieldInput} />
                  </div>
                </div>
              </div>

              <div>
                <p className={sectionLabel}><Clock className="h-3.5 w-3.5" /> {tx("Когда удобно", "When is convenient", "Кай қулай аст")}</p>
                <div className="mb-2.5 flex flex-wrap gap-2">
                  {timeChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setPreferredTime(preferredTime === chip ? "" : chip)}
                      className={`h-9 rounded-full px-3.5 text-xs font-bold transition-all ${
                        preferredTime === chip
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                          : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <div className={fieldWrap}>
                  <CalendarClock className={fieldIcon} />
                  <input placeholder={tx("Или укажите своё время", "Or enter your own time", "Ё вақти худро нависед")} value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} className={fieldInput} />
                </div>
              </div>

              <div>
                <p className={sectionLabel}><MessageSquareText className="h-3.5 w-3.5" /> {tx("Что случилось", "What happened", "Чӣ шуд")}</p>
                <textarea
                  placeholder={t("formComment")}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-[15px] text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
                />
              </div>
            </div>

            {/* Кнопка всегда видна внизу */}
            <div className="shrink-0 border-t border-slate-100 bg-white/95 px-5 pb-5 pt-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
              <button
                type="submit"
                disabled={submitting}
                className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-base font-black text-white shadow-xl shadow-emerald-600/25 transition-all hover:shadow-emerald-600/40 active:scale-[0.99] disabled:opacity-70"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />}
                {recipient.forOther ? tx("Вызвать мастера для близкого", "Call a master for a loved one", "Усто барои наздикон") : t("orderModalSubmit")}
              </button>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
                <Lock className="h-3 w-3" /> {tx("Мы перезвоним для подтверждения заявки", "We will call you to confirm", "Барои тасдиқ занг мезанем")}
              </p>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
