import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Edge function анализирует описание проблемы и подбирает категорию, услугу и подходящих мастеров.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const isLanguage = (value: unknown): value is "ru" | "tj" | "en" =>
  value === "ru" || value === "tj" || value === "en";

const getLocalizedText = (
  row: { name_en?: string | null; name_ru?: string | null; name_tj?: string | null },
  language: "ru" | "tj" | "en",
) => {
  if (language === "tj") return row.name_tj || row.name_ru || row.name_en || "";
  if (language === "en") return row.name_en || row.name_ru || row.name_tj || "";
  return row.name_ru || row.name_tj || row.name_en || "";
};

const getLanguageName = (language: "ru" | "tj" | "en") => {
  if (language === "tj") return "Tajik";
  if (language === "en") return "English";
  return "Russian";
};

const getLocalizedCopy = (language: "ru" | "tj" | "en") => ({
  badges: {
    bestChoice: language === "tj" ? "Интихоби беҳтарин" : language === "en" ? "Best choice" : "Лучший выбор",
    closest: language === "tj" ? "Аз ҳама наздик" : language === "en" ? "Closest" : "Ближе всех",
    highRating: language === "tj" ? "Рейтинги баланд" : language === "en" ? "High rating" : "Высокий рейтинг",
    fastArrival: language === "tj" ? "Баромади зуд" : language === "en" ? "Fast arrival" : "Быстрый выезд",
  },
  errors: {
    gateway: language === "tj" ? "Хатои шлюзи AI" : language === "en" ? "AI gateway error" : "Ошибка AI шлюза",
    limit: language === "tj" ? "Дархостҳо зиёданд, баъдтар кӯшиш кунед" : language === "en" ? "Too many requests, please try again later" : "Слишком много запросов, попробуйте позже",
    payment: language === "tj" ? "Тавозунро пур кардан лозим аст" : language === "en" ? "Balance top-up is required" : "Требуется пополнение баланса",
    unknown: language === "tj" ? "Хатои номаълум" : language === "en" ? "Unknown error" : "Неизвестная ошибка",
  },
  reasons: {
    budget: language === "tj" ? "Ба буҷети шумо мувофиқ аст" : language === "en" ? "Fits your budget" : "Подходит под ваш бюджет",
    categoryMatch: language === "tj" ? "Дар ин хизматрасонӣ тахассус дорад" : language === "en" ? "Specializes in this service" : "Специализируется на данной услуге",
    districtMatch: language === "tj" ? "Дар ноҳияи шумо кор мекунад" : language === "en" ? "Works in your district" : "Работает в вашем районе",
    experience: language === "tj" ? "Таҷрибаи калон дорад" : language === "en" ? "Has extensive experience" : "Большой опыт выполнения заказов",
    fastArrival: language === "tj" ? "Баромади зуд" : language === "en" ? "Fast arrival" : "Быстрый выезд",
    highRating: language === "tj" ? "Рейтинги баланд" : language === "en" ? "High rating" : "Высокий рейтинг",
    topMaster: language === "tj" ? "Устои топ" : language === "en" ? "Top master" : "Топ мастер",
  },
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description, district, urgency, budget, language } = await req.json();
    const requestedLanguage = isLanguage(language) ? language : "ru";
    const localizedCopy = getLocalizedCopy(requestedLanguage);
    const MASTERCHAS_AI_API_KEY =
      Deno.env.get("MASTERCHAS_AI_API_KEY") ?? Deno.env.get("LOVABLE_API_KEY");
    if (!MASTERCHAS_AI_API_KEY) {
      throw new Error("MASTERCHAS_AI_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Fetch categories and services for context
    const catRes = await fetch(`${SUPABASE_URL}/rest/v1/service_categories?select=id,name_ru,name_tj,name_en`, {
      headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
    });
    const categories = await catRes.json();

    const svcRes = await fetch(`${SUPABASE_URL}/rest/v1/services?select=id,name_ru,name_tj,name_en,category_id,price_avg&limit=500`, {
      headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
    });
    const services = await svcRes.json();

    const categoryList = categories.map((c: any) => `${c.id}::${c.name_ru}`).join("\n");
    const serviceList = services.map((s: any) => `${s.id}::${s.name_ru}::cat=${s.category_id}::price=${s.price_avg}`).join("\n");

    const systemPrompt = `You are a service matching AI for Master Chas, a home services platform in Dushanbe, Tajikistan.
Given a user's problem description, determine:
1. The best matching category
2. The best matching service (or top 3 if uncertain)
3. Whether this is urgent
4. Whether a product purchase might be needed
5. Whether installation service is needed

Available categories:
${categoryList}

Available services:
${serviceList}

IMPORTANT: Return ONLY valid category_id and service_id from the lists above.
If uncertain, return multiple service suggestions.
Detect urgency from keywords like: срочно, авария, течет сильно, искрит, короткое замыкание, не закрывается, сломалось.
Detect product needs from keywords like: смеситель, люстра, розетка, камера, кондиционер, замок, лампа.
Write the explanation in ${getLanguageName(requestedLanguage)}.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MASTERCHAS_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Problem: "${description}"\nDistrict: ${district || "not specified"}\nUrgency: ${urgency || "normal"}\nBudget: ${budget || "not specified"} somoni` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "match_service",
              description: "Match a user problem to categories and services",
              parameters: {
                type: "object",
                properties: {
                  category_id: { type: "string", description: "Best matching category UUID" },
                  category_name: { type: "string", description: "Category name in Russian" },
                  services: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        service_id: { type: "string" },
                        service_name: { type: "string" },
                        confidence: { type: "number", description: "0-1 confidence score" },
                      },
                      required: ["service_id", "service_name", "confidence"],
                    },
                    description: "Top 1-3 matching services sorted by confidence",
                  },
                  is_urgent: { type: "boolean" },
                  needs_product: { type: "boolean" },
                  needs_installation: { type: "boolean" },
                  product_keywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "Product keywords detected from description",
                  },
                  explanation: { type: "string", description: "Brief explanation in Russian of why this match was made" },
                },
                required: ["category_id", "category_name", "services", "is_urgent", "needs_product", "needs_installation", "explanation"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "match_service" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: localizedCopy.errors.limit }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: localizedCopy.errors.payment }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(localizedCopy.errors.gateway);
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const matchResult = JSON.parse(toolCall.function.arguments);
    const matchedCategory = categories.find((category: any) => category.id === matchResult.category_id);
    const localizedCategoryName = matchedCategory
      ? getLocalizedText(matchedCategory, requestedLanguage)
      : matchResult.category_name;
    const categoryNameForScoring = matchedCategory?.name_ru || matchResult.category_name;

    matchResult.category_name = localizedCategoryName;
    matchResult.services = (matchResult.services || []).map((service: any) => {
      const matchedService = services.find((candidate: any) => candidate.id === service.service_id);
      return {
        ...service,
        service_name: matchedService
          ? getLocalizedText(matchedService, requestedLanguage)
          : service.service_name,
      };
    });

    // Now fetch matching masters
    const mastersRes = await fetch(
      `${SUPABASE_URL}/rest/v1/master_listings?is_active=eq.true&select=*`,
      { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } }
    );
    const allMasters = await mastersRes.json();

    // Score and rank masters
    const scoredMasters = allMasters.map((m: any) => {
      let score = 0;
      const reasons: string[] = [];

      // Category match (highest weight)
      const catMatch = m.service_categories?.some((c: string) =>
        c.toLowerCase().includes(categoryNameForScoring.toLowerCase()) ||
        categoryNameForScoring.toLowerCase().includes(c.toLowerCase())
      );
      if (catMatch) { score += 40; reasons.push(localizedCopy.reasons.categoryMatch); }

      // District match
      if (district && m.working_districts?.some((d: string) => d.toLowerCase().includes(district.toLowerCase()))) {
        score += 25; reasons.push(localizedCopy.reasons.districtMatch);
      }

      // Rating
      score += (m.average_rating || 0) * 4; // max 20
      if (m.average_rating >= 4.5) reasons.push(localizedCopy.reasons.highRating);

      // Completed orders
      if (m.completed_orders > 50) { score += 5; reasons.push(localizedCopy.reasons.experience); }
      else if (m.completed_orders > 20) { score += 3; }

      // Response time for urgent
      if (matchResult.is_urgent && m.response_time_avg && m.response_time_avg < 30) {
        score += 10; reasons.push(localizedCopy.reasons.fastArrival);
      }

      // Budget fit
      if (budget && m.price_min && m.price_min <= budget) {
        score += 5; reasons.push(localizedCopy.reasons.budget);
      }

      // Quality penalty
      if (m.quality_flag === "warning") score -= 10;
      if (m.quality_flag === "poor") score -= 30;

      // Top master bonus
      if (m.is_top_master) { score += 5; reasons.push(localizedCopy.reasons.topMaster); }

      return { ...m, ai_score: score, ai_reasons: reasons };
    })
      .filter((m: any) => m.ai_score > 10)
      .sort((a: any, b: any) => b.ai_score - a.ai_score)
      .slice(0, 5);

    // Assign badges
    const mastersWithBadges = scoredMasters.map((m: any, i: number) => {
      const badges: string[] = [];
      if (i === 0) badges.push(localizedCopy.badges.bestChoice);
      if (m.ai_reasons.includes(localizedCopy.reasons.districtMatch)) badges.push(localizedCopy.badges.closest);
      if (m.average_rating >= 4.8) badges.push(localizedCopy.badges.highRating);
      if (m.ai_reasons.includes(localizedCopy.reasons.fastArrival)) badges.push(localizedCopy.badges.fastArrival);
      return { ...m, ai_badges: badges };
    });

    return new Response(JSON.stringify({
      match: matchResult,
      masters: mastersWithBadges,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-match-master error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
