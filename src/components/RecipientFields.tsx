import { Heart, Phone, User, UserRound } from "lucide-react";
import { RECIPIENT_RELATIONS, type OrderRecipient } from "@/lib/orderRecipient";
import { tx } from "@/lib/localizeNames";

interface Props {
  value: OrderRecipient;
  onChange: (value: OrderRecipient) => void;
}

const RELATION_LABELS: Record<string, [string, string, string]> = {
  "Мама": ["👩 Мама", "👩 Mom", "👩 Модар"],
  "Папа": ["👨 Папа", "👨 Dad", "👨 Падар"],
  "Бабушка": ["👵 Бабушка", "👵 Grandma", "👵 Бибӣ"],
  "Дедушка": ["👴 Дедушка", "👴 Grandpa", "👴 Бобо"],
  "Брат / сестра": ["🧑 Брат / сестра", "🧑 Sibling", "🧑 Бародар / хоҳар"],
  "Другое": ["💚 Другое", "💚 Other", "💚 Дигар"],
};

// Переключатель «Для себя / Для близкого» и поля получателя заказа.
export default function RecipientFields({ value, onChange }: Props) {
  const set = (patch: Partial<OrderRecipient>) => onChange({ ...value, ...patch });
  const input =
    "h-12 w-full rounded-2xl border border-rose-200/70 bg-white pl-11 pr-4 text-[15px] text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-400/15 dark:border-rose-500/20 dark:bg-slate-900 dark:text-white";

  return (
    <div className="space-y-3">
      {/* Переключатель */}
      <div className="relative grid grid-cols-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
        <span
          aria-hidden
          className={`absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-xl bg-white shadow-md transition-all duration-300 dark:bg-slate-900 ${
            value.forOther ? "left-[calc(50%+2px)]" : "left-1"
          }`}
        />
        <button
          type="button"
          onClick={() => set({ forOther: false })}
          className={`relative z-10 flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors ${
            !value.forOther ? "text-emerald-700 dark:text-emerald-300" : "text-slate-500"
          }`}
        >
          <User className="h-4 w-4" /> {tx("Для себя", "For me", "Барои худам")}
        </button>
        <button
          type="button"
          onClick={() => set({ forOther: true })}
          className={`relative z-10 flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors ${
            value.forOther ? "text-rose-600 dark:text-rose-300" : "text-slate-500"
          }`}
        >
          <Heart className={`h-4 w-4 ${value.forOther ? "fill-rose-500 text-rose-500" : "text-rose-400"}`} /> {tx("Для близкого", "For a loved one", "Барои наздикон")}
        </button>
      </div>

      {value.forOther && (
        <div className="animate-in fade-in slide-in-from-top-2 space-y-3 rounded-3xl bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 p-4 ring-1 ring-rose-100 duration-300 dark:from-rose-500/10 dark:via-pink-500/5 dark:to-orange-500/5 dark:ring-rose-500/20">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-sm dark:bg-slate-900">
              <Heart className="h-5 w-5 fill-rose-500" />
            </div>
            <p className="text-[13px] leading-snug text-rose-800 dark:text-rose-200">
              {tx(
                "Мастер позвонит и приедет к этому человеку, а вы будете видеть статус заказа у себя — даже из другой страны.",
                "The master will call and visit this person, and you will see the order status — even from another country.",
                "Усто ба ин шахс занг зада меояд, шумо ҳолати фармоишро мебинед — ҳатто аз кишвари дигар.",
              )}
            </p>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-rose-400">{tx("Кому вызываем", "Who is it for", "Барои кӣ")}</p>
            <div className="flex flex-wrap gap-2">
              {RECIPIENT_RELATIONS.map((r) => {
                const active = value.relation === r;
                const label = RELATION_LABELS[r] ? tx(...RELATION_LABELS[r]) : r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => set({ relation: active ? "" : r })}
                    className={`h-9 rounded-full px-3.5 text-xs font-bold transition-all ${
                      active
                        ? "scale-[1.03] bg-rose-500 text-white shadow-md shadow-rose-500/30"
                        : "bg-white text-slate-700 ring-1 ring-rose-100 hover:ring-rose-300 dark:bg-slate-900 dark:text-slate-200 dark:ring-rose-500/20"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-rose-300" />
            <input
              placeholder={tx("Имя (например, Зарина)", "Name (e.g. Zarina)", "Ном (масалан, Зарина)")}
              value={value.name}
              onChange={(e) => set({ name: e.target.value })}
              maxLength={60}
              className={input}
            />
          </div>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-rose-300" />
            <input
              placeholder={tx("Телефон близкого: +992 ...", "Their phone: +992 ...", "Телефони наздикон: +992 ...")}
              type="tel"
              value={value.phone}
              onChange={(e) => set({ phone: e.target.value })}
              maxLength={20}
              className={input}
            />
          </div>
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
