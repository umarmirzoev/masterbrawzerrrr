import { useEffect, useState } from "react";
import { ShieldCheck, ThumbsUp, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { WARRANTY_DAYS, acceptOrderWork, createWarrantyClaim, listWarrantyClaims, warrantyStatusLabel } from "@/lib/orderExtras";

const fmt = (d: string) => new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

// Приёмка работы клиентом и гарантия 30 дней с кнопкой «Пожаловаться».
export default function WorkAcceptance({ order, onChanged }: { order: any; onChanged: () => void }) {
  const { toast } = useToast();
  const [accepting, setAccepting] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [claims, setClaims] = useState<any[]>([]);

  const done = ["completed", "reviewed"].includes(order?.status);
  const supported = order && "client_accepted_at" in order; // миграция применена
  useEffect(() => {
    if (done && supported) listWarrantyClaims(order.id).then(setClaims);
  }, [order?.id, done, supported]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!done || !supported) return null;

  const accept = async () => {
    setAccepting(true);
    try {
      await acceptOrderWork(order.id);
      toast({ title: `✅ Работа принята. Гарантия ${WARRANTY_DAYS} дней включена` });
      onChanged();
    } catch (e) {
      toast({ title: "Ошибка", description: (e as Error).message, variant: "destructive" });
    } finally {
      setAccepting(false);
    }
  };

  const sendClaim = async () => {
    if (message.trim().length < 5) return;
    setSending(true);
    try {
      await createWarrantyClaim(order, message);
      toast({ title: "Жалоба отправлена", description: "Администратор свяжется с вами в ближайшее время." });
      setClaimOpen(false);
      setMessage("");
      setClaims(await listWarrantyClaims(order.id));
    } catch (e) {
      toast({ title: "Ошибка", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const until = order.warranty_until as string | null;
  const active = until ? new Date(until).getTime() > Date.now() : false;

  return (
    <>
      {!order.client_accepted_at ? (
        <Card className="border-amber-200 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/5">
          <CardContent className="p-4 space-y-3">
            <p className="font-semibold text-foreground">Проверьте работу мастера</p>
            <p className="text-sm text-muted-foreground">
              Если всё сделано хорошо — примите работу, и на неё включится гарантия {WARRANTY_DAYS} дней. Если есть замечания — сообщите нам.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={accept} disabled={accepting} className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                {accepting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ThumbsUp className="w-4 h-4 mr-2" />} Принять работу
              </Button>
              <Button variant="outline" onClick={() => setClaimOpen(true)} className="rounded-xl">
                <AlertTriangle className="w-4 h-4 mr-2" /> Есть замечания
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className={active ? "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-500/5" : ""}>
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <ShieldCheck className={`w-8 h-8 shrink-0 ${active ? "text-emerald-600" : "text-muted-foreground"}`} />
            <div className="flex-1">
              <p className="font-semibold text-foreground">{active ? "Гарантия действует" : "Гарантия закончилась"}</p>
              <p className="text-xs text-muted-foreground">Работа принята {fmt(order.client_accepted_at)} · гарантия до {until ? fmt(until) : "—"}</p>
            </div>
            {active && (
              <Button variant="outline" size="sm" onClick={() => setClaimOpen(true)} className="rounded-xl">
                <AlertTriangle className="w-4 h-4 mr-1.5" /> Пожаловаться
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {claims.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="font-semibold text-foreground text-sm">Ваши обращения по гарантии</p>
            {claims.map((c) => (
              <div key={c.id} className="text-sm rounded-lg bg-muted/60 p-2.5">
                <div className="flex justify-between gap-2 text-xs text-muted-foreground mb-1">
                  <span>{new Date(c.created_at).toLocaleDateString("ru-RU")}</span>
                  <span className="font-semibold">{warrantyStatusLabel[c.status] ?? c.status}</span>
                </div>
                {c.message}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Сообщить о проблеме</DialogTitle>
            <DialogDescription>Опишите, что не так с работой. Администратор Master.TJ разберётся и свяжется с вами.</DialogDescription>
          </DialogHeader>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} placeholder="Например: через 3 дня кран снова начал течь" className="min-h-[110px]" />
          <Button onClick={sendClaim} disabled={sending || message.trim().length < 5} className="w-full rounded-xl">
            {sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Отправить
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
