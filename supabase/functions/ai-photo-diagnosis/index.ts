// AI-диагностика по фото: клиент фотографирует вещь, ИИ (Claude) смотрит на фото и отвечает:
//   • status "broken" — что сломано, какой мастер нужен, срочность и примерная цена;
//   • status "ok"     — на фото ничего не сломано, мастер не нужен;
//   • status "unclear"— фото непонятное / не про ремонт, попросить другое фото.
//
// Настройка (Supabase Dashboard → Edge Functions → Secrets):
//   ANTHROPIC_API_KEY — ключ из Claude Console (console.anthropic.com → API keys). ОБЯЗАТЕЛЬНО.
//   AI_VISION_MODEL   — (необязательно) id модели Claude с поддержкой фото, по умолчанию claude-haiku-4-5
// Ключ хранится только в секретах Supabase и никогда не попадает в браузер.
// Пока ключа нет, функция отвечает 503 { error: "not_configured" } и сайт показывает ручной выбор категории.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATEGORIES = [
  "Электрика", "Сантехника", "Отделка", "Мебель и двери", "Умный дом", "Видеонаблюдение",
  "Уборка", "Кондиционеры", "Отопление", "Малярные работы", "Полы и ламинат", "Другие услуги",
];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const SYSTEM = (lang: string) => `You are an experienced home-repair inspector for Master.TJ, a home-services marketplace in Dushanbe, Tajikistan.
A customer sends ONE photo (and maybe a short comment). Decide honestly what you see.

Return ONLY a JSON object, no markdown, no extra text:
{"status":"broken"|"ok"|"unclear","problem":string,"details":string,"category":string|null,"urgency":"low"|"medium"|"high"|null,"priceMin":number|null,"priceMax":number|null,"advice":string}

Rules:
- "broken": you can clearly see damage, a leak, a fault, wear or something that needs a master (cracked tile, leaking pipe, burnt socket, broken door hinge, mould, dirty AC filter, peeling paint...). Fill problem (short title), details (1-2 sentences: what exactly you see), category, urgency, rough price.
- "ok": the object is clearly visible and looks normal / working / undamaged. Then problem = short "Nothing is broken" style title, details = what you see and why it looks fine, category=null, urgency=null, prices=null. Do NOT invent problems. If the customer's comment describes a problem you cannot see (e.g. "it does not turn on"), use "broken" and base it on the comment, saying the photo itself looks fine.
- "unclear": the photo is blurry, too dark, not related to home repair (a person, food, a screenshot...), or you cannot tell. Ask for a clearer photo in details. category=null.
- category must be exactly one of: ${CATEGORIES.join(", ")}.
- Prices: rough cost of the WORK in Tajik somoni (TJS), typical Dushanbe prices (small job 30–150, medium 150–500, big 500+).
- urgency "high" for gas, sparking/burnt wiring, fire, active flooding or anything dangerous.
- advice: one short practical safety tip or what to do before the master arrives (for "ok" — a short maintenance tip).
- Write problem, details and advice in ${lang}. Keep category in Russian exactly as listed.`;

function extractJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no json");
  return JSON.parse(text.slice(start, end + 1));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return json({ error: "not_configured" }, 503);

  try {
    const { image, note = "", language = "ru", mediaType = "image/jpeg" } = await req.json();
    if (typeof image !== "string" || image.length < 1000) return json({ error: "Нет фото" }, 400);
    if (image.length > 6_000_000) return json({ error: "Фото слишком большое" }, 413);

    const model = Deno.env.get("AI_VISION_MODEL") || "claude-haiku-4-5";
    const lang = language === "tj" ? "Tajik" : language === "en" ? "English" : "Russian";
    const safeMedia = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mediaType) ? mediaType : "image/jpeg";

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 700,
        system: SYSTEM(lang),
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: safeMedia, data: image } },
              {
                type: "text",
                text: note
                  ? `Customer comment: ${String(note).slice(0, 300)}\nWhat do you see on the photo? Answer with the JSON only.`
                  : "What do you see on the photo? Is something broken? Answer with the JSON only.",
              },
            ],
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("Anthropic API error", aiRes.status, errText);
      // 401 — неверный ключ, 404 — неверное имя модели, 400 с credit — закончились деньги.
      const reason = aiRes.status === 401 ? "bad_key" : aiRes.status === 404 ? "bad_model" : /credit/i.test(errText) ? "no_credits" : "api_error";
      return json({ error: "Ошибка AI API", reason }, 502);
    }

    const aiData = await aiRes.json();
    const text = (aiData.content ?? []).filter((c: { type: string }) => c.type === "text").map((c: { text: string }) => c.text).join("\n");
    const parsed = extractJson(text);

    const status = ["broken", "ok", "unclear"].includes(parsed.status) ? parsed.status : "unclear";
    const diagnosis = {
      status,
      recognized: status === "broken",
      problem: String(parsed.problem ?? ""),
      details: String(parsed.details ?? ""),
      category: status === "broken" ? (CATEGORIES.includes(parsed.category) ? parsed.category : "Другие услуги") : null,
      urgency: status === "broken" && ["low", "medium", "high"].includes(parsed.urgency) ? parsed.urgency : status === "broken" ? "medium" : null,
      priceMin: status === "broken" && Number.isFinite(parsed.priceMin) ? parsed.priceMin : null,
      priceMax: status === "broken" && Number.isFinite(parsed.priceMax) ? parsed.priceMax : null,
      advice: String(parsed.advice ?? ""),
    };
    return json({ diagnosis });
  } catch (e) {
    console.error(e);
    return json({ error: "Не удалось обработать фото" }, 500);
  }
});
