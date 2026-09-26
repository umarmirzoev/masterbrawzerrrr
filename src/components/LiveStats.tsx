import { useEffect, useState } from "react";
import { CheckCircle2, Star, Users } from "lucide-react";
import { fetchPublicStats, type PublicStats } from "@/lib/orderExtras";

// Живые цифры из базы для главной страницы. Обновляются раз в минуту.
export default function LiveStats() {
  const [s, setS] = useState<PublicStats | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => fetchPublicStats().then((d) => alive && setS(d));
    void load();
    const t = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  if (!s) return null;
  const items = [
    s.completed_today >= 0 && { icon: CheckCircle2, value: s.completed_today, label: "заказов выполнено сегодня" },
    s.completed_total > 0 && { icon: CheckCircle2, value: s.completed_total, label: "заказов всего" },
    s.masters_active > 0 && { icon: Users, value: s.masters_active, label: "мастеров на связи" },
    s.avg_rating && { icon: Star, value: s.avg_rating, label: "средний рейтинг" },
  ].filter(Boolean) as { icon: typeof Users; value: number; label: string }[];
  if (!items.length) return null;

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 max-w-xl mb-10">
      <span className="hidden sm:flex relative h-2 w-2 mr-1">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      {items.map((it, i) => (
        <span key={i} className="flex sm:inline-flex items-center gap-2 sm:gap-1.5 px-3 py-2 sm:py-1.5 rounded-2xl sm:rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 shadow-sm">
          <it.icon className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-500 shrink-0" />
          <span className="flex flex-col sm:flex-row sm:gap-1 leading-tight">
            <b className="text-base sm:text-xs text-slate-900 dark:text-white">{it.value}</b>
            <span className="text-[11px] sm:text-xs">{it.label}</span>
          </span>
        </span>
      ))}
    </div>
  );
}
