import { supabase } from "@/integrations/supabase/client";
import { buildLocalizedNotification } from "@/lib/notifications";
import { compressImage } from "@/lib/aiPhoto";

// Фото «до и после», приёмка работы с гарантией и живая статистика главной.
const sb = supabase as any;
const BUCKET = "order-photos";
export const WARRANTY_DAYS = 30;

export type PhotoKind = "before" | "after";
export interface OrderPhoto { id: string; kind: PhotoKind; url: string; created_at: string }

export async function listOrderPhotos(orderId: string): Promise<OrderPhoto[] | null> {
  const { data, error } = await sb.from("order_photos").select("id, kind, path, created_at").eq("order_id", orderId).order("created_at");
  if (error) return null; // таблицы нет — миграция не применена
  if (!data?.length) return [];
  const { data: signed } = await sb.storage.from(BUCKET).createSignedUrls(data.map((p: any) => p.path), 60 * 60);
  return data.map((p: any, i: number) => ({ id: p.id, kind: p.kind, created_at: p.created_at, url: signed?.[i]?.signedUrl ?? "" }));
}

export async function uploadOrderPhoto(orderId: string, kind: PhotoKind, file: File) {
  const { previewUrl } = await compressImage(file, 1600);
  const blob = await (await fetch(previewUrl)).blob();
  const path = `${orderId}/${kind}-${Date.now()}.jpg`;
  const up = await sb.storage.from(BUCKET).upload(path, blob, { contentType: "image/jpeg" });
  if (up.error) throw up.error;
  const ins = await sb.from("order_photos").insert({ order_id: orderId, kind, path });
  if (ins.error) throw ins.error;
}

export async function deleteOrderPhoto(photoId: string) {
  const { error } = await sb.from("order_photos").delete().eq("id", photoId);
  if (error) throw error;
}

/** Клиент принимает работу → гарантия. Возвращает дату окончания гарантии. */
export async function acceptOrderWork(orderId: string): Promise<string | null> {
  const { data, error } = await sb.rpc("accept_order_work", { p_order_id: orderId });
  if (error) throw error;
  return data ?? null;
}

export async function listWarrantyClaims(orderId: string) {
  const { data, error } = await sb.from("warranty_claims").select("id, message, status, created_at").eq("order_id", orderId).order("created_at", { ascending: false });
  return error ? [] : (data ?? []);
}

export async function createWarrantyClaim(order: { id: string; master_id?: string | null }, message: string) {
  const { error } = await sb.from("warranty_claims").insert({ order_id: order.id, message: message.trim() });
  if (error) throw error;
  const { data: admins } = await supabase.from("user_roles").select("user_id").in("role", ["admin", "super_admin"]);
  const targets = [...(admins ?? []).map((a) => a.user_id), ...(order.master_id ? [order.master_id] : [])];
  await Promise.all(
    targets.map((userId) =>
      supabase.from("notifications").insert(
        buildLocalizedNotification({
          userId,
          fallbackTitle: "⚠️ Жалоба по гарантии",
          fallbackMessage: message.trim().slice(0, 120),
          type: "warranty_claim",
          relatedId: order.id,
        }),
      ),
    ),
  );
}

export const warrantyStatusLabel: Record<string, string> = {
  open: "Новая", in_progress: "В работе", resolved: "Решена", rejected: "Отклонена",
};

export interface PublicStats { completed_today: number; completed_total: number; masters_active: number; avg_rating: number | null }

export async function fetchPublicStats(): Promise<PublicStats | null> {
  const { data, error } = await sb.rpc("get_public_stats");
  if (!error && data) return data as PublicStats;
  // Функции нет — считаем хотя бы мастеров из открытой таблицы.
  const { data: masters } = await supabase.from("master_listings").select("average_rating").eq("is_active", true);
  if (!masters) return null;
  const rated = masters.filter((m) => (m.average_rating ?? 0) > 0);
  return {
    completed_today: -1,
    completed_total: -1,
    masters_active: masters.length,
    avg_rating: rated.length ? Math.round((rated.reduce((s, m) => s + (m.average_rating ?? 0), 0) / rated.length) * 10) / 10 : null,
  };
}
