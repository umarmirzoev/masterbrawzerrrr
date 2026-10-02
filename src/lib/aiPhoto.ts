import { supabase } from "@/integrations/supabase/client";

// Категории должны совпадать со списком на странице /masters.
export const PHOTO_CATEGORIES = [
  "Электрика", "Сантехника", "Отделка", "Мебель и двери", "Умный дом", "Видеонаблюдение",
  "Уборка", "Кондиционеры", "Отопление", "Малярные работы", "Полы и ламинат", "Другие услуги",
] as const;

export interface PhotoDiagnosis {
  /** broken — нашли поломку; ok — ничего не сломано; unclear — фото непонятное */
  status: "broken" | "ok" | "unclear";
  recognized: boolean;
  problem: string;
  details: string;
  category: string | null;
  urgency: "low" | "medium" | "high" | null;
  priceMin: number | null;
  priceMax: number | null;
  advice: string;
}

export class AiNotConfiguredError extends Error {
  constructor() {
    super("AI API ещё не подключён");
    this.name = "AiNotConfiguredError";
  }
}

// Сжимает фото до 1200px по большей стороне и возвращает JPEG в base64 (без префикса data:).
export async function compressImage(file: File, maxSide = 1200): Promise<{ base64: string; previewUrl: string }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Не удалось открыть фото"));
      el.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    return { base64: dataUrl.split(",")[1], previewUrl: dataUrl };
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Отправляет фото в edge-функцию ai-photo-diagnosis. Пока API-ключ не задан — бросает AiNotConfiguredError.
export async function diagnosePhoto(base64: string, note: string, language: string): Promise<PhotoDiagnosis> {
  const { data, error } = await supabase.functions.invoke("ai-photo-diagnosis", {
    body: { image: base64, note, language },
  });

  if (error) {
    const ctx = (error as { context?: Response }).context;
    const status = ctx?.status;
    // 404 — функция ещё не задеплоена, 503 — нет ключа.
    if (status === 404 || status === 503) throw new AiNotConfiguredError();
    let reason = "";
    try {
      reason = (await ctx?.clone().json())?.reason ?? "";
    } catch {
      /* тело ответа не JSON */
    }
    const messages: Record<string, string> = {
      bad_key: "ИИ не подключён: неверный API-ключ. Проверьте ANTHROPIC_API_KEY в Supabase.",
      bad_model: "ИИ не подключён: неверное имя модели. Проверьте AI_VISION_MODEL в Supabase.",
      no_credits: "На счёте Claude API закончились деньги. Пополните баланс в Claude Console.",
    };
    throw new Error(messages[reason] || "Не удалось проанализировать фото. Попробуйте ещё раз.");
  }
  if (data?.error === "not_configured") throw new AiNotConfiguredError();
  if (!data?.diagnosis) throw new Error(data?.error || "Пустой ответ от ИИ");
  const d = data.diagnosis as PhotoDiagnosis;
  // Совместимость со старой версией функции без поля status.
  if (!d.status) d.status = d.recognized ? "broken" : "unclear";
  return d;
}
