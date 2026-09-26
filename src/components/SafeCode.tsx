import { useEffect, useState } from "react";
import { ShieldCheck, Lock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { fetchSafeCode, verifySafeCode, SAFE_CODE_ACTIVE_STATUSES } from "@/lib/safeCode";
import { parseRecipient } from "@/lib/orderRecipient";

/** Карточка для заказчика: показывает 4-значный код, пока мастер его не подтвердил. */
export function SafeCodeCard({ order }: { order: any }) {
  const [code, setCode] = useState<string | null>(null);
  const verifiedAt: string | null = order?.safe_code_verified_at ?? null;
  const active = order?.master_id && SAFE_CODE_ACTIVE_STATUSES.includes(order.status);

  useEffect(() => {
    if (!order?.id || verifiedAt || !active) return;
    fetchSafeCode(order.id).then(setCode);
  }, [order?.id, verifiedAt, active]);

  if (verifiedAt) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-500/5">
        <CardContent className="p-4 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
          <div>
            <p className="font-semibold text-foreground">Мастер подтвердил безопасный код</p>
            <p className="text-xs text-muted-foreground">
              {new Date(verifiedAt).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })} — пришёл именно ваш мастер.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (!active || !code) return null;

  const recipient = parseRecipient(order);
  return (
    <Card className="border-sky-200 dark:border-sky-500/30 bg-sky-50/60 dark:bg-sky-500/5">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-5 h-5 text-sky-600" />
          <p className="font-semibold text-foreground">Безопасный код</p>
        </div>
        <div className="flex gap-2 mb-3">
          {code.split("").map((d, i) => (
            <span key={i} className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-background border-2 border-sky-200 dark:border-sky-500/30 flex items-center justify-center text-2xl sm:text-3xl font-black text-foreground tracking-wider">
              {d}
            </span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground leading-snug">
          {recipient
            ? `Передайте этот код близкому (${recipient.name}). При встрече он назовёт его мастеру — так вы будете уверены, что пришёл именно ваш мастер.`
            : "Назовите этот код мастеру при встрече — так вы будете уверены, что пришёл именно ваш мастер."}
          {" "}Не сообщайте код по телефону заранее.
        </p>
      </CardContent>
    </Card>
  );
}

interface DialogProps {
  order: any | null;
  onClose: () => void;
  /** Код подтверждён (или проверка недоступна) — можно начинать работу. */
  onVerified: (order: any) => void;
}

/** Окно для мастера: ввести код, который назвал клиент. */
export function SafeCodeDialog({ order, onClose, onVerified }: DialogProps) {
  const { toast } = useToast();
  const [value, setValue] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setValue("");
    setError("");
  }, [order?.id]);

  const check = async (code: string) => {
    if (!order || code.length !== 4) return;
    setChecking(true);
    setError("");
    try {
      const res = await verifySafeCode(order.id, code);
      if (res === "ok") {
        toast({ title: "✅ Код подтверждён" });
        onVerified(order);
      } else if (res === "unavailable") {
        onVerified(order); // миграция не применена — не блокируем мастера
      } else if (res === "wrong") {
        setError("Неверный код. Попросите клиента назвать код ещё раз.");
        setValue("");
      } else if (res === "locked") {
        setError("Слишком много неверных попыток. Свяжитесь с поддержкой Master.TJ.");
      } else {
        setError("Этот заказ назначен не вам.");
      }
    } catch (e) {
      setError((e as Error).message || "Ошибка проверки кода");
    } finally {
      setChecking(false);
    }
  };

  const recipient = order ? parseRecipient(order) : null;
  return (
    <Dialog open={!!order} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-3xl">
        <DialogHeader className="items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-500/15 flex items-center justify-center mb-1">
            <Lock className="w-7 h-7 text-sky-600" />
          </div>
          <DialogTitle>Безопасный код</DialogTitle>
          <DialogDescription>
            Попросите клиента{recipient ? ` (${recipient.name})` : ""} назвать 4 цифры из заказа и введите их. После этого можно начинать работу.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 py-2">
          <InputOTP
            maxLength={4}
            value={value}
            onChange={(v) => {
              const digits = v.replace(/\D/g, "");
              setValue(digits);
              if (digits.length === 4) void check(digits);
            }}
            inputMode="numeric"
            autoFocus
          >
            <InputOTPGroup>
              {[0, 1, 2, 3].map((i) => (
                <InputOTPSlot key={i} index={i} className="w-12 h-14 text-2xl font-bold" />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <p className="text-sm text-destructive min-h-5 text-center">{error}</p>
          <Button onClick={() => check(value)} disabled={value.length !== 4 || checking} className="w-full h-11 rounded-xl">
            {checking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
            Проверить и начать работу
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Бейдж для карточки заказа мастера/админа. */
export function SafeCodeBadge({ order }: { order: any }) {
  if (!order?.safe_code_verified_at) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
      <ShieldCheck className="w-3 h-3" /> Код подтверждён
    </span>
  );
}
