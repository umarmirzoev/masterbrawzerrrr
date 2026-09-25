import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, ImagePlus, Loader2, Sparkles, RotateCcw, Phone, AlertTriangle, CheckCircle2, Search } from "lucide-react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { SUPPORT_PHONE } from "@/lib/utils";
import {
  AiNotConfiguredError,
  PHOTO_CATEGORIES,
  compressImage,
  diagnosePhoto,
  type PhotoDiagnosis,
} from "@/lib/aiPhoto";

type Step = "pick" | "analyzing" | "result" | "manual" | "error";

const URGENCY_LABEL: Record<PhotoDiagnosis["urgency"], { text: string; cls: string }> = {
  low: { text: "Не срочно", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" },
  medium: { text: "Желательно сегодня", cls: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" },
  high: { text: "Срочно", cls: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300" },
};

// Страница «Фото ИИ»: клиент фотографирует поломку, ИИ определяет проблему и нужного мастера.
export default function AiPhoto() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("pick");
  const [preview, setPreview] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [result, setResult] = useState<PhotoDiagnosis | null>(null);
  const [errorText, setErrorText] = useState("");

  const onFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorText("Выберите файл изображения");
      setStep("error");
      return;
    }
    try {
      const { base64: b64, previewUrl } = await compressImage(file);
      setPreview(previewUrl);
      setBase64(b64);
      setResult(null);
      setStep("pick");
    } catch (e) {
      setErrorText((e as Error).message);
      setStep("error");
    }
  };

  const analyze = async () => {
    if (!base64) return;
    setStep("analyzing");
    try {
      const diagnosis = await diagnosePhoto(base64, note.trim(), language);
      setResult(diagnosis);
      setStep(diagnosis.recognized ? "result" : "manual");
    } catch (e) {
      if (e instanceof AiNotConfiguredError) {
        setStep("manual");
      } else {
        setErrorText((e as Error).message);
        setStep("error");
      }
    }
  };

  const reset = () => {
    setPreview(null);
    setBase64(null);
    setNote("");
    setResult(null);
    setStep("pick");
  };

  const findMasters = (category: string) => navigate(`/masters?category=${encodeURIComponent(category)}`);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="container mx-auto px-4 py-10 md:py-16 max-w-3xl">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-bold mb-5">
            <Sparkles className="w-3.5 h-3.5" /> Фото ИИ
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Сфотографируйте поломку
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            ИИ определит проблему, подскажет нужного мастера и примерную цену в сомони.
          </p>
        </div>

        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
        <input ref={galleryRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none p-6 md:p-8">
          {!preview ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <button onClick={() => cameraRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-violet-200 dark:border-violet-500/30 bg-violet-50/50 dark:bg-violet-500/5 py-12 hover:border-violet-400 transition-colors">
                <Camera className="w-10 h-10 text-violet-500" />
                <span className="font-bold text-slate-900 dark:text-white">Сделать фото</span>
              </button>
              <button onClick={() => galleryRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-12 hover:border-slate-400 transition-colors">
                <ImagePlus className="w-10 h-10 text-slate-500" />
                <span className="font-bold text-slate-900 dark:text-white">Загрузить из галереи</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={preview} alt="Фото поломки" className="w-full max-h-[420px] object-contain" />
                {step === "analyzing" && (
                  <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center gap-3 text-white">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <span className="font-bold">ИИ анализирует фото…</span>
                  </div>
                )}
              </div>

              {step === "pick" && (
                <>
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={300}
                    placeholder="Коротко опишите проблему (необязательно): «течёт под раковиной», «искрит розетка»…" />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={analyze} className="flex-1 h-12 rounded-xl bg-violet-600 hover:bg-violet-700 font-bold">
                      <Sparkles className="w-4 h-4 mr-2" /> Определить проблему
                    </Button>
                    <Button variant="outline" onClick={reset} className="h-12 rounded-xl">
                      <RotateCcw className="w-4 h-4 mr-2" /> Другое фото
                    </Button>
                  </div>
                </>
              )}

              {step === "result" && result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white">{result.problem}</h2>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">{result.details}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                      Мастер: {result.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${URGENCY_LABEL[result.urgency].cls}`}>
                      {URGENCY_LABEL[result.urgency].text}
                    </span>
                    {result.priceMin != null && result.priceMax != null && (
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        ≈ {result.priceMin}–{result.priceMax} сомони
                      </span>
                    )}
                  </div>
                  {result.advice && (
                    <p className="text-sm rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-200 p-3">
                      💡 {result.advice}
                    </p>
                  )}
                  {result.urgency === "high" && (
                    <Link to="/sos" className="block text-center rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold py-3">
                      Срочная проблема — открыть SOS
                    </Link>
                  )}
                  <p className="text-xs text-slate-400">Оценка ИИ примерная — точную цену назовёт мастер после осмотра.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => findMasters(result.category)} className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold">
                      <Search className="w-4 h-4 mr-2" /> Найти мастера
                    </Button>
                    <Button variant="outline" asChild className="h-12 rounded-xl">
                      <a href={`tel:${SUPPORT_PHONE}`}><Phone className="w-4 h-4 mr-2" /> Позвонить</a>
                    </Button>
                    <Button variant="ghost" onClick={reset} className="h-12 rounded-xl">Новое фото</Button>
                  </div>
                </motion.div>
              )}

              {step === "manual" && (
                <div className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-300">
                    {result && !result.recognized
                      ? result.details || "ИИ не смог распознать проблему на фото."
                      : "ИИ-анализ скоро заработает. Пока выберите, какой мастер нужен:"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PHOTO_CATEGORIES.map((c) => (
                      <button key={c} onClick={() => findMasters(c)}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                        {c}
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" onClick={reset} className="rounded-xl">
                    <RotateCcw className="w-4 h-4 mr-2" /> Другое фото
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === "error" && (
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 p-4">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{errorText || "Что-то пошло не так"}</p>
                <button onClick={reset} className="text-sm underline mt-1">Попробовать снова</button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
