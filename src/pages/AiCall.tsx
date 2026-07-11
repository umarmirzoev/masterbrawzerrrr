import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Mic, PhoneOff, Loader2, AlertTriangle } from "lucide-react";
import { getVapi, VAPI_ASSISTANT_ID } from "@/lib/vapiClient";

type CallState = "idle" | "connecting" | "active" | "ended" | "error";

interface TranscriptLine {
  role: "user" | "assistant";
  text: string;
}

// Живой голосовой разговор с ИИ-менеджером Master.tj прямо в браузере (через Vapi Web SDK).
// Разговор происходит по микрофону устройства, без реального телефонного звонка.
export default function AiCall() {
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
      setErrorMessage("Не удалось подключиться к ИИ-менеджеру. Проверьте разрешение на микрофон и попробуйте снова.");
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
      setErrorMessage("Не удалось начать разговор. Разрешите доступ к микрофону в браузере и попробуйте снова.");
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
      <div className="container px-4 mx-auto py-16 flex justify-center flex-1">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">ИИ-менеджер Master.tj</CardTitle>
              <CardDescription>
                Поговорите с голосовым ИИ-менеджером прямо в браузере — он поможет оформить заявку
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(state === "idle" || state === "ended") && (
                <div className="flex flex-col items-center py-6 gap-4">
                  <Button onClick={startCall} className="w-full rounded-full h-14 text-base gap-2">
                    <Mic className="w-5 h-5" />
                    Начать разговор
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Потребуется разрешение на использование микрофона
                  </p>
                  {state === "ended" && transcript.length > 0 && (
                    <div className="w-full mt-2 max-h-60 overflow-y-auto space-y-2 border-t border-border pt-4">
                      {transcript.map((line, i) => (
                        <div key={i} className={`text-sm ${line.role === "assistant" ? "text-foreground" : "text-muted-foreground"}`}>
                          <span className="font-semibold">{line.role === "assistant" ? "ИИ: " : "Вы: "}</span>
                          {line.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {state === "connecting" && (
                <div className="flex flex-col items-center py-10 gap-3">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="font-medium text-foreground text-center">Подключаемся к ИИ-менеджеру...</p>
                </div>
              )}

              {state === "active" && (
                <div className="flex flex-col items-center py-6 gap-4">
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
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
                      <Bot className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <p className="font-medium text-foreground text-center">
                    {assistantSpeaking ? "ИИ-менеджер говорит..." : "Слушаю вас..."}
                  </p>

                  <div className="w-full max-h-52 overflow-y-auto space-y-2 border-t border-border pt-4">
                    {transcript.map((line, i) => (
                      <div key={i} className={`text-sm ${line.role === "assistant" ? "text-foreground" : "text-muted-foreground"}`}>
                        <span className="font-semibold">{line.role === "assistant" ? "ИИ: " : "Вы: "}</span>
                        {line.text}
                      </div>
                    ))}
                    <div ref={transcriptEndRef} />
                  </div>

                  <Button onClick={endCall} variant="destructive" className="w-full rounded-full h-12 gap-2">
                    <PhoneOff className="w-4 h-4" />
                    Завершить разговор
                  </Button>
                </div>
              )}

              {state === "error" && (
                <div className="flex flex-col items-center py-8 gap-3">
                  <AlertTriangle className="w-12 h-12 text-destructive" />
                  <p className="font-medium text-foreground text-center">{errorMessage}</p>
                  <Button variant="outline" className="rounded-full mt-2" onClick={() => setState("idle")}>
                    Попробовать снова
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
