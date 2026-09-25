import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Утилита объединяет обычные className и корректно сливает Tailwind-классы.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Единый номер для звонков и WhatsApp по всем мастерам.
export const SUPPORT_PHONE = "+992979117007";
export const SUPPORT_WHATSAPP = "992979117007";
