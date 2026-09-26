import { supabase } from "@/integrations/supabase/client";

// «Безопасный код»: 4 цифры, которые видит только заказчик. Мастер проверяет их на месте.

export type SafeCodeResult = "ok" | "wrong" | "locked" | "forbidden" | "not_found" | "unavailable";

/** Код заказа для заказчика. null — кода нет или миграция ещё не применена. */
export async function fetchSafeCode(orderId: string): Promise<string | null> {
  const { data, error } = await (supabase as any)
    .from("order_safe_codes")
    .select("code")
    .eq("order_id", orderId)
    .maybeSingle();
  if (error || !data) return null;
  return data.code as string;
}

/** Проверка кода мастером. "unavailable" — функция в базе ещё не создана (миграция не применена). */
export async function verifySafeCode(orderId: string, code: string): Promise<SafeCodeResult> {
  const { data, error } = await (supabase as any).rpc("verify_order_safe_code", { p_order_id: orderId, p_code: code });
  if (error) {
    const msg = `${error.code ?? ""} ${error.message ?? ""}`;
    if (msg.includes("PGRST202") || msg.includes("does not exist") || msg.includes("Could not find the function")) return "unavailable";
    throw error;
  }
  return (data as SafeCodeResult) ?? "not_found";
}

export const SAFE_CODE_ACTIVE_STATUSES = ["accepted", "assigned", "on_the_way", "arrived"];
