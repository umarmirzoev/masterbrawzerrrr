import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Mic, MicOff, PhoneOff, Loader2, AlertTriangle, Phone, MessageCircle, Sparkles, Clock, ShieldCheck, Languages } from "lucide-react";
import { getVapi, VAPI_ASSISTANT_ID } from "@/lib/vapiClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { SUPPORT_PHONE, SUPPORT_WHATSAPP } from "@/lib/utils";
import { tx } from "@/lib/localizeNames";

type CallState = "idle" | "connecting" | "active" | "ended" | "error";

interface TranscriptLine {
  role: "user" | "assistant";
  text: string;
}

const CONNECT_TIMEOUT_MS = 20000;

// Живой голосовой разговор с ИИ-менеджером Master.tj прямо в браузере (через Vapi Web SDK).
// Разговор происходит по микрофону устройства, без реального телефонного звонка.
export default function AiCall() {
  const { t } = useLanguage();
  const [state, setState] = useState<CallState>("idle");
  const [assistantSpeaking, setAssistantSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [partial, setPartial] = useState<TranscriptLine | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [volume, setVolume] = useState(0);
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const connectTimer = useRef<number | null>(null);
  const stateRef = useRef<CallState>("idle");
  stateRef.current = state;

  const clearConnectTimer = () => {
    if (connectTimer.current) {
      window.clearTimeout(connectTimer.current);
      connectTimer.current = null;
    }
  };

  useEffect(() => {
    const vapi = getVapi();

    const onCallStart = () => {
      clearConnectTimer();
      setSeconds(0);
      setState("active");
    };
    const onCallEnd = () => {
      clearConnectTimer();
      setAssistantSpeaking(false);
      setVolume(0);
      setPartial(null);
      setState((s) => (s === "error" ? s : "ended"));
    };
    const onSpeechStart = () => setAssistantSpeaking(true);
    const onSpeechEnd = () => setAssistantSpeaking(false);
    const onVolume = (v: number) => setVolume(typeof v === "number" ? v : 0);
    const onError = (e: any) => {
      console.error("Vapi error:", e);
      clearConnectTimer();
      setErrorMessage(t("aiCallErrorConnect"));
      setState("error");
    };
    const onMessage = (message: any) => {
      if (message?.type !== "transcript") return;
      const line = { role: message.role, text: message.transcript } as TranscriptLine;
      if (message.transcriptType === "final") {
        setPartial(null);
        setTranscript((prev) => [...prev, line]);
      } else {
        setPartial(line);
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("volume-level", onVolume);
    vapi.on("error", onError);
    vapi.on("message", onMessage);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("volume-level", onVolume);
      vapi.off("error", onError);
      vapi.off("message", onMessage);
      clearConnectTimer();
      // Уходим со страницы — кладём трубку, чтобы микрофон не остался включённым.
      if (stateRef.current === "active" || stateRef.current === "connecting") {
        try { vapi.stop(); } catch { /* ignore */ }
      }
    };
  }, []);

  // Таймер разговора.
  useEffect(() => {
    if (state !== "active") return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [state]);

  useEffect(() => {
    // Прокручиваем только внутренний контейнер транскрипта, а не всю страницу.
    const container = transcriptContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [transcript, partial]);

  const startCall = async () => {
    setErrorMessage("");
    setTranscript([]);
    setPartial(null);
    setMuted(false);
    setState("connecting");

    // Сначала явно спрашиваем микрофон — так понятная ошибка, если доступ запрещён.
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((tr) => tr.stop());
      }
    } catch (e) {
      console.error("Mic permission error:", e);
      setErrorMessage(tx(
        "Нет доступа к микрофону. Разрешите микрофон в настройках браузера (значок замка слева от адреса) и попробуйте снова.",
        "No microphone access. Allow the microphone in browser settings (lock icon near the address) and try again.",
        "Ба микрофон дастрасӣ нест. Микрофонро дар танзимоти браузер иҷозат диҳед ва аз нав кӯшиш кунед.",
      ));
      setState("error");
      return;
    }

    connectTimer.current = window.setTimeout(() => {
      if (stateRef.current === "connecting") {
        try { getVapi().stop(); } catch { /* ignore */ }
        setErrorMessage(tx(
          "ИИ-менеджер не ответил. Проверьте интернет или позвоните нам напрямую.",
          "The AI manager did not answer. Check your internet or call us directly.",
          "Менеҷери ИИ ҷавоб надод. Интернетро санҷед ё ба мо занг занед.",
        ));
        setState("error");
      }
    }, CONNECT_TIMEOUT_MS);

    try {
      await getVapi().start(VAPI_ASSISTANT_ID);
    } catch (e) {
      console.error("Failed to start Vapi call:", e);
      clearConnectTimer();
      setErrorMessage(t("aiCallErrorStart"));
      setState("error");
    }
  };

  const endCall = () => {
    clearConnectTimer();
    try { getVapi().stop(); } catch { /* ignore */ }
    setAssistantSpeaking(false);
    setVolume(0);
    setState("ended");
  };

  const toggleMute = () => {
    const next = !muted;
    try { getVapi().setMuted(next); } catch { /* ignore */ }
    setMuted(next);
  };

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const level = Math.min(1, Math.max(0, volume));

  const suggestions = [
    tx("Потёк кран, сколько стоит ремонт?", "My tap is leaking — how much is a repair?", "Крон об медиҳад, таъмир чанд пул?"),
    tx("Нужен электрик сегодня вечером", "I need an electrician tonight", "Имшаб электрик лозим"),
    tx("Как стать мастером на Master.tj?", "How do I become a master on Master.tj?", "Чӣ тавр усто шавам?"),
  ];

  // Обычная функция, а не компонент — иначе список пересоздаётся на каждый кадр громкости.
  const renderTranscript = (live: boolean) => (
    <div ref={live ? transcriptContainerRef : undefined} className="w-full max-h-60 overflow-y-auto space-y-2 border-t border-border pt-4 pr-1">
      <AnimatePresence initial={false}>
        {transcript.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${line.role === "assistant" ? "justify-start" : "justify-end"}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${line.role === "assistant" ? "rounded-bl-md bg-emerald-50 text-foreground ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:ring-emerald-500/20" : "rounded-br-md bg-gradient-to-br from-emerald-500 to-teal-500 text-white"}`}>
              <span className={`mb-0.5 block text-[10px] font-bold uppercase tracking-wider ${line.role === "assistant" ? "text-emerald-600" : "text-white/80"}`}>
                {line.role === "assistant" ? t("aiCallLabelAi") : t("aiCallLabelUser")}
              </span>
              {line.text}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {live && partial && (
        <div className={`flex ${partial.role === "assistant" ? "justify-start" : "justify-end"}`}>
          <div className="max-w-[85%] rounded-2xl border border-dashed border-emerald-200 px-3.5 py-2 text-sm italic text-muted-foreground">
            {partial.text}
            <span className="ml-1 inline-flex gap-0.5 align-middle">
              {[0, 1, 2].map((d) => (
                <motion.span key={d} className="h-1 w-1 rounded-full bg-emerald-400" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }} />
              ))}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="relative overflow-hidden flex-1 flex items-center justify-center py-12 sm:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.10),transparent_45%)]" />
        <motion.div aria-hidden className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" animate={{ x: [0, 60, 0], y: [0, 40, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div aria-hidden className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" animate={{ x: [0, -50, 0], y: [0, -40, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
        <div className="container px-4 mx-auto flex justify-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="w-full max-w-md">
            <Card className="rounded-[2rem] border border-slate-100 shadow-2xl shadow-emerald-100/50 overflow-hidden transition-shadow duration-500 hover:shadow-emerald-200/60 dark:border-slate-800">
              <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-sky-400" />
              <CardHeader className="text-center pb-2">
                <motion.div
                  animate={{ scale: state === "idle" || state === "ended" ? [1, 1.06, 1] : 1 }}
                  transition={{ duration: 2.4, repeat: state === "idle" || state === "ended" ? Infinity : 0, ease: "easeInOut" }}
                  whileHover={{ rotate: [0, -10, 10, -6, 0], transition: { duration: 0.6 } }}
                  className="relative w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center border-4 border-white shadow-lg shadow-emerald-200/60 cursor-default"
                >
                  <Bot className="w-8 h-8 text-white" />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-400">
                    <span className="absolute inset-0 rounded-full bg-emerald-300 animate-ping" />
                  </span>
                </motion.div>
                <CardTitle className="text-2xl">{t("aiCallPageTitle")}</CardTitle>
                <CardDescription>{t("aiCallPageDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {(state === "idle" || state === "ended") && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center py-4 gap-4"
                    >
                      <div className="grid w-full grid-cols-3 gap-2">
                        {[
                          { icon: Clock, text: tx("24/7", "24/7", "24/7") },
                          { icon: Languages, text: tx("RU · TJ", "RU · TJ", "RU · TJ") },
                          { icon: ShieldCheck, text: tx("Бесплатно", "Free", "Ройгон") },
                        ].map((f) => (
                          <div key={f.text} className="group flex cursor-default flex-col items-center gap-1 rounded-2xl bg-slate-50 py-3 text-xs font-bold text-slate-600 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800/60 dark:text-slate-300">
                            <f.icon className="h-4 w-4 text-emerald-500 transition-transform duration-300 group-hover:scale-125" />
                            {f.text}
                          </div>
                        ))}
                      </div>

                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="relative w-full">
                        <span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping [animation-duration:2.2s]" />
                        <Button onClick={startCall} className="group relative w-full overflow-hidden rounded-full h-14 text-base gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-xl shadow-emerald-200 transition-all">
                          <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                          <Mic className="relative w-5 h-5 transition-transform duration-300 group-hover:scale-125" />
                          <span className="relative">{state === "ended" ? tx("Позвонить снова", "Call again", "Боз занг задан") : t("aiCallStartButton")}</span>
                        </Button>
                      </motion.div>
                      <p className="text-xs text-center text-muted-foreground">{t("aiCallMicHint")}</p>

                      {state === "idle" && (
                        <div className="w-full">
                          <p className="mb-2 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            <Sparkles className="h-3.5 w-3.5" /> {tx("Можно спросить", "You can ask", "Метавонед пурсед")}
                          </p>
                          <div className="flex flex-col gap-2">
                            {suggestions.map((s, i) => (
                              <motion.div
                                key={s}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + i * 0.08 }}
                                className="cursor-default rounded-2xl border border-slate-100 bg-white px-4 py-2.5 text-sm text-slate-600 transition-all duration-300 hover:translate-x-1 hover:border-emerald-200 hover:bg-emerald-50/60 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                              >
                                «{s}»
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {state === "ended" && transcript.length > 0 && renderTranscript(false)}
                    </motion.div>
                  )}

                  {state === "connecting" && (
                    <motion.div
                      key="connecting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center py-10 gap-4"
                    >
                      <div className="relative flex h-24 w-24 items-center justify-center">
                        {[0, 1, 2].map((r) => (
                          <motion.span
                            key={r}
                            className="absolute inset-0 rounded-full border-2 border-emerald-300"
                            initial={{ scale: 0.6, opacity: 0.8 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 1.8, repeat: Infinity, delay: r * 0.6 }}
                          />
                        ))}
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                        </div>
                      </div>
                      <p className="font-medium text-foreground text-center">{t("aiCallConnecting")}</p>
                      <Button variant="ghost" className="rounded-full text-muted-foreground hover:text-destructive" onClick={endCall}>
                        {tx("Отменить", "Cancel", "Бекор кардан")}
                      </Button>
                    </motion.div>
                  )}

                  {state === "active" && (
                    <motion.div
                      key="active"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center py-4 gap-4"
                    >
                      <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> {mmss}
                      </div>

                      {/* Аватар реагирует на громкость голоса */}
                      <div className="relative flex h-32 w-32 items-center justify-center">
                        <motion.div
                          className="absolute inset-0 rounded-full bg-emerald-400/25"
                          animate={{ scale: 1 + level * 0.6 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        />
                        <AnimatePresence>
                          {assistantSpeaking && (
                            <motion.div
                              initial={{ opacity: 0.6, scale: 1 }}
                              animate={{ opacity: 0, scale: 1.7 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1.2, repeat: Infinity }}
                              className="absolute inset-2 rounded-full bg-emerald-500/40"
                            />
                          )}
                        </AnimatePresence>
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-emerald-500 to-teal-400 shadow-xl shadow-emerald-200/60">
                          <Bot className="w-11 h-11 text-white" />
                        </div>
                      </div>

                      {/* Эквалайзер */}
                      <div className="flex h-8 items-end gap-1">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <motion.span
                            key={i}
                            className="w-1.5 rounded-full bg-gradient-to-t from-emerald-500 to-teal-300"
                            animate={{ height: assistantSpeaking ? [6, 6 + ((i * 7) % 22) + level * 10, 6] : 4 + level * 24 * (1 - Math.abs(i - 4) / 5) }}
                            transition={assistantSpeaking ? { duration: 0.5 + (i % 3) * 0.15, repeat: Infinity, ease: "easeInOut" } : { duration: 0.15 }}
                          />
                        ))}
                      </div>

                      <p className="font-medium text-foreground text-center">
                        {muted ? tx("Микрофон выключен", "Microphone muted", "Микрофон хомӯш") : assistantSpeaking ? t("aiCallSpeaking") : t("aiCallListening")}
                      </p>

                      {renderTranscript(true)}

                      <div className="flex w-full gap-3">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={toggleMute}
                          aria-label={muted ? "Включить микрофон" : "Выключить микрофон"}
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${muted ? "border-amber-400 bg-amber-50 text-amber-600" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900"}`}
                        >
                          {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </motion.button>
                        <Button onClick={endCall} variant="destructive" className="group flex-1 rounded-full h-12 gap-2 shadow-lg shadow-red-200 transition-all duration-300 hover:scale-[1.02] active:scale-95">
                          <PhoneOff className="w-4 h-4 transition-transform duration-300 group-hover:rotate-[135deg]" />
                          {t("aiCallEndButton")}
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {state === "error" && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center py-6 gap-3"
                    >
                      <motion.div
                        animate={{ rotate: [0, -8, 8, -6, 6, 0] }}
                        transition={{ duration: 0.6 }}
                        className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center"
                      >
                        <AlertTriangle className="w-8 h-8 text-destructive" />
                      </motion.div>
                      <p className="font-medium text-foreground text-center">{errorMessage}</p>
                      <Button className="rounded-full mt-1 bg-emerald-500 hover:bg-emerald-600 transition-all active:scale-95" onClick={startCall}>
                        <Mic className="mr-2 h-4 w-4" /> {t("aiCallTryAgain")}
                      </Button>
                      <div className="mt-2 flex w-full gap-2">
                        <Button variant="outline" asChild className="flex-1 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white">
                          <a href={`tel:${SUPPORT_PHONE}`}><Phone className="mr-1.5 h-4 w-4" /> {tx("Позвонить", "Call", "Занг задан")}</a>
                        </Button>
                        <Button variant="outline" asChild className="flex-1 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:border-green-500 hover:bg-green-500 hover:text-white">
                          <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp</a>
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
