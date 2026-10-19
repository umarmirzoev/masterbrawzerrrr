import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SmartProductImage } from "@/components/shop/SmartProductImage";
import { getFallbackProductById, isFallbackProductId } from "@/data/shopFallback";
import {
  getLocalShopOrderById,
  getLocalShopOrderItemsMap,
  getLocalShopOrdersByUser,
  mergeShopOrders,
  updateLocalShopOrderStatus,
} from "@/lib/localShopOrders";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  TicketPercent,
  Wrench,
  XCircle,
  ChevronDown,
  ShoppingCart,
  Store,
  RefreshCw,
} from "lucide-react";
import { productName } from "@/lib/localizeNames";

type ShopOrder = {
  id: string;
  created_at: string;
  updated_at: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  status: string;
  delivery_address: string | null;
  phone: string | null;
  customer_name: string | null;
  comments: string | null;
  payment_method: string | null;
  payment_status: string;
  promo_code: string | null;
};

type ShopOrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  include_installation: boolean | null;
  installation_price: number | null;
};

type ShopOrderProduct = {
  id: string;
  name: string;
  image_url: string | null;
  images: string[] | null;
  price: number;
  category_id: string;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Ожидает подтверждения", className: "border-amber-200 bg-amber-100 text-amber-800 animate-pulse" },
  confirmed: { label: "Подтвержден", className: "border-sky-200 bg-sky-100 text-sky-800" },
  processing: { label: "Собирается", className: "border-violet-200 bg-violet-100 text-violet-800" },
  shipped: { label: "В пути", className: "border-blue-200 bg-blue-100 text-blue-800" },
  delivered: { label: "Доставлен", className: "border-emerald-200 bg-emerald-100 text-emerald-800" },
  completed: { label: "Завершен", className: "border-emerald-200 bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Отменен", className: "border-rose-200 bg-rose-100 text-rose-800" },
};

const paymentMethodLabels: Record<string, string> = {
  cash: "Наличными при получении",
  card: "Картой при получении",
  transfer: "Перевод на карту",
};

const paymentStatusLabels: Record<string, string> = {
  unpaid: "Оплата при получении",
  pending: "Ожидает оплаты",
  paid: "Оплачено",
  failed: "Ошибка оплаты",
};

