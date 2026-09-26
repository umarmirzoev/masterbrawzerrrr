import { useState } from "react";
import { Bot, Phone, Copy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AI_AGENT_PHONE, AI_AGENT_PHONE_LABEL } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Окно ИИ-диспетчера: сначала показываем номер, звонок начинается только по кнопке «Позвонить».
export default function AiDispatcherDialog({ open, onOpenChange }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(AI_AGENT_PHONE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* буфер обмена недоступен — ничего страшного */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-3xl p-5 sm:p-6">
        <DialogHeader className="items-center text-center">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg mb-2">
            <Bot className="w-8 h-8 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-lime-400 border-2 border-white dark:border-slate-900 animate-pulse" />
          </div>
          <DialogTitle className="text-2xl font-black">ИИ-диспетчер 24/7</DialogTitle>
          <DialogDescription>
            Ответит сразу, круглосуточно. Расскажите, что случилось, — примем заказ и направим мастера.
          </DialogDescription>
        </DialogHeader>

        <button onClick={copy}
          className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 py-4 flex items-center justify-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <span className="text-2xl font-black tracking-wide text-slate-900 dark:text-white whitespace-nowrap">{AI_AGENT_PHONE_LABEL}</span>
          {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-slate-400" />}
        </button>
        <p className="text-xs text-center text-slate-400 -mt-2">{copied ? "Номер скопирован" : "Нажмите на номер, чтобы скопировать"}</p>

        <a href={`tel:${AI_AGENT_PHONE}`}
          className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-lg font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all">
          <Phone className="w-5 h-5" /> Позвонить
        </a>
      </DialogContent>
    </Dialog>
  );
}
