import { ClipboardList, CheckCircle, User, MapPin, Clock, XCircle } from "lucide-react";

// Общий список статусов заказа услуги — используется и в кабинете (список заказов),
// и на отдельной странице деталей заказа, чтобы оба места не расходились.
export const allStatuses = [
  { key: "new", label: "Новый заказ", icon: ClipboardList, color: "bg-blue-500" },
  { key: "accepted", label: "Принят админом", icon: CheckCircle, color: "bg-yellow-500" },
  { key: "assigned", label: "Назначен мастер", icon: User, color: "bg-indigo-500" },
  { key: "on_the_way", label: "Мастер в пути", icon: MapPin, color: "bg-cyan-500" },
  { key: "arrived", label: "Мастер прибыл", icon: MapPin, color: "bg-teal-500" },
  { key: "in_progress", label: "Работа выполняется", icon: Clock, color: "bg-purple-500" },
  { key: "completed", label: "Завершён", icon: CheckCircle, color: "bg-green-500" },
  { key: "cancelled", label: "Отменён", icon: XCircle, color: "bg-red-500" },
];

export const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  accepted: "bg-yellow-100 text-yellow-800",
  assigned: "bg-indigo-100 text-indigo-800",
  on_the_way: "bg-cyan-100 text-cyan-800",
  arrived: "bg-teal-100 text-teal-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  reviewed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export const statusLabels: Record<string, string> = {
  new: "Новый",
  accepted: "Принят",
  assigned: "Назначен",
  on_the_way: "В пути",
  arrived: "Прибыл",
  in_progress: "В работе",
  completed: "Завершён",
  reviewed: "Оценён",
  cancelled: "Отменён",
};

// Вертикальный таймлайн статуса заказа — карточки в списке и отдельная страница
// заказа показывают его одинаково.
export function OrderTimeline({ order }: { order: any }) {
  const statusFlow = allStatuses.filter((s) => s.key !== "cancelled");
  const currentIdx = statusFlow.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "cancelled";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/20">
        <XCircle className="w-6 h-6 text-red-500" />
        <span className="font-medium text-red-700 dark:text-red-400">Заказ отменён</span>
      </div>
    );
  }

  return (
    <div className="relative py-2">
      <div className="space-y-0">
        {statusFlow.map((s, i) => {
          const isCompleted = i <= currentIdx;
          const isCurrent = i === currentIdx;
          const Icon = s.icon;
          return (
            <div key={s.key} className="flex items-start gap-3 relative">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    isCompleted
                      ? isCurrent
                        ? `${s.color} text-white shadow-md`
                        : "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted && !isCurrent ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                {i < statusFlow.length - 1 && (
                  <div className={`w-0.5 h-6 ${i < currentIdx ? "bg-green-500" : "bg-muted"}`} />
                )}
              </div>
              <div
                className={`pb-4 ${
                  isCurrent ? "font-medium text-foreground" : isCompleted ? "text-muted-foreground" : "text-muted-foreground/50"
                }`}
              >
                <p className="text-sm leading-none pt-1.5">{s.label}</p>
                {isCurrent && <p className="text-xs text-primary mt-1 animate-pulse">← Текущий статус</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
