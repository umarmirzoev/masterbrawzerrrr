import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, MapPin, Trash2, ExternalLink, Package, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { SmartProductImage } from "@/components/shop/SmartProductImage";
import { getFallbackProductById, isFallbackProductId } from "@/data/shopFallback";

// В избранном добавляем товары "fallback-*" (их не завели в таблице shop_products
// как настоящие UUID) — вставить такой id в колонку favorites.item_id (тип uuid)
// напрямую нельзя, база отвечает "invalid input syntax for type uuid". Поэтому
// такие избранные храним локально в этом браузере, а настоящие товары/мастера — в базе.
const LOCAL_FAVORITES_KEY = "mc_fallback_favorites";

export const getLocalFavorites = (): FavoriteItem[] => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_FAVORITES_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveLocalFavorites = (list: FavoriteItem[]) => {
  localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(list));
};

interface FavoriteItem {
  id: string;
  item_type: string;
  item_id: string;
  created_at: string;
  details?: any;
}

// Хук избранного управляет сохранёнными пользователем мастерами, услугами и товарами.
export function useFavorites(userId?: string) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const loadFavorites = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    const local = getLocalFavorites().filter(f => f.item_id && f.item_type && (f as any).user_id === userId);
    setFavorites([...local, ...((data as any[]) || [])]);
  };

  useEffect(() => { loadFavorites(); }, [userId]);

  const toggleFavorite = async (itemType: string, itemId: string) => {
    if (!userId) return false;
    const existing = favorites.find(f => f.item_type === itemType && f.item_id === itemId);
    if (existing) {
      if (isFallbackProductId(itemId)) {
        saveLocalFavorites(getLocalFavorites().filter(f => f.id !== existing.id));
      } else {
        await supabase.from("favorites").delete().eq("id", existing.id);
      }
      setFavorites(prev => prev.filter(f => f.id !== existing.id));
      return false;
    } else if (isFallbackProductId(itemId)) {
      const entry: FavoriteItem & { user_id: string } = {
        id: `local-fav-${crypto.randomUUID()}`,
        user_id: userId,
        item_type: itemType,
        item_id: itemId,
        created_at: new Date().toISOString(),
      };
      saveLocalFavorites([entry, ...getLocalFavorites()]);
      setFavorites(prev => [entry, ...prev]);
      return true;
    } else {
      const { data } = await supabase.from("favorites").insert({
        user_id: userId, item_type: itemType, item_id: itemId,
      }).select().single();
      if (data) setFavorites(prev => [data as any, ...prev]);
      return true;
    }
  };

  const isFavorite = (itemType: string, itemId: string) =>
    favorites.some(f => f.item_type === itemType && f.item_id === itemId);

  return { favorites, toggleFavorite, isFavorite, refetch: loadFavorites };
}

