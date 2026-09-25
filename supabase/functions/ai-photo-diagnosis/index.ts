// AI-диагностика по фото: принимает снимок поломки, возвращает тип проблемы, категорию мастера и примерную цену.
//
// Настройка (Supabase Dashboard → Edge Functions → Secrets):
//   MASTERCHAS_AI_API_KEY — ключ купленного API (обязательно)
//   AI_BASE_URL           — адрес OpenAI-совместимого API, по умолчанию https://api.openai.com/v1
//   AI_VISION_MODEL       — модель с поддержкой изображений, по умолчанию gpt-4o-mini
// Пока ключа нет, функция отвечает 503 { error: "not_configured" } и сайт показывает ручной выбор категории.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATEGORIES = [
  "Электрика", "Сантехника", "Отделка", "Мебель и двери", "Умный дом",
  "Видеонаблюдение", "Сад и двор", "Сварочные работы", "Подвалы и гаражи",
  "Уборка", "Ремонт под ключ", "Аварийные 24/7", "Ремонт техники",
];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const apiKey = Deno.env.get("MASTERCHAS_AI_API_KEY");
  if (!apiKey) return json({ error: "not_configured" }, 503);

  try {
    const { image, note = "", language = "ru" } = await req.json();
    if (typeof image !== "string" || image.length < 1000) return json({ error: "Нет фото" }, 400);
    if (image.length > 4_000_000) return json({ error: "Фото слишком большое" }, 413);

    const baseUrl = Deno.env.get("AI_BASE_URL") ?? "https://api.openai.com/v1";
    const model = Deno.env.get("AI_VISION_MODEL") ?? "gpt-4o-mini";
    const lang = language === "tj" ? "Tajik" : language === "en" ? "English" : "Russian";

    const system = `You are a home-repair expert for Master.TJ, a service marketplace in Dushanbe, Tajikistan.
Look at the photo and identify the household problem. Answer ONLY with JSON:
{"recognized": boolean, "problem": string, "details": string, "category": string, "urgency": "low"|"medium"|"high", "priceMin": number|null, "priceMax": number|null, "advice": string}
- category must be exactly one of: ${CATEGORIES.join(", ")}
- prices are a rough estimate for the work in Tajik somoni (TJS)
- advice: one short safety tip or what to do before the master arrives
- if the photo does not show a repair problem, set recognized=false and explain in "details"
- if you see gas, sparking wires, fire or flooding, set urgency="high"
Write all text in ${lang}.`;

    const aiRes = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        max_tokens: 600,
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: [
              { type: "text", text: note ? `Комментарий клиента: ${note}` : "Что сломалось на фото?" },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } },
            ],
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      console.error("AI API error", aiRes.status, await aiRes.text());
      return json({ error: "Ошибка AI API" }, 502);
    }

    const aiData = await aiRes.json();
    const parsed = JSON.parse(aiData.choices?.[0]?.message?.content ?? "{}");
    const diagnosis = {
      recognized: Boolean(parsed.recognized),
      problem: String(parsed.problem ?? ""),
      details: String(parsed.details ?? ""),
      category: CATEGORIES.includes(parsed.category) ? parsed.category : "Аварийные 24/7",
      urgency: ["low", "medium", "high"].includes(parsed.urgency) ? parsed.urgency : "medium",
      priceMin: Number.isFinite(parsed.priceMin) ? parsed.priceMin : null,
      priceMax: Number.isFinite(parsed.priceMax) ? parsed.priceMax : null,
      advice: String(parsed.advice ?? ""),
    };
    return json({ diagnosis });
  } catch (e) {
    console.error(e);
    return json({ error: "Не удалось обработать фото" }, 500);
  }
});
