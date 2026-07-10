import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
  stack?: string;
}

// Ловит любые ошибки рендера в дереве ниже, чтобы вместо белого экрана
// показать понятное сообщение с кнопкой перезагрузки.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message, stack: error?.stack };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // eslint-disable-next-line no-console
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl">
            😕
          </div>
          <h1 className="text-xl font-bold text-slate-900">Что-то пошло не так</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            Произошла непредвиденная ошибка. Попробуйте обновить страницу — обычно это помогает.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-6 h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors"
          >
            Обновить страницу
          </button>
          {this.state.message && (
            <pre className="mt-4 max-w-lg w-full text-left text-[11px] text-red-500 bg-red-50 rounded-xl p-3 overflow-auto whitespace-pre-wrap">
              {this.state.message}
              {"\n"}
              {this.state.stack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
