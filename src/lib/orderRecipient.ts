import { supabase } from "@/integrations/supabase/client";

// «Заказ для близкого человека»: сын или дочь из другой страны вызывает мастера родителям.
// Мастер звонит и едет к получателю, а заказчик следит за статусом в своём кабинете.

export interface OrderRecipient {
  forOther: boolean;
  name: string;
  phone: string;
  relation: string;
}

export const emptyRecipient: OrderRecipient = { forOther: false, name: "", phone: "", relation: "" };

export const RECIPIENT_RELATIONS = ["Мама", "Папа", "Бабушка", "Дедушка", "Брат / сестра", "Другое"];

export const RECIPIENT_MARK = "👪 Для близкого:";

export function recipientError(r: OrderRecipient): string | null {
  if (!r.forOther) return null;
  if (r.name.trim().length < 2) return "Укажите имя человека, к которому приедет мастер";
  if (r.phone.replace(/\D/g, "").length < 9) return "Укажите телефон человека, к которому приедет мастер";
  return null;
}

/**
 * Дополняет данные заказа: телефон заказа = телефон получателя (мастер звонит ему),
 * а в описание добавляется строка с получателем и заказчиком — её видно везде,
 * включая админку admin.emaster.tj.
 */
export function withRecipient<T extends { phone: string; description?: string | null }>(
  order: T,
  r: OrderRecipient,
  orderer: { name?: string | null; phone?: string | null },
): T & Record<string, unknown> {
  if (!r.forOther) return order;
  const relation = r.relation ? ` (${r.relation.toLowerCase()})` : "";
  const ordererText = [orderer.name?.trim(), orderer.phone?.trim()].filter(Boolean).join(", ");
  const line = `${RECIPIENT_MARK} ${r.name.trim()}${relation}, ${r.phone.trim()}.${ordererText ? ` Заказчик: ${ordererText}.` : ""}`;
  return {
    ...order,
    phone: r.phone.trim(),
    description: [line, order.description?.trim()].filter(Boolean).join(" "),
    recipient_name: r.name.trim(),
    recipient_phone: r.phone.trim(),
    recipient_relation: r.relation || null,
    orderer_phone: orderer.phone?.trim() || null,
  };
}

const RECIPIENT_COLUMNS = ["recipient_name", "recipient_phone", "recipient_relation", "orderer_phone"];

/**
 * Вставка заказа. Если миграция с колонками получателя ещё не применена,
 * повторяем без них — информация всё равно остаётся в описании заказа.
 */
export async function insertOrder(payload: Record<string, unknown>) {
  const first = await supabase.from("orders").insert(payload as any).select("id");
  if (!first.error) return first;
  const msg = `${first.error.message} ${first.error.details ?? ""}`;
  if (!RECIPIENT_COLUMNS.some((c) => msg.includes(c))) return first;
  const stripped = { ...payload };
  RECIPIENT_COLUMNS.forEach((c) => delete stripped[c]);
  return supabase.from("orders").insert(stripped as any).select("id");
}

/** Разбирает получателя из заказа (колонки или строка в описании) — для отображения. */
export function parseRecipient(order: { recipient_name?: string | null; recipient_relation?: string | null; recipient_phone?: string | null; description?: string | null }) {
  if (order.recipient_name) {
    return { name: order.recipient_name, relation: order.recipient_relation ?? "", phone: order.recipient_phone ?? "" };
  }
  const d = order.description ?? "";
  if (!d.startsWith(RECIPIENT_MARK)) return null;
  const m = d.slice(RECIPIENT_MARK.length).match(/^\s*([^,(]+?)\s*(?:\(([^)]+)\))?,\s*([^.]+)\./);
  return m ? { name: m[1], relation: m[2] ?? "", phone: m[3] } : { name: "близкого человека", relation: "", phone: "" };
}
