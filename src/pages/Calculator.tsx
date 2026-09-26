import { useEffect, useMemo, useState } from "react";
import { Calculator as CalcIcon, Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import OrderModal from "@/components/OrderModal";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { SAMPLE_SERVICE_CATEGORIES, SAMPLE_SERVICES } from "@/data/seedData";

interface Svc { id: string; category_id: string; name_ru: string; name_tj?: string | null; name_en?: string | null; price_min?: number | null; price_max?: number | null; price_avg?: number | null }
interface Cat { id: string; name_ru: string; name_tj?: string | null; name_en?: string | null }

const money = (n: number) => `${Math.round(n).toLocaleString("ru-RU")} с.`;

// Калькулятор стоимости: клиент отмечает работы и видит примерную сумму ещё до заказа.
export default function Calculator() {
  const { language } = useLanguage();
  const [cats, setCats] = useState<Cat[]>([]);
  const [services, setServices] = useState<Svc[]>([]);
  const [activeCat, setActiveCat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [orderOpen, setOrderOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("service_categories").select("id, name_ru, name_tj, name_en").order("sort_order"),
      supabase.from("services").select("id, category_id, name_ru, name_tj, name_en, price_min, price_max, price_avg").order("sort_order"),
    ]).then(([c, s]) => {
      setCats((c.data?.length ? c.data : SAMPLE_SERVICE_CATEGORIES) as Cat[]);
      setServices((s.data?.length ? s.data : SAMPLE_SERVICES) as Svc[]);
    }).catch(() => {
      setCats(SAMPLE_SERVICE_CATEGORIES as Cat[]);
      setServices(SAMPLE_SERVICES as Svc[]);
    });
  }, []);

  const name = (x: { name_ru: string; name_tj?: string | null; name_en?: string | null }) =>
    (language === "tj" && x.name_tj) || (language === "en" && x.name_en) || x.name_ru;
  const lo = (s: Svc) => s.price_min ?? s.price_avg ?? 0;
  const hi = (s: Svc) => s.price_max ?? s.price_avg ?? lo(s);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => (activeCat === "all" || s.category_id === activeCat) && (!q || name(s).toLowerCase().includes(q)));
  }, [services, activeCat, search, language]); // eslint-disable-line react-hooks/exhaustive-deps

  const chosen = services.filter((s) => (qty[s.id] ?? 0) > 0);
  const totalLo = chosen.reduce((sum, s) => sum + lo(s) * qty[s.id], 0);
  const totalHi = chosen.reduce((sum, s) => sum + hi(s) * qty[s.id], 0);
  const setCount = (id: string, n: number) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(99, n)) }));

  const summaryText = chosen.map((s) => `${name(s)} ×${qty[s.id]}`).join(", ");
  const orderName = chosen.length ? `Смета: ${summaryText} (≈ ${money(totalLo)}–${money(totalHi)})` : "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      <Header />
      <main className={`container mx-auto px-4 py-8 md:py-12 max-w-6xl ${chosen.length ? "pb-28 lg:pb-12" : ""}`}>
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-4">
            <CalcIcon className="w-3.5 h-3.5" /> Калькулятор
          </span>
          <h1 className="text-3xl md:text-5xl font-black break-words text-slate-900 dark:text-white tracking-tight mb-3">Сколько стоит ремонт?</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-2xl">Отметьте нужные работы — сразу увидите примерную стоимость в сомони. Точную цену мастер назовёт после осмотра.</p>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
          <div className="space-y-4 min-w-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Найти работу: розетка, смеситель…" className="pl-9 h-11 rounded-xl bg-white dark:bg-slate-900" />
            </div>
            <div className="flex flex-wrap gap-2">
              {[{ id: "all", name_ru: "Все" } as Cat, ...cats].map((c) => (
                <button key={c.id} onClick={() => setActiveCat(c.id)}
                  className={`px-4 h-9 rounded-full text-sm font-semibold whitespace-nowrap border transition-colors ${activeCat === c.id ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"}`}>
                  {c.id === "all" ? "Все" : name(c)}
                </button>
              ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              {visible.length === 0 && <p className="p-6 text-center text-sm text-slate-500">Ничего не найдено</p>}
              {visible.map((s) => {
                const n = qty[s.id] ?? 0;
                return (
                  <div key={s.id} className={`flex items-center gap-3 p-3 sm:p-4 ${n ? "bg-emerald-50/50 dark:bg-emerald-500/5" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">{name(s)}</p>
                      <p className="text-xs text-slate-500">{lo(s) === hi(s) ? money(lo(s)) : `${money(lo(s))} – ${money(hi(s))}`} за единицу</p>
                    </div>
                    {n === 0 ? (
                      <Button size="sm" variant="outline" onClick={() => setCount(s.id, 1)} className="rounded-full h-9">
                        <Plus className="w-4 h-4 mr-1" /> Добавить
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setCount(s.id, n - 1)} className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-muted" aria-label="Меньше"><Minus className="w-4 h-4" /></button>
                        <span className="w-7 text-center font-bold">{n}</span>
                        <button onClick={() => setCount(s.id, n + 1)} className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-muted" aria-label="Больше"><Plus className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none p-5 space-y-4">
            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Ваша смета</p>
            {chosen.length === 0 ? (
              <p className="text-sm text-slate-500">Добавьте работы из списка<span className="hidden lg:inline"> слева</span>.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {chosen.map((s) => (
                  <li key={s.id} className="flex items-start justify-between gap-2 text-sm">
                    <span className="text-slate-700 dark:text-slate-200">{name(s)} <span className="text-slate-400">×{qty[s.id]}</span></span>
                    <button onClick={() => setCount(s.id, 0)} className="text-slate-400 hover:text-destructive shrink-0" aria-label="Убрать"><Trash2 className="w-4 h-4" /></button>
                  </li>
                ))}
              </ul>
            )}
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 p-4">
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">Примерно</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                {chosen.length ? (totalLo === totalHi ? money(totalLo) : `${money(totalLo)} – ${money(totalHi)}`) : "0 с."}
              </p>
            </div>
            <Button disabled={!chosen.length} onClick={() => setOrderOpen(true)} className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold">Заказать эти работы</Button>
            {chosen.length > 0 && (
              <button onClick={() => setQty({})} className="w-full text-xs text-slate-500 hover:text-slate-700">Очистить смету</button>
            )}
          </aside>
        </div>
      </main>
      {/* Телефон: итог всегда внизу экрана */}
      {chosen.length > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-500">Выбрано: {chosen.length} · примерно</p>
            <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 truncate">{totalLo === totalHi ? money(totalLo) : `${money(totalLo)} – ${money(totalHi)}`}</p>
          </div>
          <Button onClick={() => setOrderOpen(true)} className="h-11 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold shrink-0">Заказать</Button>
        </div>
      )}
      <Footer />
      <OrderModal isOpen={orderOpen} onClose={() => setOrderOpen(false)} category={null} initialServiceName={orderName} />
    </div>
  );
}
