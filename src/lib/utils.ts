import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Утилита объединяет обычные className и корректно сливает Tailwind-классы.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Единый номер для звонков и WhatsApp по всем мастерам.
export const SUPPORT_PHONE = "+992979117007";
export const SUPPORT_WHATSAPP = "992979117007";

// Номер ИИ-диспетчера: таджикский номер с переадресацией на голосового агента Vapi.
export const AI_AGENT_PHONE = "+992079330110";
export const AI_AGENT_PHONE_LABEL = "+992 079 33 01 10";
