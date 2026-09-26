import { supabase } from "@/integrations/supabase/client";

// Лучший эффорт: зеркалим заказы, оформленные на сайте, в старый .NET-бэкенд,
// который питает панель админа/суперадмина в Flutter-приложении. Работает только
// если у текущего пользователя уже есть связка legacy_backend_links (создаётся
// при регистрации через legacy-sync action=register). Любая ошибка молча
// логируется в консоль и никогда не блокирует и не ломает создание заказа на сайте.
export function syncOrderToLegacyBackend(order: {
  title?: string;
  description?: string;
  address?: string;
  /** Мастер, которого выбрал клиент: по телефону бэкенд назначит заказ именно ему. */
  masterName?: string | null;
  masterPhone?: string | null;
}) {
  supabase.functions
    .invoke("legacy-sync", {
      body: {
        action: "order",
        title: order.title,
        description: order.description,
        address: order.address,
        masterName: order.masterName || undefined,
        masterPhone: order.masterPhone || undefined,
      },
    })
    .catch((err) => console.warn("legacy-sync order skipped:", err));
}
