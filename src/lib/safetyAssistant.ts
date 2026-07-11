import { supabase } from "@/integrations/supabase/client";

export interface SafetyQuestionRecord {
  id: string;
  question: string;
  answer: string | null;
  category: string | null;
  created_at: string;
}

export interface AskSafetyQuestionResult {
  success: boolean;
  pending?: boolean;
  answer?: string | null;
  error?: string;
}

// Отправляет вопрос мастера в edge function safety-assistant. Функция сама решает:
// ответить сразу через Anthropic (если ключ настроен) или сохранить вопрос как "pending"
// для последующего ответа администратором.
export async function askSafetyQuestion(params: {
  question: string;
  category?: string | null;
  askerName?: string | null;
}): Promise<AskSafetyQuestionResult> {
  try {
    const { data, error } = await supabase.functions.invoke("safety-assistant", {
      body: { action: "ask", ...params },
    });
    if (error) throw error;
    return data as AskSafetyQuestionResult;
  } catch (err) {
    console.error("askSafetyQuestion failed:", err);
    return { success: false, error: "network_error" };
  }
}

export async function listSafetyQuestions(category?: string): Promise<SafetyQuestionRecord[]> {
  try {
    const { data, error } = await supabase.functions.invoke("safety-assistant", {
      body: { action: "list", category },
    });
    if (error) throw error;
    return (data?.questions as SafetyQuestionRecord[]) || [];
  } catch (err) {
    console.error("listSafetyQuestions failed:", err);
    return [];
  }
}
