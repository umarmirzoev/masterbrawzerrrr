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
}) {
  supabase.functions
    .invoke("legacy-sync", {
      body: {
        action: "order",
        title: order.title,
        description: order.description,
        address: order.address,
      },
    })
    .catch((err) => console.warn("legacy-sync order skipped:", err));
}
