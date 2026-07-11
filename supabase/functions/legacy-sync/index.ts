import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Best-effort bridge: mirrors website registrations and orders into the separate
// .NET/PostgreSQL backend that powers the Flutter app's admin/super-admin panels.
// This function NEVER touches the Flutter project. It only calls the already-live
// public REST API at LEGACY_API_BASE the same way the Flutter app itself does.
// Every failure here is swallowed and reported back as { success:false, reason }
// so the website's own Supabase-based flow is never blocked or broken by this sync.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LEGACY_API_BASE = "http://91.227.41.158/api";

// Sentinel ServiceId used for orders created from the website. The legacy Order
// entity stores ServiceId as a plain Guid column with no FK constraint (verified
// in the .NET source), so this is safe -- admins see the real service name in
// Title/Description instead of relying on a matching service-catalog row.
const WEBSITE_ORDER_SERVICE_ID = "11111111-1111-1111-1111-111111111111";

function normalizePhone(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.length === 9) return `+992${digits}`;
  if (digits.startsWith("992") && digits.length >= 12) return `+${digits.slice(0, 12)}`;
  const compact = (raw || "").trim().replace(/\s+/g, "");
  return compact.startsWith("+") ? compact : `+${digits}`;
}

async function legacyFetch(path: string, init: RequestInit & { headers?: Record<string, string> } = {}) {
  try {
    const res = await fetch(`${LEGACY_API_BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    });
    let body: any = null;
    try {
      body = await res.json();
    } catch (_e) {
      // no/invalid JSON body
    }
    return { ok: res.ok, status: res.status, body };
  } catch (e) {
    return { ok: false, status: 0, body: { message: e instanceof Error ? e.message : "network_error" } };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ success: false, error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUserId = userData.user.id;

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const payload = await req.json().catch(() => ({}));
    const action = payload?.action;

    if (action === "register") {
      const { phone, password, role, firstName, lastName, email } = payload;
      if (!phone || !password) {
        return new Response(JSON.stringify({ success: false, error: "phone_and_password_required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const normalizedPhone = normalizePhone(phone);
      const legacyRole = role === "master" ? "Master" : "Client";

      if (String(password).length < 8) {
        // Legacy backend requires 8+ char passwords. Skip silently -- never block the website flow.
        await admin.from("legacy_backend_links").upsert({
          supabase_user_id: supabaseUserId,
          phone: normalizedPhone,
          role: legacyRole,
          last_sync_status: "skipped_short_password",
          updated_at: new Date().toISOString(),
        });
        return new Response(JSON.stringify({ success: false, reason: "password_too_short_for_legacy" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let authResult = await legacyFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          phone: normalizedPhone,
          password,
          role: legacyRole,
          ...(email ? { email } : {}),
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
        }),
      });

      // Phone already exists on the legacy backend (e.g. this person already has a Flutter
      // app account) -- fall back to logging in with the same credentials to link accounts.
      if (!authResult.ok) {
        const msg = String(authResult.body?.message || "").toLowerCase();
        const alreadyExists = msg.includes("существует") || msg.includes("already");
        if (alreadyExists) {
          authResult = await legacyFetch("/auth/login", {
            method: "POST",
            body: JSON.stringify({ phone: normalizedPhone, password }),
          });
        }
      }

      if (!authResult.ok || !authResult.body?.data) {
        await admin.from("legacy_backend_links").upsert({
          supabase_user_id: supabaseUserId,
          phone: normalizedPhone,
          role: legacyRole,
          last_sync_status: "error",
          last_sync_error: authResult.body?.message || `HTTP ${authResult.status}`,
          updated_at: new Date().toISOString(),
        });
        return new Response(JSON.stringify({ success: false, error: authResult.body?.message || "legacy_register_failed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = authResult.body.data;
      await admin.from("legacy_backend_links").upsert({
        supabase_user_id: supabaseUserId,
        legacy_user_id: data.userId,
        phone: normalizedPhone,
        role: legacyRole,
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
        access_token_expires_at: data.accessTokenExpiresAt,
        last_sync_status: "ok",
        last_sync_error: null,
        updated_at: new Date().toISOString(),
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "order") {
      const { title, description, address, scheduledDate, scheduledTime } = payload;

      const { data: link } = await admin
        .from("legacy_backend_links")
        .select("*")
        .eq("supabase_user_id", supabaseUserId)
        .maybeSingle();

      if (!link || !link.access_token) {
        return new Response(JSON.stringify({ success: false, reason: "no_legacy_account" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let accessToken = link.access_token as string;
      const expiresAt = link.access_token_expires_at ? new Date(link.access_token_expires_at).getTime() : 0;
      if (!expiresAt || expiresAt < Date.now() + 60_000) {
        const refreshResult = await legacyFetch("/auth/refresh", {
          method: "POST",
          body: JSON.stringify({ refreshToken: link.refresh_token }),
        });
        if (refreshResult.ok && refreshResult.body?.data) {
          const rd = refreshResult.body.data;
          accessToken = rd.accessToken;
          await admin.from("legacy_backend_links").update({
            access_token: rd.accessToken,
            refresh_token: rd.refreshToken,
            access_token_expires_at: rd.accessTokenExpiresAt,
            updated_at: new Date().toISOString(),
          }).eq("supabase_user_id", supabaseUserId);
        } else {
          await admin.from("legacy_backend_links").update({
            last_sync_status: "refresh_failed",
            last_sync_error: refreshResult.body?.message || `HTTP ${refreshResult.status}`,
            updated_at: new Date().toISOString(),
          }).eq("supabase_user_id", supabaseUserId);
          return new Response(JSON.stringify({ success: false, reason: "refresh_failed" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      const orderResult = await legacyFetch("/orders", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          serviceId: WEBSITE_ORDER_SERVICE_ID,
          title: String(title || "Заявка с сайта emaster.tj").slice(0, 200),
          description: String(description || "Без описания").slice(0, 2000) || "Без описания",
          price: 1,
          address: String(address || "Не указан").slice(0, 500) || "Не указан",
          ...(scheduledDate ? { scheduledDate } : {}),
          ...(scheduledTime ? { scheduledTime } : {}),
        }),
      });

      await admin.from("legacy_backend_links").update({
        last_order_synced_at: new Date().toISOString(),
        last_sync_status: orderResult.ok ? "ok" : "order_error",
        last_sync_error: orderResult.ok ? null : (orderResult.body?.message || `HTTP ${orderResult.status}`),
      }).eq("supabase_user_id", supabaseUserId);

      if (!orderResult.ok) {
        return new Response(JSON.stringify({ success: false, error: orderResult.body?.message || "legacy_order_failed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, legacyOrderId: orderResult.body?.data?.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: false, error: "unknown_action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("legacy-sync error:", e);
    return new Response(JSON.stringify({ success: false, error: e instanceof Error ? e.message : "unknown_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
