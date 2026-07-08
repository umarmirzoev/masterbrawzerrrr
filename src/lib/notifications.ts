import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import {
  normalizeTranslationParams,
  type TranslationParams,
} from "@/lib/i18n";

export type AppNotification = Tables<"notifications">;

interface BuildLocalizedNotificationOptions {
  fallbackMessage: string;
  fallbackTitle: string;
  messageKey?: string | null;
  params?: TranslationParams;
  relatedId?: string | null;
  titleKey?: string | null;
  type: string;
  userId: string;
}

const sanitizePayload = (params?: TranslationParams) => {
  if (!params) {
    return null;
  }

  const payload = Object.entries(params).reduce<Record<string, string | number | boolean | null>>(
    (accumulator, [key, value]) => {
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        value === null
      ) {
        accumulator[key] = value;
      }

      return accumulator;
    },
    {},
  );

  return Object.keys(payload).length > 0 ? payload : null;
};

export const buildLocalizedNotification = ({
  fallbackMessage,
  fallbackTitle,
  messageKey,
  params,
  relatedId,
  titleKey,
  type,
  userId,
}: BuildLocalizedNotificationOptions): TablesInsert<"notifications"> => ({
  user_id: userId,
  title: fallbackTitle,
  message: fallbackMessage,
  title_key: titleKey ?? null,
  message_key: messageKey ?? null,
  payload: sanitizePayload(params),
  type,
  related_id: relatedId ?? null,
});

export const resolveNotificationText = (
  notification: Pick<
    AppNotification,
    "message" | "message_key" | "payload" | "title" | "title_key"
  >,
  t: (key: string, params?: TranslationParams) => string,
) => {
  const params = normalizeTranslationParams(notification.payload);

  return {
    title: notification.title_key ? t(notification.title_key, params) : notification.title,
    message: notification.message_key
      ? t(notification.message_key, params)
      : notification.message,
  };
};
