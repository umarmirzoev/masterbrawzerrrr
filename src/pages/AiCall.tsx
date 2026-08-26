import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Mic, PhoneOff, Loader2, AlertTriangle } from "lucide-react";
import { getVapi, VAPI_ASSISTANT_ID } from "@/lib/vapiClient";
import { useLanguage } from "@/contexts/LanguageContext";

type CallState = "idle" | "connecting" | "active" | "ended" | "error";

interface TranscriptLine {
  role: "user" | "assistant";
  text: string;
}

// Живой голосовой разговор с ИИ-менеджером Master.tj прямо в браузере (через Vapi Web SDK).
// Разговор происходит по микрофону устройства, без реального телефонного звонка.
export default function AiCall() {
  const { t } = useLanguage();
  const [state, setState] = useState<CallState>("idle");
  const [assistantSpeaking, setAssistantSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const vapi = getVapi();

    const onCallStart = () => setState("active");
    const onCallEnd = () => setState("ended");
    const onSpeechStart = () => setAssistantSpeaking(true);
    const onSpeechEnd = () => setAssistantSpeaking(false);
    const onError = (e: any) => {
      console.error("Vapi error:", e);
      setErrorMessage(t("aiCallErrorConnect"));
      setState("error");
    };
    const onMessage = (message: any) => {
      if (message?.type === "transcript" && message?.transcriptType === "final") {
        setTranscript((prev) => [...prev, { role: message.role, text: message.transcript }]);
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);
    vapi.on("message", onMessage);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
      vapi.off("message", onMessage);
    };
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const startCall = async () => {
    setErrorMessage("");
    setTranscript([]);
    setState("connecting");
    try {
      await getVapi().start(VAPI_ASSISTANT_ID);
    } catch (e) {
      console.error("Failed to start Vapi call:", e);
      setErrorMessage(t("aiCallErrorStart"));
      setState("error");
    }
  };

  const endCall = () => {
    getVapi().stop();
    setState("ended");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="relative overflow-hidden flex-1 flex items-center justify-center py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_45%)]" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-sky-200/20 blur-3xl" />
        <div className="container px-4 mx-auto flex justify-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <Card className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
              <CardHeader className="text-center pb-2">
                <motion.div
                  animate={{ scale: state === "idle" || state === "ended" ? [1, 1.06, 1] : 1 }}
                  transition={{ duration: 2.4, repeat: state === "idle" || state === "ended" ? Infinity : 0, ease: "easeInOut" }}
                  className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center border-4 border-white shadow-lg shadow-emerald-200/60"
                >
                  <Bot className="w-8 h-8 text-white" />
                </motion.div>
                <CardTitle className="text-2xl">{t("aiCallPageTitle")}</CardTitle>
                <CardDescription>
                  {t("aiCallPageDesc")}
                </CardDescription>
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
                      className="flex flex-col items-center py-6 gap-4"
                    >
                      <Button onClick={startCall} className="hover-soft w-full rounded-full h-14 text-base gap-2 bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all active:scale-95">
                        <Mic className="w-5 h-5" />
                        {t("aiCallStartButton")}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        {t("aiCallMicHint")}
                      </p>
                      {state === "ended" && transcript.length > 0 && (
                        <div className="w-full mt-2 max-h-60 overflow-y-auto space-y-2 border-t border-border pt-4">
                          {transcript.map((line, i) => (
                            <div key={i} className={`rounded-2xl border px-3 py-2 text-sm ${line.role === "assistant" ? "border-emerald-100 bg-emerald-50/60 text-foreground" : "border-slate-100 bg-slate-50 text-muted-foreground"}`}>
                              <span className="font-semibold">{line.role === "assistant" ? t("aiCallLabelAi") : t("aiCallLabelUser")}</span>
                              {line.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {state === "connecting" && (
                    <motion.div
                      key="connecting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center py-10 gap-3"
                    >
                      <div className="w-16 h-16 rounded-full border-4 border-emerald-100 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                      </div>
                      <p className="font-medium text-foreground text-center">{t("aiCallConnecting")}</p>
                    </motion.div>
                  )}

                  {state === "active" && (
                    <motion.div
                      key="active"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center py-6 gap-4"
                    >
                      <div className="relative w-24 h-24">
                        <AnimatePresence>
                          {assistantSpeaking && (
                            <motion.div
                              initial={{ opacity: 0.6, scale: 1 }}
                              animate={{ opacity: 0, scale: 1.6 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="absolute inset-0 rounded-full bg-primary/40"
                            />
                          )}
                        </AnimatePresence>
                        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center border-4 border-white shadow-lg shadow-emerald-200/50">
                          <Bot className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      <p className="font-medium text-foreground text-center">
                        {assistantSpeaking ? t("aiCallSpeaking") : t("aiCallListening")}
                      </p>

                      <div className="w-full max-h-52 overflow-y-auto space-y-2 border-t border-border pt-4">
                        {transcript.map((line, i) => (
                          <div key={i} className={`rounded-2xl border px-3 py-2 text-sm ${line.role === "assistant" ? "border-emerald-100 bg-emerald-50/60 text-foreground" : "border-slate-100 bg-slate-50 text-muted-foreground"}`}>
                            <span className="font-semibold">{line.role === "assistant" ? t("aiCallLabelAi") : t("aiCallLabelUser")}</span>
                            {line.text}
                          </div>
                        ))}
                        <div ref={transcriptEndRef} />
                      </div>

                      <Button onClick={endCall} variant="destructive" className="hover-soft w-full rounded-full h-12 gap-2 transition-all active:scale-95">
                        <PhoneOff className="w-4 h-4" />
                        {t("aiCallEndButton")}
                      </Button>
                    </motion.div>
                  )}

                  {state === "error" && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center py-8 gap-3"
                    >
                      <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-destructive" />
                      </div>
                      <p className="font-medium text-foreground text-center">{errorMessage}</p>
                      <Button variant="outline" className="hover-soft rounded-full mt-2 transition-all active:scale-95" onClick={() => setState("idle")}>
                        {t("aiCallTryAgain")}
                      </Button>
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
