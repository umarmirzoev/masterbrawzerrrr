import type { Json } from "@/integrations/supabase/types";

export type Language = "ru" | "tj" | "en";

export type TranslationParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export const DEFAULT_LANGUAGE: Language = "ru";
export const LANGUAGE_STORAGE_KEY = "mc_lang";

export const LANGUAGE_OPTIONS: {
  value: Language;
  shortLabel: string;
  nativeLabel: string;
}[] = [
  { value: "ru", shortLabel: "RU", nativeLabel: "Русский" },
  { value: "tj", shortLabel: "TJ", nativeLabel: "Тоҷикӣ" },
  { value: "en", shortLabel: "EN", nativeLabel: "English" },
];

export const isLanguage = (value: unknown): value is Language =>
  value === "ru" || value === "tj" || value === "en";

export const readStoredLanguage = (): Language => {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLanguage(savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE;
};

export const writeStoredLanguage = (language: Language) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
};

export const getLanguageShortLabel = (language: Language) =>
  LANGUAGE_OPTIONS.find((option) => option.value === language)?.shortLabel ?? "RU";

export const getLanguageLocale = (language: Language) => {
  switch (language) {
    case "tj":
      return "tg-TJ";
    case "en":
      return "en-US";
    case "ru":
    default:
      return "ru-RU";
  }
};

export const formatTranslation = (
  template: string,
  params?: TranslationParams,
) => {
  if (!params) {
    return template;
  }

  return template.replace(/{{\s*([\w.]+)\s*}}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined || value === null ? "" : String(value);
  });
};

export const normalizeTranslationParams = (
  value: Json | null | undefined,
): TranslationParams => {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return {};
  }

  return Object.entries(value).reduce<TranslationParams>((accumulator, [key, item]) => {
    if (
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean" ||
      item === null
    ) {
      accumulator[key] = item;
    }

    return accumulator;
  }, {});
};