// Кнопка избранного позволяет быстро сохранить или убрать конкретную сущность.
export function FavoriteButton({ itemType, itemId, size = "sm" }: { itemType: string; itemId: string; size?: "sm" | "default" }) {
  const { user } = useAuth();
  const { favorites, toggleFavorite, isFavorite } = useFavoriteContext();
  const { toast } = useToast();
  const { t } = useLanguage();
  const active = isFavorite(itemType, itemId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast({ title: t("pleaseLogin"), variant: "destructive" }); return; }
    const added = await toggleFavorite(itemType, itemId);
    toast({ title: added ? t("favAdded") : t("favRemoved") });
  };

  return (
    <Button
      variant="ghost"
      size={size}
      className={`rounded-full ${size === "sm" ? "h-8 w-8 p-0" : "h-10 w-10 p-0"}`}
      onClick={handleClick}
    >
      <Heart className={`w-4 h-4 ${active ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
    </Button>
  );
}

// Simple context for favorite state sharing
import { createContext, useContext, ReactNode } from "react";

interface FavCtx {
  favorites: FavoriteItem[];
  toggleFavorite: (type: string, id: string) => Promise<boolean>;
  isFavorite: (type: string, id: string) => boolean;
  refetch: () => void;
}

const FavContext = createContext<FavCtx | null>(null);

// Провайдер избранного передаёт общее состояние в дочерние компоненты.
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const ctx = useFavorites(user?.id);
  return <FavContext.Provider value={ctx}>{children}</FavContext.Provider>;
}

export function useFavoriteContext() {
  const ctx = useContext(FavContext);
  if (!ctx) return { favorites: [], toggleFavorite: async () => false, isFavorite: () => false, refetch: () => {} } as FavCtx;
  return ctx;
}

// Экран избранного собирает сохранённые объекты пользователя по категориям.
export default function FavoritesSection() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [masterDetails, setMasterDetails] = useState<Record<string, any>>({});
  const [productDetails, setProductDetails] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("favorites").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    const local = getLocalFavorites().filter(f => (f as any).user_id === user.id);
    const favs = [...local, ...((data as any[]) || [])];
    setFavorites(favs);

    const masterIds = favs.filter(f => f.item_type === "master").map(f => f.item_id);
    const productIds = favs.filter(f => f.item_type === "product").map(f => f.item_id);
    const realProductIds = productIds.filter(id => !isFallbackProductId(id));
    const fallbackProductIds = productIds.filter(id => isFallbackProductId(id));

    if (masterIds.length > 0) {
      const { data: ms } = await supabase.from("master_listings").select("id, full_name, average_rating, total_reviews, service_categories, working_districts, price_min").in("id", masterIds);
      const map: Record<string, any> = {};
      (ms || []).forEach(m => { map[m.id] = m; });
      setMasterDetails(map);
    }
    if (realProductIds.length > 0 || fallbackProductIds.length > 0) {
      const map: Record<string, any> = {};
      if (realProductIds.length > 0) {
        const { data: ps } = await supabase.from("shop_products").select("id, name, price, old_price, image_url, rating").in("id", realProductIds);
        (ps || []).forEach(p => { map[p.id] = p; });
      }
      fallbackProductIds.forEach(id => {
        const fb = getFallbackProductById(id);
        if (fb) map[id] = fb;
      });
      setProductDetails(map);
    }
    setLoading(false);
  };

  useEffect(() => { loadFavorites(); }, [user]);

  const removeFavorite = async (id: string) => {
    if (id.startsWith("local-fav-")) {
      saveLocalFavorites(getLocalFavorites().filter(f => f.id !== id));
    } else {
      await supabase.from("favorites").delete().eq("id", id);
    }
    setFavorites(prev => prev.filter(f => f.id !== id));
    toast({ title: t("favRemoved") });
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">{t("loading")}</div>;

  const masterFavs = favorites.filter(f => f.item_type === "master");
  const productFavs = favorites.filter(f => f.item_type === "product");
  const serviceFavs = favorites.filter(f => f.item_type === "service");

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-lg font-medium text-foreground">{t("favEmpty")}</p>
        <p className="text-sm text-muted-foreground">{t("favEmptyDesc")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {masterFavs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" /> {t("favMasters")} ({masterFavs.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {masterFavs.map(fav => {
              const m = masterDetails[fav.item_id];
              if (!m) return null;
              return (
                <Card key={fav.id} className="group hover:shadow-md transition-all">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-bold shrink-0">
                      {m.full_name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/masters/${m.id}`} className="font-semibold text-foreground hover:text-primary transition-colors truncate block">{m.full_name}</Link>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{m.average_rating}</span>
                        <span className="text-xs text-muted-foreground">({m.total_reviews})</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {m.working_districts?.[0]}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link to={`/masters/${m.id}`}>
                        <Button size="sm" variant="outline" className="rounded-full h-8 w-8 p-0">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button size="sm" variant="ghost" className="rounded-full h-8 w-8 p-0 text-red-500" onClick={() => removeFavorite(fav.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {productFavs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> {t("favProducts")} ({productFavs.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {productFavs.map(fav => {
              const p = productDetails[fav.item_id];
              if (!p) return null;
              return (
                <Card key={fav.id} className="group hover:shadow-md transition-all">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0">
                      <SmartProductImage product={p} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/shop/product/${p.id}`} className="font-semibold text-foreground hover:text-primary transition-colors truncate block">{p.name}</Link>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-foreground">{p.price} сом.</span>
                        {p.old_price && <span className="line-through text-muted-foreground text-xs">{p.old_price}</span>}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="rounded-full h-8 w-8 p-0 text-red-500" onClick={() => removeFavorite(fav.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