// Список покупок. embedded = показываем внутри кабинета (без шапки сайта и без ухода со страницы).
export function ShopOrdersList({ embedded = false }: { embedded?: boolean }) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const createdOrderId = searchParams.get("created");
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [orderItems, setOrderItems] = useState<ShopOrderItem[]>([]);
  const [products, setProducts] = useState<Record<string, ShopOrderProduct>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);

  // Запрос к базе с таймаутом: если Supabase не отвечает, показываем то, что сохранено в браузере.
  const withTimeout = <T,>(p: PromiseLike<T>, ms = 8000): Promise<T> =>
    Promise.race([Promise.resolve(p), new Promise<T>((resolve) => setTimeout(() => resolve({ data: null, error: { message: "timeout" } } as any), ms))]);

  const loadOrders = async () => {
    if (!user) return;

    setLoading((prev) => prev || orders.length === 0);
    try {

    const { data: ordersData, error: ordersError } = await withTimeout(
      supabase
        .from("shop_orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    );

    // Даже если база не ответила — показываем локально сохранённые покупки, а не пустой экран.
    const loadedOrders = mergeShopOrders(
      ((!ordersError && ordersData) || []) as ShopOrder[],
      getLocalShopOrdersByUser(user.id) as ShopOrder[],
    );
    setOrders(loadedOrders);

    if (loadedOrders.length === 0) {
      setOrderItems([]);
      setProducts({});
      setLoading(false);
      return;
    }

    const orderIds = loadedOrders.map((order) => order.id);
    const realOrderIds = orderIds.filter((id) => !getLocalShopOrderById(id));
    const { data: itemsData } = realOrderIds.length
      ? await withTimeout(supabase.from("shop_order_items").select("*").in("order_id", realOrderIds))
      : { data: [] as any[] };

    const loadedItems = (itemsData || []) as ShopOrderItem[];
    
    const storedItems = getLocalShopOrderItemsMap();
    const fallbackItems = orderIds.flatMap((id) => storedItems[id] || []);

    const allItems = [...loadedItems, ...fallbackItems];
    setOrderItems(allItems);

    const productIds = [...new Set(allItems.map((item) => item.product_id))];
    const realProductIds = productIds.filter(pid => !isFallbackProductId(pid));
    
    let productsMap: Record<string, ShopOrderProduct> = {};

    if (realProductIds.length > 0) {
      const { data: productsData } = await withTimeout(
        supabase
          .from("shop_products")
          .select("id, name, image_url, images, price, category_id")
          .in("id", realProductIds),
      );

      productsMap = Object.fromEntries(((productsData || []) as ShopOrderProduct[]).map((product) => [product.id, product]));
    }

    productIds.filter(pid => isFallbackProductId(pid)).forEach(pid => {
      const fbProduct = getFallbackProductById(pid);
      if (fbProduct) productsMap[pid] = fbProduct as any;
    });

    setProducts(productsMap);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    // Не редиректим на /auth, пока сессия ещё восстанавливается — иначе
    // залогиненного пользователя на секунду кидает на страницу входа.
    if (authLoading) return;

    if (!user) {
      navigate("/auth");
      return;
    }

    loadOrders();
  }, [navigate, user, authLoading]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "mc_local_shop_orders" || event.key === "mc_fallback_orders") {
        void loadOrders();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [user]);

  const itemsByOrder = useMemo(
    () =>
      orderItems.reduce<Record<string, ShopOrderItem[]>>((acc, item) => {
        if (!acc[item.order_id]) acc[item.order_id] = [];
        acc[item.order_id].push(item);
        return acc;
      }, {}),
    [orderItems],
  );

  // Сводка расходов по магазину: сколько всего заказано и потрачено
  // (отменённые заказы в сумму расходов не считаем).
  const spendSummary = useMemo(() => {
    const activeOrders = orders.filter((order) => order.status !== "cancelled");
    return {
      totalOrders: orders.length,
      activeCount: activeOrders.length,
      totalSpent: activeOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    };
  }, [orders]);

  const cancelOrder = async (orderId: string) => {
    setCancelId(orderId);
    const localOrder = getLocalShopOrderById(orderId);
    let error = null;

    if (localOrder) {
      updateLocalShopOrderStatus(orderId, "cancelled");
    } else {
      const result = await supabase
        .from("shop_orders")
        .update({ status: "cancelled" })
        .eq("id", orderId)
        .eq("user_id", user?.id)
        .eq("status", "pending");
      error = result.error;
    }

    setCancelId(null);

    if (error) {
      toast({ title: "Не удалось отменить заказ", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Заказ отменен", description: "Статус обновлен и администраторы уведомлены." });
    await loadOrders();
  };

  return (
      <div className={embedded ? "" : "container mx-auto max-w-5xl px-4 py-8"}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            {!embedded && (
              <Link to="/shop" className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                В магазин
              </Link>
            )}
            <div>
              {!embedded && <p className="text-sm text-muted-foreground">Магазин / Мои заказы</p>}
              <h1 className={`${embedded ? "text-xl" : "text-3xl"} font-bold text-foreground flex items-center gap-2`}>
                {embedded && <ShoppingBag className="h-5 w-5 text-emerald-500" />}
                {embedded ? "Мои покупки" : "Мои заказы"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Здесь видны ваши покупки, статусы, скидки, оплата и состав заказа.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Обновить"
              onClick={refresh}
              className="rounded-full transition-colors hover:bg-emerald-50 hover:text-emerald-600"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button asChild variant="outline" className="group rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-700">
              <Link to="/cart"><ShoppingCart className="mr-1.5 h-4 w-4 transition-transform duration-300 group-hover:-rotate-12" />Корзина</Link>
            </Button>
            <Button asChild className="group rounded-full bg-gradient-to-r from-primary to-emerald-500 shadow-md shadow-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-300">
              <Link to="/shop"><Store className="mr-1.5 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />Продолжить покупки</Link>
            </Button>
          </div>
        </motion.div>

        {!loading && orders.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}>
            <Card className="group border-border/70 transition-shadow duration-300 hover:shadow-lg">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-2xl bg-primary/10 p-2.5 transition-transform duration-500 group-hover:rotate-[-12deg] group-hover:scale-110">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Всего заказов</p>
                  <p className="text-xl font-bold text-foreground">{spendSummary.totalOrders}</p>
                </div>
              </CardContent>
            </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} whileHover={{ y: -4 }}>
            <Card className="group border-border/70 transition-shadow duration-300 hover:shadow-lg">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-2xl bg-emerald-100 p-2.5 transition-transform duration-500 group-hover:rotate-[12deg] group-hover:scale-110">
                  <CreditCard className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Всего потрачено</p>
                  <p className="text-xl font-bold text-foreground">{spendSummary.totalSpent} сомонӣ</p>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </div>
        )}

        {createdOrderId && (
          <Card className="mb-6 border-emerald-200 bg-emerald-50/70">
            <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Заказ успешно оформлен</h2>
                  <p className="text-sm text-muted-foreground">
                    Номер заказа: <span className="font-medium text-foreground">#{createdOrderId.slice(0, 8).toUpperCase()}</span>
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  searchParams.delete("created");
                  setSearchParams(searchParams);
                }}
              >
                Понятно
              </Button>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="relative overflow-hidden border-dashed border-primary/30 bg-primary/5">
            <motion.div aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-emerald-200/40 blur-2xl" animate={{ x: [0, 40, 0], y: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
            <CardContent className="relative py-16 text-center">
              <motion.div animate={{ y: [0, -10, 0], rotate: [0, -4, 4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-primary/50" />
              </motion.div>
              <h2 className="mb-2 text-2xl font-bold text-foreground">У вас пока нет заказов</h2>
              <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
                Добавьте товары в корзину, оформите покупку и здесь появится история ваших заказов.
              </p>
              <Button asChild className="group relative overflow-hidden rounded-full bg-gradient-to-r from-primary to-emerald-500 px-6 shadow-lg shadow-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-300">
                <Link to="/shop">
                  <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <Store className="relative mr-2 h-4 w-4" /><span className="relative">Перейти в магазин</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => {
              const config = statusConfig[order.status] || {
                label: order.status,
                className: "border-border bg-muted text-foreground",
              };
              const items = itemsByOrder[order.id] || [];
              const isNewlyCreated = createdOrderId === order.id;

              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx, 8) * 0.06 }} whileHover={{ y: -3 }}>
                <Card
                  className={`overflow-hidden border-border/70 transition-shadow duration-300 hover:shadow-xl hover:shadow-emerald-100/50 ${isNewlyCreated ? "ring-2 ring-emerald-400/60" : ""}`}
                >
                  <CardContent className="p-0">
                    <div className="border-b border-border/60 bg-muted/20 p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-bold text-foreground">
                              Заказ #{order.id.slice(0, 8).toUpperCase()}
                            </h2>
                            <Badge className={config.className}>{config.label}</Badge>
                            {isNewlyCreated && <Badge className="bg-emerald-600 text-white">Новый заказ</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleString("ru-RU", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-sm text-muted-foreground">Итого</p>
                          <p className="text-2xl font-bold text-primary">{order.total} сомонӣ</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 border-b border-border/60 p-5 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl bg-muted/30 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50/60 hover:shadow-sm dark:hover:bg-emerald-500/10">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Получатель</p>
                        <p className="font-medium text-foreground">{order.customer_name || "Клиент"}</p>
                        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {order.phone || "Не указан"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-muted/30 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50/60 hover:shadow-sm dark:hover:bg-emerald-500/10">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Доставка</p>
                        <p className="flex items-start gap-2 text-sm text-foreground">
                          <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                          <span>{order.delivery_address || "Адрес не указан"}</span>
                        </p>
                      </div>
                      <div className="rounded-2xl bg-muted/30 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50/60 hover:shadow-sm dark:hover:bg-emerald-500/10">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Оплата</p>
                        <p className="flex items-start gap-2 text-sm text-foreground">
                          <CreditCard className="mt-0.5 h-4 w-4 text-primary" />
                          <span>{paymentMethodLabels[order.payment_method || "cash"] || "Не указана"}</span>
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {paymentStatusLabels[order.payment_status || "unpaid"] || order.payment_status}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-muted/30 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50/60 hover:shadow-sm dark:hover:bg-emerald-500/10">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Скидка</p>
                        {order.discount_amount > 0 ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-emerald-700">{order.discount_amount} сомонӣ</p>
                            {order.promo_code && (
                              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                <TicketPercent className="h-4 w-4 text-primary" />
                                {order.promo_code}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Без скидки</p>
                        )}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold text-foreground">Товары в заказе</h3>
                          <Badge variant="secondary">{items.length}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {order.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full text-destructive transition-all duration-300 hover:-translate-y-0.5 hover:bg-destructive hover:text-white"
                              onClick={() => cancelOrder(order.id)}
                              disabled={cancelId === order.id}
                            >
                              {cancelId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                              Отменить
                            </Button>
                          )}
                          {embedded ? (
                            items.length > 2 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-700"
                                onClick={() => setExpanded((p) => ({ ...p, [order.id]: !p[order.id] }))}
                              >
                                {expanded[order.id] ? "Свернуть" : `Все товары (${items.length})`}
                                <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-300 ${expanded[order.id] ? "rotate-180" : ""}`} />
                              </Button>
                            )
                          ) : (
                            <Button asChild variant="outline" size="sm" className="rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-700">
                              <Link to={`/shop/orders/${order.id}`}>Открыть заказ</Link>
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <AnimatePresence initial={false}>
                        {(expanded[order.id] ? items : items.slice(0, 2)).map((item) => {
                          const product = products[item.product_id];
                          const installationTotal = item.include_installation
                            ? (item.installation_price || 0) * item.quantity
                            : 0;
                          const itemTotal = item.price * item.quantity + installationTotal;

                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="group flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 p-4 transition-all duration-300 hover:border-emerald-200 hover:shadow-md md:flex-row md:items-center md:justify-between"
                            >
                              <div className="flex min-w-0 items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-muted/30 transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2">
                                  {product ? (
                                    <SmartProductImage
                                      product={product}
                                      alt={product.name}
                                      className="h-full w-full object-contain"
                                    />
                                  ) : (
                                    <Package className="h-8 w-8 text-muted-foreground/40" />
                                  )}
                                </div>
                                <div className="min-w-0 space-y-1">
                                  <p className="font-medium text-foreground">
                                    {productName(product?.name) || "Товар больше недоступен"}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.price} сомонӣ x {item.quantity}
                                  </p>
                                  {item.include_installation && (
                                    <p className="inline-flex items-center gap-1 text-sm text-emerald-700">
                                      <Wrench className="h-4 w-4" />
                                      Установка включена
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Сумма позиции</p>
                                <p className="text-lg font-bold text-foreground">{itemTotal} сомонӣ</p>
                              </div>
                            </motion.div>
                          );
                        })}
                        </AnimatePresence>

                        {items.length > 2 && !expanded[order.id] && (
                          <p className="text-sm text-muted-foreground">
                            И еще {items.length - 2} товар(а) внутри заказа.
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
  );
}

export default function ShopOrders() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ShopOrdersList />
      <Footer />
    </div>
  );
}
