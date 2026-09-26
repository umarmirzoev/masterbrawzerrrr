import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, RotateCcw, User, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

// «Мои мастера»: мастера, у которых клиент уже заказывал, — вызвать снова в один клик.
export default function MyMasters({ orders }: { orders: any[] }) {
  const navigate = useNavigate();
  const [masters, setMasters] = useState<any[] | null>(null);

  const stats = useMemo(() => {
    const map = new Map<string, { count: number; last: string }>();
    for (const o of orders) {
      if (!o.master_id || o.status === "cancelled") continue;
      const cur = map.get(o.master_id) ?? { count: 0, last: o.created_at };
      map.set(o.master_id, { count: cur.count + 1, last: cur.last > o.created_at ? cur.last : o.created_at });
    }
    return map;
  }, [orders]);

  useEffect(() => {
    const ids = [...stats.keys()];
    if (!ids.length) { setMasters([]); return; }
    const list = ids.join(",");
    supabase
      .from("master_listings")
      .select("id, user_id, full_name, avatar_url, average_rating, total_reviews, service_categories")
      .or(`id.in.(${list}),user_id.in.(${list})`)
      .then(({ data }) => setMasters(data ?? []));
  }, [stats]);

  const statFor = (m: any) => stats.get(m.user_id) ?? stats.get(m.id) ?? { count: 0, last: "" };

  if (masters === null) {
    return <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>;
  }
  if (!masters.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">Здесь появятся мастера, у которых вы уже заказывали</p>
          <Button onClick={() => navigate("/masters")} className="rounded-full">Найти мастера</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {masters
        .sort((a, b) => (statFor(b).last > statFor(a).last ? 1 : -1))
        .map((m) => {
          const st = statFor(m);
          const initials = (m.full_name || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2);
          return (
            <Card key={m.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {m.avatar_url ? (
                    <img src={m.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">{initials}</div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{m.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{(m.service_categories ?? []).slice(0, 2).join(", ")}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {m.average_rating ?? "—"} · заказов у вас: {st.count}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => navigate(`/master/${m.id}?book=1`)} className="flex-1 rounded-full gap-1.5 text-xs">
                    <RotateCcw className="w-3.5 h-3.5" /> Заказать снова
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/master/${m.id}`)} className="rounded-full gap-1.5 text-xs">
                    <User className="w-3.5 h-3.5" /> Профиль
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
