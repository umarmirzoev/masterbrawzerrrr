import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Powers the "Обучение и безопасность" section: masters can ask free-form safety questions
// and get an instant AI answer (Anthropic Claude), or browse previously answered questions.
// The Anthropic key is read only from Supabase secrets (Deno.env) -- never sent to the browser.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Ты — эксперт по технике безопасности для мастеров бытовых услуг в Таджикистане: электрики, сантехники, сварщики, специалисты по кондиционерам, отделочники, клинеры и мастера по ремонту техники. С тобой общаются мастера сервиса Master.tj, у которых возник вопрос о безопасном выполнении работы.

Правила ответа:
1. Отвечай кратко и по шагам (нумерованный список из 3-6 пунктов), простым языком, без лишней теории.
2. Всегда указывай ключевые меры безопасности: отключение электропитания/воды перед работой, средства индивидуальной защиты, что делать при обнаружении неисправности.
3. Если ситуация требует специальной квалификации или допуска (высоковольтные работы, работа на высоте, газовое оборудование и т.п.) — прямо скажи об этом и порекомендуй не браться самостоятельно.
4. Отвечай на том же языке, на котором задан вопрос (русский, таджикский или английский).
5. Если вопрос не связан с технической безопасностью бытовых работ — вежливо скажи, что можешь помочь только с вопросами безопасности при выполнении работ.
6. Всегда заканчивай коротким напоминанием, что это общая рекомендация и не заменяет официальные инструкции по охране труда и указания производителя оборудования.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const payload = await req.json().catch(() => ({}));
    const action = payload?.action;

    if (action === "list") {
      const category = payload?.category;
      let query = admin
        .from("safety_questions")
        .select("id, question, answer, category, created_at")
        .eq("status", "answered")
        .order("created_at", { ascending: false })
        .limit(50);
      if (category) query = query.eq("category", category);

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, questions: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "ask") {
      const question = (payload?.question || "").toString().trim();
      const category = payload?.category || null;
      const askerName = payload?.askerName || null;

      if (!question) {
        return new Response(JSON.stringify({ success: false, error: "question_required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (question.length > 800) {
        return new Response(JSON.stringify({ success: false, error: "question_too_long" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // No Anthropic key configured yet -- store the question as pending so it isn't lost,
      // and let the client show a friendly "we'll get back to you" message.
      if (!ANTHROPIC_API_KEY) {
        await admin.from("safety_questions").insert({
          question,
          category,
          asker_name: askerName,
          status: "pending",
          is_ai_generated: false,
        });
        return new Response(
          JSON.stringify({ success: true, pending: true, answer: null }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 700,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: question }],
        }),
      });

      const aiBody = await aiRes.json().catch(() => null);

      if (!aiRes.ok) {
        await admin.from("safety_questions").insert({
          question,
          category,
          asker_name: askerName,
          status: "pending",
          is_ai_generated: false,
        });
        console.error("Anthropic error:", aiBody);
        return new Response(
          JSON.stringify({ success: true, pending: true, answer: null }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const answer = aiBody?.content?.[0]?.text?.trim() || null;

      await admin.from("safety_questions").insert({
        question,
        answer,
        category,
        asker_name: askerName,
        status: answer ? "answered" : "pending",
        is_ai_generated: !!answer,
        answered_at: answer ? new Date().toISOString() : null,
      });

      return new Response(JSON.stringify({ success: true, pending: !answer, answer }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: false, error: "unknown_action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("safety-assistant error:", e);
    return new Response(JSON.stringify({ success: false, error: e instanceof Error ? e.message : "unknown_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
