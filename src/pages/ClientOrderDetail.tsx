import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { statusColors, statusLabels, OrderTimeline } from "@/components/dashboard/OrderStatusShared";
import { PaymentDialog, PaymentStatusBadge, PriceBreakdown, ReceiptDialog } from "@/components/payment/PaymentComponents";
import OrderChat from "@/components/OrderChat";
import ReviewModal from "@/components/dashboard/ReviewModal";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Star,
  XCircle,
} from "lucide-react";

// Отдельная страница одного заказа услуги — раньше это было модальное окно
// внутри кабинета, теперь у заказа есть свой адрес (как у покупок в магазине).
export default function ClientOrderDetail() {
  const { id } = useParams();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any | null>(null);
  const [masterInfo, setMasterInfo] = useState<any>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [payOrder, setPayOrder] = useState<any>(null);
  const [receiptOrder, setReceiptOrder] = useState<any>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = async () => {
    if (!user || !id) return;
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*, service_categories(name_ru), services(name_ru)")
      .eq("id", id)
      .eq("client_id", user.id)
      .maybeSingle();
    setOrder(data || null);

    if (data?.master_id) {
      const { data: listing } = await supabase
        .from("master_listings")
        .select("*")
        .eq("user_id", data.master_id)
        .maybeSingle();
      if (!listing) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", data.master_id)
          .maybeSingle();
        setMasterInfo(profileData);
      } else {
        setMasterInfo(listing);
      }
    } else {
      setMasterInfo(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Не редиректим на /auth, пока сессия ещё восстанавливается — иначе
    // залогиненного пользователя на секунду кидает на страницу входа.
    if (authLoading) return;

    if (!user) {
      navigate("/auth");
      return;
    }
    if (!id) {
      navigate("/dashboard");
      return;
    }

    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, authLoading]);

  const cancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    setCancelling(false);
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Заказ отменён" });
    loadOrder();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> В кабинет
        </Link>

        {!order ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <p className="text-lg font-semibold text-foreground mb-2">Заказ не найден</p>
              <p className="text-muted-foreground mb-6">Возможно, он был удалён, или у вас нет к нему доступа.</p>
              <Button asChild className="rounded-full">
                <Link to="/dashboard">К моим заказам</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Заказ #{order.id.slice(0, 8).toUpperCase()}</p>
                <h1 className="text-2xl font-bold text-foreground mt-1">
                  {order.services?.name_ru || order.service_categories?.name_ru || "Заказ"}
                </h1>
              </div>
              <Badge className={statusColors[order.status] || "bg-muted"}>
                {statusLabels[order.status] || order.status}
              </Badge>
            </div>

            {order.description && (
              <Card>
                <CardContent className="p-4 text-sm text-muted-foreground">{order.description}</CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Адрес
                  </p>
                  <p className="font-medium text-foreground">{order.address || "—"}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Телефон
                  </p>
                  <p className="font-medium text-foreground">{order.phone || "—"}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Дата заказа
                  </p>
                  <p className="font-medium text-foreground">{new Date(order.created_at).toLocaleString("ru-RU")}</p>
                </CardContent>
              </Card>
              {order.budget > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Бюджет</p>
                    <p className="font-medium text-foreground">{order.budget} сомонӣ</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {masterInfo && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-primary mb-2">Назначенный мастер</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                      {masterInfo.full_name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{masterInfo.full_name}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {masterInfo.average_rating && (
                          <span className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {masterInfo.average_rating}
                          </span>
                        )}
                        {masterInfo.experience_years && <span>{masterInfo.experience_years} лет опыта</span>}
                        {masterInfo.phone && (
                          <a href={`tel:${masterInfo.phone}`} className="text-primary hover:underline flex items-center gap-0.5">
                            <Phone className="w-3 h-3" /> Позвонить
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-foreground mb-2">Статус заказа</p>
                <OrderTimeline order={order} />
              </CardContent>
            </Card>

            {["completed", "reviewed"].includes(order.status) && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Оплата</span>
                    <PaymentStatusBadge status={order.payment_status || "unpaid"} />
                  </div>
                  {order.total_amount > 0 && (
                    <PriceBreakdown
                      servicePrice={order.service_price || order.total_amount || order.budget}
                      materialsCost={order.materials_cost || 0}
                      urgencySurcharge={order.urgency_surcharge || 0}
                      totalAmount={order.total_amount || order.budget || 0}
                      compact
                    />
                  )}
                  <div className="flex gap-2">
                    {(!order.payment_status || order.payment_status === "unpaid" || order.payment_status === "failed") && (
                      <Button className="flex-1 rounded-xl gap-1.5" onClick={() => setPayOrder(order)}>
                        <CreditCard className="w-4 h-4" /> Оплатить сейчас
                      </Button>
                    )}
                    {order.payment_status === "paid" && (
                      <Button variant="outline" className="flex-1 rounded-xl gap-1.5" onClick={() => setReceiptOrder(order)}>
                        <FileText className="w-4 h-4" /> Скачать чек
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-wrap gap-2">
              {order.master_id && !["cancelled"].includes(order.status) && (
                <Button variant="outline" className="rounded-full gap-2" onClick={() => setChatOpen(true)}>
                  <MessageSquare className="w-4 h-4" /> Чат с мастером
                </Button>
              )}
              {order.status === "completed" && order.master_id && (
                <Button className="rounded-full gap-2" onClick={() => setReviewOpen(true)}>
                  <Star className="w-4 h-4" /> Оставить отзыв
                </Button>
              )}
              {order.status === "new" && (
                <Button variant="destructive" className="rounded-full gap-2" onClick={cancelOrder} disabled={cancelling}>
                  {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Отменить заказ
                </Button>
              )}
            </div>

            {chatOpen && (
              <Card className="overflow-hidden">
                <div className="h-96">
                  <OrderChat orderId={order.id} isOpen={true} onClose={() => setChatOpen(false)} />
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
      <Footer />

      <PaymentDialog
        order={payOrder}
        open={!!payOrder}
        onOpenChange={(open) => { if (!open) setPayOrder(null); }}
        onPaymentComplete={() => { setPayOrder(null); loadOrder(); }}
      />
      <ReceiptDialog
        order={receiptOrder}
        clientName={profile?.full_name}
        masterName={masterInfo?.full_name}
        open={!!receiptOrder}
        onOpenChange={(open) => { if (!open) setReceiptOrder(null); }}
      />
      {order && (
        <ReviewModal
          isOpen={reviewOpen}
          onClose={() => setReviewOpen(false)}
          orderId={order.id}
          masterId={order.master_id}
          clientId={user!.id}
          onSubmitted={loadOrder}
        />
      )}
    </div>
  );
}
