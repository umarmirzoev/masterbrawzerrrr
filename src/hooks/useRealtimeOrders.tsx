import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface UseRealtimeOrdersOptions {
  userId?: string;
  role: "client" | "master" | "admin";
  onUpdate: () => void;
}

export function useRealtimeOrders({ userId, role, onUpdate }: UseRealtimeOrdersOptions) {
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (!userId && role !== "admin") return;

    const channel = supabase
      .channel(`orders-${role}-${userId || "admin"}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        if (role === "admin") {
          toast({ title: t("realtimeNewOrderTitle"), description: t("realtimeNewOrderDescription") });
          onUpdate();
          return;
        }

        if (role === "master") {
          toast({ title: t("realtimeNewOrderAvailable") });
          onUpdate();
          return;
        }

        if (role === "client" && payload.new.client_id === userId) {
          onUpdate();
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        if (role === "client" && payload.new.client_id === userId) {
          const status = payload.new.status as string;
          const statusMessages: Record<string, string> = {
            accepted: t("notifOrderAcceptedMessage"),
            assigned: t("notifOrderAssignedMessage"),
            on_the_way: t("notifOrderOnTheWayMessage"),
            arrived: t("notifOrderArrivedMessage"),
            in_progress: t("notifOrderInProgressMessage"),
            completed: t("notifOrderCompletedMessage"),
            cancelled: t("notifOrderCancelledMessage"),
          };

          if (statusMessages[status]) {
            toast({ title: t("realtimeOrderUpdateTitle"), description: statusMessages[status] });
          }
        }

        onUpdate();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "shop_orders" }, (payload) => {
        if (role === "admin") {
          toast({ title: t("realtimeShopOrderTitle"), description: t("realtimeShopOrderDescription") });
          onUpdate();
          return;
        }

        if (role === "client" && payload.new.user_id === userId) {
          onUpdate();
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "shop_orders" }, (payload) => {
        if (role === "admin") {
          onUpdate();
          return;
        }

        if (role === "client" && payload.new.user_id === userId) {
          const status = payload.new.status as string;
          const statusMessages: Record<string, string> = {
            confirmed: t("realtimeShopConfirmedMessage"),
            processing: t("realtimeShopProcessingMessage"),
            shipped: t("realtimeShopShippedMessage"),
            delivered: t("realtimeShopDeliveredMessage"),
            completed: t("realtimeShopCompletedMessage"),
            cancelled: t("realtimeShopCancelledMessage"),
          };

          if (statusMessages[status]) {
            toast({ title: t("realtimeOrderUpdateTitle"), description: statusMessages[status] });
          }

          onUpdate();
        }
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [onUpdate, role, t, toast, userId]);
}
