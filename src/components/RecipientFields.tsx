import { Heart, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RECIPIENT_RELATIONS, type OrderRecipient } from "@/lib/orderRecipient";

interface Props {
  value: OrderRecipient;
  onChange: (value: OrderRecipient) => void;
}

// Переключатель «Для себя / Для близкого» и поля получателя заказа.
export default function RecipientFields({ value, onChange }: Props) {
  const set = (patch: Partial<OrderRecipient>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-muted">
        <button
          type="button"
          onClick={() => set({ forOther: false })}
          className={`flex items-center justify-center gap-1.5 h-10 rounded-lg text-sm font-semibold transition-all ${!value.forOther ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
        >
          <User className="w-4 h-4" /> Для себя
        </button>
        <button
          type="button"
          onClick={() => set({ forOther: true })}
          className={`flex items-center justify-center gap-1.5 h-10 rounded-lg text-sm font-semibold transition-all ${value.forOther ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
        >
          <Heart className="w-4 h-4 text-rose-500" /> Для близкого
        </button>
      </div>

      {value.forOther && (
        <div className="space-y-3 rounded-2xl border border-rose-100 dark:border-rose-500/20 bg-rose-50/60 dark:bg-rose-500/5 p-3">
          <p className="text-xs text-rose-700 dark:text-rose-300 leading-snug">
            Мастер позвонит и приедет к этому человеку, а вы будете видеть статус заказа у себя — даже из другой страны.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {RECIPIENT_RELATIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => set({ relation: value.relation === r ? "" : r })}
                className={`px-3 h-8 rounded-full text-xs font-semibold border transition-colors ${value.relation === r ? "bg-rose-500 border-rose-500 text-white" : "bg-background border-border text-foreground hover:border-rose-300"}`}
              >
                {r}
              </button>
            ))}
          </div>
          <Input
            placeholder="Имя (например, Зарина)"
            value={value.name}
            onChange={(e) => set({ name: e.target.value })}
            maxLength={60}
            className="h-11 text-base bg-background"
          />
          <Input
            placeholder="Телефон близкого: +992 ..."
            type="tel"
            value={value.phone}
            onChange={(e) => set({ phone: e.target.value })}
            maxLength={20}
            className="h-11 text-base bg-background"
          />
        </div>
      )}
    </div>
  );
}

/** Бейдж «Заказ для близкого» для карточек заказа в кабинетах. */
export function RecipientBadge({ recipient }: { recipient: { name: string; relation: string; phone: string } | null }) {
  if (!recipient) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
      <Heart className="w-3 h-3" />
      Для: {recipient.name}
      {recipient.relation ? ` (${recipient.relation.toLowerCase()})` : ""}
      {recipient.phone ? ` · ${recipient.phone}` : ""}
    </span>
  );
}
