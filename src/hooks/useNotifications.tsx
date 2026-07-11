import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

// Уникальный суффикс на каждый вызов хука — на одной странице этот хук может
// использоваться сразу в нескольких компонентах (например, в DashboardLayout
// и в самом кабинете), и Supabase Realtime не разрешает создавать два канала
// с одинаковым именем.
let instanceCounter = 0;

// Хук уведомлений загружает список, считает непрочитанные и слушает realtime-обновления.
interface Notification {
  id: string;
  message: string;
  message_key?: string | null;
  payload?: Json | null;
  type: string;
  related_id: string | null;
  read: boolean;
  title: string;
  title_key?: string | null;
  created_at: string;
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const instanceId = useRef(++instanceCounter).current;

  // Получаем последние уведомления пользователя из базы.
  const fetchNotifications = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    const items = (data || []) as Notification[];
    setNotifications(items);
    setUnreadCount(items.filter((n) => !n.read).length);
  };

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    if (!userId) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchNotifications();

    if (!userId) return;
    const channel = supabase
      .channel(`notifications-${userId}-${instanceId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const newNotif = payload.new as Notification;
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return { notifications, unreadCount, markAsRead, markAllRead, refetch: fetchNotifications };
}
