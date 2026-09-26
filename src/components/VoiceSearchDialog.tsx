import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Sparkles, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Минимальные типы Web Speech API (в lib.dom их нет).
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

const getRecognitionCtor = (): (new () => SpeechRecognitionLike) | null => {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};

const LANG_CODE: Record<string, string> = { ru: "ru-RU", en: "en-US", tj: "ru-RU" };

const EXAMPLES = ["Электрика", "Замена крана", "Не работает розетка", "Сборка шкафа"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: string;
  /** Вызывается с распознанным текстом — дальше работает ИИ-поиск. */
  onResult: (text: string) => void;
}

type Status = "idle" | "listening" | "done" | "error" | "unsupported";

// Голосовой поиск: пользователь говорит «электрика» или «замена крана», текст появляется в окне
// и запись останавливается. Если распознано с ошибкой — «Повторить», если верно — «Найти мастера»,
// и только тогда запускается ИИ-подбор.
export default function VoiceSearchDialog({ open, onOpenChange, language, onResult }: Props) {
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef("");
  const [status, setStatus] = useState<Status>("idle");
  const [text, setText] = useState("");
  const [errorText, setErrorText] = useState("");

  const stop = () => {
    try { recRef.current?.stop(); } catch { /* уже остановлен */ }
  };

  const start = () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setStatus("unsupported");
      return;
    }
    try { recRef.current?.abort(); } catch { /* ignore */ }

    const rec = new Ctor();
    rec.lang = LANG_CODE[language] ?? "ru-RU";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    finalRef.current = "";
    setText("");
    setErrorText("");

    rec.onresult = (e: any) => {
      let finalText = "";
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += chunk;
        else interim += chunk;
      }
      finalRef.current = finalText;
      setText((finalText + " " + interim).trim());
    };
    rec.onerror = (e: any) => {
      const code = e?.error;
      setErrorText(
        code === "not-allowed" || code === "service-not-allowed"
          ? "Нет доступа к микрофону. Разрешите микрофон в настройках браузера."
          : code === "no-speech"
            ? "Не услышали вас. Нажмите на микрофон и скажите ещё раз."
            : "Не получилось распознать речь. Попробуйте ещё раз.",
      );
      setStatus("error");
    };
    rec.onend = () => {
      setStatus((s) => (s === "error" ? s : "done"));
    };

    recRef.current = rec;
    setStatus("listening");
    try {
      rec.start();
    } catch {
      setStatus("error");
      setErrorText("Не удалось включить микрофон.");
    }
  };

  // Открыли окно — сразу слушаем. Закрыли — выключаем микрофон.
  useEffect(() => {
    if (open) start();
    else {
      try { recRef.current?.abort(); } catch { /* ignore */ }
      setStatus("idle");
      setText("");
    }
    return () => {
      try { recRef.current?.abort(); } catch { /* ignore */ }
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = () => {
    const q = text.trim();
    if (!q) return;
    onOpenChange(false);
    onResult(q);
  };

  const listening = status === "listening";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-3xl p-5 sm:p-6">
        <DialogHeader className="items-center text-center">
          <DialogTitle className="text-2xl font-black">Голосовой поиск</DialogTitle>
          <DialogDescription>Скажите, что нужно сделать, — ИИ подберёт мастера</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-2">
          <button
            type="button"
            onClick={listening ? stop : start}
            disabled={status === "unsupported"}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-transform active:scale-95 disabled:opacity-40 ${
              listening ? "bg-red-500 shadow-red-500/40" : "bg-emerald-500 shadow-emerald-500/40"
            }`}
            aria-label={listening ? "Остановить запись" : "Начать запись"}
          >
            {listening && (
              <>
                <span className="absolute inset-0 rounded-full bg-red-500/40 animate-ping" />
                <span className="absolute -inset-3 rounded-full border-2 border-red-400/40 animate-pulse" />
              </>
            )}
            {status === "unsupported" ? <MicOff className="w-10 h-10 relative" /> : <Mic className="w-10 h-10 relative" />}
          </button>

          <p className="text-sm font-semibold text-center text-slate-500 dark:text-slate-400 min-h-5">
            {listening ? "Слушаю… говорите" : status === "done" && text ? "Проверьте текст — можно исправить вручную" : status === "unsupported" ? "" : "Нажмите на микрофон"}
          </p>

          <div className={`w-full min-h-[72px] rounded-2xl bg-slate-50 dark:bg-slate-800 px-4 py-3 text-center flex items-center justify-center border-2 transition-colors ${!listening && (text || status === "done") ? "border-emerald-200 dark:border-emerald-500/30 focus-within:border-emerald-500" : "border-transparent"}`}>
            {text && listening ? (
              <p className="text-lg font-bold text-slate-900 dark:text-white">«{text}»</p>
            ) : text || status === "done" ? (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={2}
                maxLength={200}
                placeholder="Напишите, что нужно сделать"
                aria-label="Текст запроса — можно исправить"
                className="w-full resize-none bg-transparent text-center text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-medium focus:outline-none"
              />
            ) : status === "unsupported" ? (
              <p className="text-sm text-slate-500">Ваш браузер не поддерживает голосовой ввод. Откройте сайт в Chrome или Safari.</p>
            ) : errorText ? (
              <p className="text-sm text-red-500">{errorText}</p>
            ) : (
              <p className="text-sm text-slate-400">Например: {EXAMPLES.map((e) => `«${e}»`).join(", ")}</p>
            )}
          </div>

          {(text || status === "done") && status !== "listening" && (
            <div className="flex w-full gap-2">
              <Button variant="outline" onClick={start} className="h-11 rounded-xl font-semibold">
                <RotateCcw className="w-4 h-4 mr-1.5" /> Повторить
              </Button>
              <Button onClick={submit} disabled={!text.trim()} className="flex-1 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold">
                <Sparkles className="w-4 h-4 mr-2" /> Найти мастера
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
