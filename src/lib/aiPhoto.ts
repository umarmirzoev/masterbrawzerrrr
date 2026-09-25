import { supabase } from "@/integrations/supabase/client";

// Категории должны совпадать со списком на странице /masters.
export const PHOTO_CATEGORIES = [
  "Электрика", "Сантехника", "Отделка", "Мебель и двери", "Умный дом",
  "Видеонаблюдение", "Сад и двор", "Сварочные работы", "Подвалы и гаражи",
  "Уборка", "Ремонт под ключ", "Аварийные 24/7", "Ремонт техники",
] as const;

export interface PhotoDiagnosis {
  recognized: boolean;
  problem: string;
  details: string;
  category: string;
  urgency: "low" | "medium" | "high";
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
    const status = (error as { context?: Response }).context?.status;
    // 404 — функция ещё не задеплоена, 503 — нет ключа.
    if (status === 404 || status === 503) throw new AiNotConfiguredError();
    throw new Error(error.message || "Ошибка анализа фото");
  }
  if (data?.error === "not_configured") throw new AiNotConfiguredError();
  if (!data?.diagnosis) throw new Error(data?.error || "Пустой ответ от ИИ");
  return data.diagnosis as PhotoDiagnosis;
}
