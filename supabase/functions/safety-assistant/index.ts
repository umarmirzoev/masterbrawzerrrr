// УДАЛЕНО: раздел «Обучение и безопасность» был убран из проекта по просьбе пользователя.
// Эта функция должна быть удалена вручную через Supabase Dashboard -> Edge Functions
// (MCP-инструмента для удаления edge-функций нет). Тело оставлено безвредным.
Deno.serve(() => new Response(JSON.stringify({ success: false, error: "removed" }), {
  status: 410,
  headers: { "Content-Type": "application/json" },
}));
