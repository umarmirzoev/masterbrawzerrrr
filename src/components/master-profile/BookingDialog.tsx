import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { syncOrderToLegacyBackend } from "@/lib/legacySync";
import RecipientFields from "@/components/RecipientFields";
import { emptyRecipient, insertOrder, recipientError, withRecipient, type OrderRecipient } from "@/lib/orderRecipient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const districts = ["Сино", "Фирдавси", "Шохмансур", "Исмоили Сомони", "Пригород"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  master: any;
}

// Диалог бронирования мастера собирает контакты клиента и создаёт заказ прямо из профиля.
export default function MasterBookingDialog({ open, onOpenChange, master }: Props) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [desc, setDesc] = useState("");
  const [time, setTime] = useState("");
  const [recipient, setRecipient] = useState<OrderRecipient>(emptyRecipient);
  const masterServices: string[] = Array.isArray(master?.service_categories) ? master.service_categories : [];
  const [service, setService] = useState("");
  const chosenService = service || masterServices[0] || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Лутфан ворид шавед", variant: "destructive" });
      navigate("/auth");
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
      description: `${chosenService ? chosenService + ". " : ""}Выбранный мастер: ${master?.full_name}. ${desc}`.trim(),
      address: `${district ? district + ", " : ""}${address}`,
      phone,
      preferred_time: time || null,
      status: "new",
    }, recipient, { phone });
    const { error } = await insertOrder(orderPayload);
    setSubmitting(false);
    if (error) {
      toast({ title: "Хатогӣ", description: error.message, variant: "destructive" });
      return;
    }
    syncOrderToLegacyBackend({
      title: chosenService || "Заказ мастеру",
      description: String(orderPayload.description ?? ""),
      address: `${district ? district + ", " : ""}${address}`,
      masterName: master?.full_name,
      masterPhone: master?.phone,
    });
    setDone(true);
    toast({ title: "Фармоиш қабул шуд! Мастер ба зудӣ бо шумо тамос мегирад." });
    setTimeout(() => {
      onOpenChange(false);
      setDone(false);
      setPhone(""); setAddress(""); setDistrict(""); setDesc(""); setTime(""); setRecipient(emptyRecipient); setService("");
    }, 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[100dvh] sm:max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Фармоиши мастер: {master?.full_name}</DialogTitle>
        </DialogHeader>
        {done ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <CheckCircle className="w-12 h-12 text-primary" />
            <p className="font-medium text-foreground">Фармоиш бомуваффақият сабт шуд!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <RecipientFields value={recipient} onChange={setRecipient} />
            {masterServices.length > 0 && (
              <Select value={chosenService} onValueChange={setService}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Хизмат / Услуга" />
                </SelectTrigger>
                <SelectContent>
                  {masterServices.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Input placeholder="Рақами телефон" value={phone} onChange={(e) => setPhone(e.target.value)} required type="tel" className="h-12 text-base" />
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Ноҳия" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Суроға" value={address} onChange={(e) => setAddress(e.target.value)} required className="h-12 text-base" />
            <Input placeholder="Вақти мувофиқ" value={time} onChange={(e) => setTime(e.target.value)} className="h-12 text-base" />
            <Textarea placeholder="Тавсифи мушкилӣ..." value={desc} onChange={(e) => setDesc(e.target.value)} className="text-base min-h-[80px]" />
            <Button type="submit" className="w-full rounded-full h-12 text-base bg-gradient-to-r from-primary to-emerald-500" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t("mpSendOrder")}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
