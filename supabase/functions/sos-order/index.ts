// SOS-заявка с сайта → заказ в .NET-бэкенде, который показывает админка admin.emaster.tj.
//
// Заказы создаются от служебного аккаунта-клиента «SOS (сайт)» — поэтому SOS работает
// и для гостей, и для пользователей без привязки к старому бэкенду.
// Заголовок заказа всегда начинается с «SOS ·» — по нему админка собирает раздел «Заказы → SOS».
//
// Секреты (Supabase → Edge Functions → Secrets):
//   LEGACY_SOS_PASSWORD — пароль служебного аккаунта (8+ символов), обязательно
//   LEGACY_SOS_PHONE    — телефон служебного аккаунта, по умолчанию +992000000911
// Аккаунт создаётся автоматически при первой заявке.
// Деплой: supabase functions deploy sos-order --no-verify-jwt

const LEGACY_API_BASE = "http://91.227.41.158/api";
const WEBSITE_ORDER_SERVICE_ID = "11111111-1111-1111-1111-111111111111";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function legacy(path: string, body: unknown, token?: string) {
  try {
    const res = await fetch(`${LEGACY_API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: { message: e instanceof Error ? e.message : "network_error" } };
  }
}

async function getSosToken(phone: string, password: string): Promise<string | null> {
  let auth = await legacy("/auth/login", { phone, password });
  if (!auth.ok || !auth.data?.data?.accessToken) {
    // Первый запуск — регистрируем служебного клиента.
    await legacy("/auth/register", { phone, password, role: "Client", firstName: "SOS", lastName: "(сайт)" });
    auth = await legacy("/auth/login", { phone, password });
  }
  return auth.data?.data?.accessToken ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "method_not_allowed" }, 405);

  const password = Deno.env.get("LEGACY_SOS_PASSWORD");
  const sosPhone = Deno.env.get("LEGACY_SOS_PHONE") ?? "+992000000911";
  if (!password) return json({ success: false, error: "not_configured" }, 503);

  const p = await req.json().catch(() => ({}));
  const type = String(p.type ?? "").trim().slice(0, 60);
  const phone = String(p.phone ?? "").trim().slice(0, 20);
  const address = String(p.address ?? "").trim().slice(0, 300);
  const comment = String(p.comment ?? "").trim().slice(0, 500);
  const name = String(p.name ?? "").trim().slice(0, 80);

  if (!type || phone.replace(/\D/g, "").length < 9 || address.length < 3) {
    return json({ success: false, error: "invalid_input" }, 400);
  }

  const token = await getSosToken(sosPhone, password);
  if (!token) return json({ success: false, error: "legacy_auth_failed" }, 502);

  const description = [
    `СРОЧНЫЙ ВЫЗОВ (SOS) с сайта emaster.tj`,
    `Проблема: ${type}`,
    `Телефон клиента: ${phone}`,
    name ? `Имя: ${name}` : null,
    comment ? `Комментарий: ${comment}` : null,
  ].filter(Boolean).join("\n");

  const order = await legacy("/orders", {
    serviceId: WEBSITE_ORDER_SERVICE_ID,
    title: `SOS · ${type} · ${phone}`.slice(0, 200),
    description,
    price: 1,
    address,
  }, token);

  if (!order.ok) {
    console.error("sos-order legacy error", order.status, order.data);
    return json({ success: false, error: order.data?.message ?? "legacy_order_failed" }, 502);
  }
  return json({ success: true, orderId: order.data?.data?.id ?? null });
});
