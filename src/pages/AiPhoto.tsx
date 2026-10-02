import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle, ArrowLeft, Camera, CheckCircle2, ChevronRight, Gauge, Image as ImageIcon, Lightbulb,
  Phone, RotateCcw, ScanEye, Search, Siren, Sparkles, Users, Wallet, Wrench, XCircle,
} from "lucide-react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { SUPPORT_PHONE } from "@/lib/utils";
import { tx } from "@/lib/localizeNames";
import {
  AiNotConfiguredError,
  PHOTO_CATEGORIES,
  compressImage,
  diagnosePhoto,
  type PhotoDiagnosis,
} from "@/lib/aiPhoto";

type Step = "pick" | "analyzing" | "result" | "ok" | "manual" | "error";

const AI_GRADIENT = "bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500";

const URGENCY: Record<"low" | "medium" | "high", { ru: string; en: string; tj: string; cls: string }> = {
  low: { ru: "Не срочно", en: "Not urgent", tj: "Фаврӣ нест", cls: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" },
  medium: { ru: "Лучше сегодня", en: "Better today", tj: "Беҳтараш имрӯз", cls: "text-amber-600 bg-amber-50 dark:bg-amber-500/10" },
  high: { ru: "Срочно!", en: "Urgent!", tj: "Фаврӣ!", cls: "text-red-600 bg-red-50 dark:bg-red-500/10" },
};

// Страница «Фото ИИ»: клиент фотографирует вещь, ИИ (Claude) говорит, что сломано и какой мастер нужен,
// или что ничего не сломано. Дизайн повторяет экран «AI диагностика» во Flutter-приложении.
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
      setErrorText(tx("Выберите файл изображения", "Please choose an image", "Файли тасвирро интихоб кунед"));
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
      setStep(diagnosis.status === "broken" ? "result" : diagnosis.status === "ok" ? "ok" : "manual");
    } catch (e) {
      if (e instanceof AiNotConfiguredError) setStep("manual");
      else {
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
    setErrorText("");
    setStep("pick");
  };

  const findMasters = (category: string) => navigate(`/masters?category=${encodeURIComponent(category)}`);

  const features = [
    { icon: Search, title: tx("Тип поломки", "Type of damage", "Навъи вайронӣ"), sub: tx("Определит, что именно сломано", "Finds out what exactly is broken", "Муайян мекунад, ки чӣ вайрон шудааст") },
    { icon: CheckCircle2, title: tx("Всё ли в порядке", "Is everything fine", "Ҳама дуруст аст?"), sub: tx("Скажет, если ничего не сломано", "Tells you if nothing is broken", "Мегӯяд, агар чизе вайрон набошад") },
    { icon: Users, title: tx("Нужный мастер", "The right master", "Устои лозимӣ"), sub: tx("Подберёт категорию специалиста", "Picks the specialist category", "Категорияи мутахассисро интихоб мекунад") },
    { icon: Wallet, title: tx("Примерная цена", "Estimated price", "Нархи тахминӣ"), sub: tx("Подскажет бюджет заранее", "Gives a budget in advance", "Буҷетро пешакӣ мегӯяд") },
  ];

  const photoBox = (size: string) =>
    preview && <img src={preview} alt="" className={`${size} rounded-2xl object-cover`} />;

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950">
      <style>{`@keyframes ai-scan{0%{top:6%}50%{top:90%}100%{top:6%}}@keyframes ai-bar{0%{left:-40%}100%{left:100%}}`}</style>
      <Header />
      <main className="mx-auto w-full max-w-2xl px-4 py-6 md:py-10">
        {/* Шапка как в приложении */}
        <div className="mb-5 flex items-center gap-2">
          <button
            onClick={() => (step === "pick" && !preview ? navigate(-1) : reset())}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Назад"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-black text-slate-900 dark:text-white">{tx("ИИ-диагностика", "AI diagnostics", "Ташхиси AI")}</h1>
          <span className={`ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white ${AI_GRADIENT}`}>
            <Sparkles className="h-3 w-3" /> AI
          </span>
        </div>

        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
        <input ref={galleryRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />

        {/* 1. Начало: фото ещё нет */}
        {!preview && step !== "error" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className={`relative overflow-hidden rounded-[28px] p-6 text-white shadow-2xl shadow-violet-500/30 sm:p-8 ${AI_GRADIENT}`}>
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
              <ScanEye className="relative h-10 w-10" />
              <h2 className="relative mt-4 text-2xl font-black leading-tight sm:text-3xl">
                {tx("Сфотографируйте проблему —", "Take a photo of the problem —", "Мушкилро акс гиред —")}
                <br />
                {tx("ИИ подскажет решение", "AI will suggest a solution", "AI роҳи ҳалро мегӯяд")}
              </h2>
              <p className="relative mt-2 text-sm leading-relaxed text-white/90 sm:text-base">
                {tx(
                  "Трещина, протечка, сгоревшая розетка — ИИ посмотрит на фото, скажет, что сломано и какой мастер нужен. А если всё целое — так и скажет.",
                  "Crack, leak, burnt socket — AI looks at the photo and tells you what is broken and which master you need. If everything is fine, it says so.",
                  "Тарқиш, обравӣ, розеткаи сӯхта — AI аксро дида мегӯяд, ки чӣ вайрон аст ва кадом усто лозим. Агар ҳама дуруст бошад — ҳаминро мегӯяд.",
                )}
              </p>
            </div>

            <h3 className="mb-3 mt-7 text-base font-black text-slate-900 dark:text-white">{tx("Что определит ИИ:", "What AI will check:", "AI чиро муайян мекунад:")}</h3>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-900">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{f.title}</p>
                    <p className="text-xs text-slate-500">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 space-y-3">
              <button
                onClick={() => cameraRef.current?.click()}
                className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-black text-white shadow-xl shadow-violet-500/30 transition-transform hover:-translate-y-0.5 active:scale-[0.99] ${AI_GRADIENT}`}
              >
                <Camera className="h-5 w-5" /> {tx("Сфотографировать", "Take a photo", "Акс гирифтан")}
              </button>
              <button
                onClick={() => galleryRef.current?.click()}
                className="flex h-13 min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-[15px] font-semibold text-slate-800 transition-colors hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <ImageIcon className="h-5 w-5" /> {tx("Выбрать из галереи", "Choose from gallery", "Аз галерея интихоб кардан")}
              </button>
            </div>
          </motion.div>
        )}

        {/* 2. Фото выбрано: комментарий и запуск */}
        {preview && step === "pick" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="overflow-hidden rounded-[28px] bg-white p-2 shadow-sm dark:bg-slate-900">
              <img src={preview} alt="" className="max-h-[420px] w-full rounded-[22px] object-contain" />
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              rows={2}
              placeholder={tx("Коротко опишите проблему (необязательно): «течёт под раковиной», «не включается»…", "Briefly describe the problem (optional): “leaking under the sink”, “won't turn on”…", "Мушкилро кӯтоҳ нависед (ихтиёрӣ)…")}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none transition-all placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <button
              onClick={analyze}
              className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-black text-white shadow-xl shadow-violet-500/30 transition-transform hover:-translate-y-0.5 ${AI_GRADIENT}`}
            >
              <Sparkles className="h-5 w-5" /> {tx("Определить проблему", "Analyse the photo", "Мушкилро муайян кардан")}
            </button>
            <button onClick={reset} className="flex w-full items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800">
              <RotateCcw className="h-4 w-4" /> {tx("Другое фото", "Another photo", "Акси дигар")}
            </button>
          </motion.div>
        )}

        {/* 3. Анализ: сканирующая линия как в приложении */}
        {step === "analyzing" && preview && (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="relative h-72 w-72 overflow-hidden rounded-3xl ring-2 ring-violet-400/60 sm:h-80 sm:w-80">
              <img src={preview} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-violet-900/10" />
              <div
                className="absolute left-0 h-[3px] w-full bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_14px_4px_rgba(110,231,183,0.6)]"
                style={{ animation: "ai-scan 1.6s ease-in-out infinite" }}
              />
            </div>
            <p className="mt-8 text-xl font-black text-slate-900 dark:text-white">{tx("ИИ анализирует фото…", "AI is analysing the photo…", "AI аксро таҳлил мекунад…")}</p>
            <p className="mt-1 text-sm text-slate-500">{tx("Ищем признаки поломки и подбираем мастера", "Looking for damage and the right master", "Нишонаҳои вайрониро меҷӯем")}</p>
            <div className="relative mt-6 h-1 w-52 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="absolute h-full w-2/5 rounded-full bg-violet-500" style={{ animation: "ai-bar 1.1s linear infinite" }} />
            </div>
          </div>
        )}

        {/* 4a. Найдена поломка */}
        {step === "result" && result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
              {photoBox("h-20 w-20 shrink-0")}
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[13px] font-bold text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> {tx("Анализ готов", "Analysis ready", "Таҳлил тайёр")}
                </p>
                <h2 className="mt-0.5 text-lg font-black leading-tight text-slate-900 dark:text-white sm:text-xl">{result.problem}</h2>
              </div>
            </div>
            {result.details && <p className="px-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{result.details}</p>}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-500/10"><Gauge className="h-5 w-5" /></div>
                <p className="mt-2 text-xs text-slate-500">{tx("Срочность", "Urgency", "Фаврият")}</p>
                {result.urgency && (
                  <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-sm font-black ${URGENCY[result.urgency].cls}`}>
                    {tx(URGENCY[result.urgency].ru, URGENCY[result.urgency].en, URGENCY[result.urgency].tj)}
                  </span>
                )}
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10"><Wrench className="h-5 w-5" /></div>
                <p className="mt-2 text-xs text-slate-500">{tx("Мастер", "Master", "Усто")}</p>
                <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">{result.category}</p>
              </div>
            </div>

            {result.priceMin != null && result.priceMax != null && (
              <div className="flex items-center gap-4 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-5 text-white shadow-xl shadow-emerald-600/25">
                <Wallet className="h-8 w-8 shrink-0" />
                <div>
                  <p className="text-sm text-white/90">{tx("Примерная стоимость", "Estimated cost", "Нархи тахминӣ")}</p>
                  <p className="text-2xl font-black">{result.priceMin}–{result.priceMax} {tx("сомони", "TJS", "сомонӣ")}</p>
                </div>
              </div>
            )}

            {result.advice && (
              <div className="flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">
                <Lightbulb className="h-5 w-5 shrink-0 text-amber-500" /> {result.advice}
              </div>
            )}

            {result.urgency === "high" && (
              <Link to="/sos" className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 py-3.5 font-black text-white hover:bg-red-700">
                <Siren className="h-5 w-5" /> {tx("Срочная проблема — открыть SOS", "Urgent — open SOS", "Фаврӣ — SOS кушодан")}
              </Link>
            )}

            <p className="px-1 pt-1 text-[15px] font-black text-slate-900 dark:text-white">{tx("Рекомендуемый мастер:", "Recommended master:", "Устои тавсияшуда:")}</p>
            <button
              onClick={() => findMasters(result.category || "Другие услуги")}
              className="flex w-full items-center gap-3 rounded-2xl border border-emerald-200 bg-white p-4 text-left transition-colors hover:border-emerald-400 dark:border-emerald-500/30 dark:bg-slate-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10"><Users className="h-6 w-6" /></div>
              <div className="flex-1">
                <p className="font-black text-slate-900 dark:text-white">{result.category}</p>
                <p className="text-xs text-slate-500">{tx("Проверенные мастера в Душанбе", "Verified masters in Dushanbe", "Устоҳои санҷидашуда дар Душанбе")}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </button>

            <button
              onClick={() => findMasters(result.category || "Другие услуги")}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-base font-black text-white shadow-xl shadow-emerald-600/25"
            >
              <Search className="h-5 w-5" /> {tx("Найти мастера", "Find a master", "Усто ёфтан")}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <a href={`tel:${SUPPORT_PHONE}`} className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <Phone className="h-4 w-4" /> {tx("Позвонить", "Call", "Занг задан")}
              </a>
              <button onClick={reset} className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <Camera className="h-4 w-4" /> {tx("Новое фото", "New photo", "Акси нав")}
              </button>
            </div>
            <p className="text-center text-xs text-slate-400">{tx("Оценка ИИ примерная — точную цену назовёт мастер после осмотра.", "AI estimate is approximate — the master gives the exact price after inspection.", "Арзёбии AI тахминӣ аст — нархи аниқро усто мегӯяд.")}</p>
          </motion.div>
        )}

        {/* 4b. Ничего не сломано */}
        {step === "ok" && result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center">
            {photoBox("h-56 w-56")}
            <div className="relative mt-6">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/30">
                <CheckCircle2 className="h-10 w-10" />
              </div>
            </div>
            <h2 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">{result.problem || tx("Ничего не сломано", "Nothing is broken", "Ҳеҷ чиз вайрон нест")}</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300">{result.details}</p>
            <p className="mt-3 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              {tx("Мастер не нужен", "No master needed", "Усто лозим нест")}
            </p>
            {result.advice && (
              <div className="mt-5 flex w-full gap-3 rounded-2xl bg-white p-4 text-left text-sm text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                <Lightbulb className="h-5 w-5 shrink-0 text-amber-500" /> {result.advice}
              </div>
            )}
            <p className="mt-4 text-xs text-slate-400">
              {tx("Проблема всё же есть (не включается, шумит, капает)? Опишите её и проверьте ещё раз.", "Still a problem (won't turn on, noisy, dripping)? Describe it and check again.", "Мушкил ҳаст? Онро нависед ва аз нав санҷед.")}
            </p>
            <div className="mt-5 w-full space-y-3">
              <button onClick={() => setStep("pick")} className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-black text-white shadow-xl shadow-violet-500/30 ${AI_GRADIENT}`}>
                <Sparkles className="h-5 w-5" /> {tx("Описать проблему и проверить", "Describe and check again", "Нависед ва аз нав санҷед")}
              </button>
              <button onClick={reset} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <Camera className="h-4 w-4" /> {tx("Другое фото", "Another photo", "Акси дигар")}
              </button>
            </div>
          </motion.div>
        )}

        {/* 4c. Не опознано / ИИ не подключён */}
        {step === "manual" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center">
            {photoBox("h-52 w-52")}
            <div className="mt-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10">
              <XCircle className="h-9 w-9" />
            </div>
            <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
              {result ? tx("Не опознано", "Not recognised", "Шинохта нашуд") : tx("ИИ временно недоступен", "AI is temporarily unavailable", "AI муваққатан дастрас нест")}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {result?.details || tx("Сфотографируйте поломку ближе и при хорошем свете — или выберите мастера сами:", "Take a closer photo in good light — or choose a master yourself:", "Аксро наздиктар ва дар рӯшноӣ гиред — ё усторо худатон интихоб кунед:")}
            </p>
            <button onClick={reset} className={`mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-black text-white shadow-xl shadow-violet-500/30 ${AI_GRADIENT}`}>
              <Camera className="h-5 w-5" /> {tx("Сфотографировать заново", "Take another photo", "Аз нав акс гирифтан")}
            </button>
            <p className="mb-3 mt-7 text-sm font-black text-slate-900 dark:text-white">{tx("Или выберите мастера:", "Or choose a master:", "Ё усторо интихоб кунед:")}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {PHOTO_CATEGORIES.map((c) => (
                <button key={c} onClick={() => findMasters(c)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  {c}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Ошибка */}
        {step === "error" && (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10">
              <AlertTriangle className="h-9 w-9" />
            </div>
            <p className="mt-4 max-w-md font-bold text-slate-900 dark:text-white">{errorText || tx("Что-то пошло не так", "Something went wrong", "Хатое рух дод")}</p>
            <button onClick={reset} className={`mt-6 flex h-12 items-center justify-center gap-2 rounded-2xl px-8 font-black text-white ${AI_GRADIENT}`}>
              <RotateCcw className="h-4 w-4" /> {tx("Попробовать снова", "Try again", "Аз нав кӯшиш кунед")}
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
