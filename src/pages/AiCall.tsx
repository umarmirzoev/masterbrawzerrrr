import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Bot, PhoneCall, Loader2, CheckCircle2, PhoneOff } from "lucide-react";

type Step = "form" | "calling" | "success" | "error";

// Страница запускает реальный телефонный звонок от ИИ-менеджера Master.tj (через Vapi)
// клиенту на указанный номер — ИИ обсудит заявку прямо по телефону.
export default function AiCall() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [phone, setPhone] = useState(profile?.phone || "");
  const [step, setStep] = useState<Step>("form");
  const [errorMessage, setErrorMessage] = useState("");

  const handleCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!phone.trim()) {
      toast({ title: "Укажите номер телефона", variant: "destructive" });
      return;
    }

    setStep("calling");
    const { data, error } = await supabase.functions.invoke("vapi-call", {
      body: { phone: phone.trim(), name: profile?.full_name || undefined },
    });

    if (error || !data?.success) {
      setStep("error");
      setErrorMessage(
        data?.error === "too_soon"
          ? "Вы уже запрашивали звонок недавно. Подождите минуту и попробуйте снова."
          : "Не удалось запустить звонок. Попробуйте ещё раз чуть позже."
      );
      return;
    }

    setStep("success");
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
              <CardTitle className="text-2xl">ИИ-менеджер позвонит вам</CardTitle>
              <CardDescription>
                Укажите номер телефона — наш ИИ-менеджер сразу позвонит и оформит заявку прямо в разговоре
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === "form" && (
                <form onSubmit={handleCall} className="space-y-4">
                  <div className="relative">
                    <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="+992 900 000 000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 h-12 text-base"
                      type="tel"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-full h-12 text-base gap-2">
                    <PhoneCall className="w-4 h-4" />
                    Позвонить мне
                  </Button>
                  {!user && (
                    <p className="text-xs text-center text-muted-foreground">
                      Нужно войти в аккаунт, чтобы запросить звонок
                    </p>
                  )}
                </form>
              )}

              {step === "calling" && (
                <div className="flex flex-col items-center py-8 gap-3">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="font-medium text-foreground text-center">Запускаем звонок...</p>
                </div>
              )}

              {step === "success" && (
                <div className="flex flex-col items-center py-8 gap-3">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                  <p className="font-medium text-foreground text-center">
                    Готово! В течение минуты вам позвонит ИИ-менеджер Master.tj на номер {phone}
                  </p>
                  <Button variant="outline" className="rounded-full mt-2" onClick={() => setStep("form")}>
                    Запросить ещё звонок
                  </Button>
                </div>
              )}

              {step === "error" && (
                <div className="flex flex-col items-center py-8 gap-3">
                  <PhoneOff className="w-12 h-12 text-destructive" />
                  <p className="font-medium text-foreground text-center">{errorMessage}</p>
                  <Button variant="outline" className="rounded-full mt-2" onClick={() => setStep("form")}>
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
