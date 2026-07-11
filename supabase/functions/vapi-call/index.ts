import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Triggers a real outbound phone call from the Vapi AI voice agent ("Master.tj Менеджер") to a
// client's phone number. The Vapi PRIVATE key is read only from Supabase secrets (Deno.env) --
// it is never present in any file committed to git and never sent to the browser.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VAPI_ASSISTANT_ID = "70285460-014d-462f-aedf-891d20bbeb55";
const VAPI_PHONE_NUMBER_ID = "b040476a-2802-47a6-a111-45a6ccbafd00";

function normalizePhone(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.length === 9) return `+992${digits}`;
  if (digits.startsWith("992") && digits.length >= 12) return `+${digits.slice(0, 12)}`;
  const compact = (raw || "").trim().replace(/\s+/g, "");
  return compact.startsWith("+") ? compact : `+${digits}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const VAPI_PRIVATE_KEY = Deno.env.get("VAPI_PRIVATE_KEY");

    if (!VAPI_PRIVATE_KEY) {
      return new Response(JSON.stringify({ success: false, error: "vapi_not_configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const payload = await req.json().catch(() => ({}));
    const phone = payload?.phone;
    const name = payload?.name;

    if (!phone) {
      return new Response(JSON.stringify({ success: false, error: "phone_required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedPhone = normalizePhone(phone);
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Simple abuse guard: block if this user already requested a call in the last 60 seconds.
    const { data: recent } = await admin
      .from("ai_call_requests")
      .select("id, created_at")
      .eq("user_id", supabaseUserId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recent && Date.now() - new Date(recent.created_at).getTime() < 60_000) {
      return new Response(JSON.stringify({ success: false, error: "too_soon", reason: "rate_limited" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const vapiRes = await fetch("https://api.vapi.ai/call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistantId: VAPI_ASSISTANT_ID,
        phoneNumberId: VAPI_PHONE_NUMBER_ID,
        customer: {
          number: normalizedPhone,
          ...(name ? { name } : {}),
        },
      }),
    });

    let vapiBody: any = null;
    try {
      vapiBody = await vapiRes.json();
    } catch (_e) {
      // ignore
    }

    if (!vapiRes.ok) {
      await admin.from("ai_call_requests").insert({
        user_id: supabaseUserId,
        phone: normalizedPhone,
        status: "error",
        error: vapiBody?.message || `HTTP ${vapiRes.status}`,
      });
      return new Response(JSON.stringify({ success: false, error: vapiBody?.message || "vapi_call_failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("ai_call_requests").insert({
      user_id: supabaseUserId,
      phone: normalizedPhone,
      vapi_call_id: vapiBody?.id || null,
      status: "requested",
    });

    return new Response(JSON.stringify({ success: true, callId: vapiBody?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("vapi-call error:", e);
    return new Response(JSON.stringify({ success: false, error: e instanceof Error ? e.message : "unknown_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
