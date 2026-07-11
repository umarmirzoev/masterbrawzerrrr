import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { SAFETY_CATEGORIES } from "@/data/safetyContent";
import { askSafetyQuestion, listSafetyQuestions, type SafetyQuestionRecord } from "@/lib/safetyAssistant";
import {
  Bot,
  MessageCircleQuestion,
  ClipboardCheck,
  ShieldAlert,
  Loader2,
  Send,
  ShieldCheck,
} from "lucide-react";

type TabKey = "ai" | "qa" | "checklist" | "mistakes";

export default function SafetyTraining() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<TabKey>("ai");
  const [category, setCategory] = useState<string>("all");

  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiPending, setAiPending] = useState(false);
  const [aiError, setAiError] = useState(false);

  const [qaList, setQaList] = useState<SafetyQuestionRecord[]>([]);
  const [qaLoading, setQaLoading] = useState(false);

  useEffect(() => {
    if (tab !== "qa") return;
    setQaLoading(true);
    listSafetyQuestions(category === "all" ? undefined : category)
      .then(setQaList)
      .finally(() => setQaLoading(false));
  }, [tab, category]);

  const handleAsk = async () => {
    const q = question.trim();
    if (!q || asking) return;
    setAsking(true);
    setAiAnswer(null);
    setAiPending(false);
    setAiError(false);
    const result = await askSafetyQuestion({
      question: q,
      category: category === "all" ? null : category,
    });
    setAsking(false);
    if (!result.success) {
      setAiError(true);
      return;
    }
    if (result.pending) {
      setAiPending(true);
    } else {
      setAiAnswer(result.answer || null);
    }
  };

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "ai", label: t("safetyTabAi"), icon: Bot },
    { key: "qa", label: t("safetyTabQa"), icon: MessageCircleQuestion },
    { key: "checklist", label: t("safetyTabChecklist"), icon: ClipboardCheck },
    { key: "mistakes", label: t("safetyTabMistakes"), icon: ShieldAlert },
  ];

  const activeCategoryContent = SAFETY_CATEGORIES.find((c) => c.id === category);
  const checklistCategories = category === "all" ? SAFETY_CATEGORIES : SAFETY_CATEGORIES.filter((c) => c.id === category);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header />
      <div className="container px-4 mx-auto max-w-5xl py-10 flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-100 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">{t("safetyPageTitle")}</h1>
            <p className="text-sm text-slate-500 font-medium">{t("safetyPageSubtitle")}</p>
          </div>
        </div>

        <div className="mt-4 mb-6 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800 font-medium">
          {t("safetyDisclaimerBanner")}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === key
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100"
                  : "bg-white text-slate-600 border border-slate-100 hover:border-emerald-200 hover:text-emerald-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Category filter (shared across tabs) */}
        <div className="mb-6 max-w-xs">
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t("safetyCategoryLabel")}</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("safetyAllCategories")}</SelectItem>
              {SAFETY_CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* AI Assistant tab */}
        {tab === "ai" && (
          <Card className="rounded-3xl border-slate-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={t("safetyAiPlaceholder")}
                  rows={3}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                />
                <Button
                  onClick={handleAsk}
                  disabled={asking || !question.trim()}
                  className="sm:h-auto h-11 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold gap-2 shrink-0"
                >
                  {asking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {t("safetyAiAskButton")}
                </Button>
              </div>

              {asking && (
                <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> {t("safetyAiThinking")}
                </p>
              )}

              {!asking && aiAnswer && (
                <div className="rounded-2xl bg-emerald-50/60 border border-emerald-100 p-5">
                  <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed mb-3">{aiAnswer}</p>
                  <p className="text-xs text-slate-400 italic">{t("safetyAiDisclaimer")}</p>
                </div>
              )}

              {!asking && aiPending && (
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 text-sm text-slate-600">
                  {t("safetyAiPendingMessage")}
                </div>
              )}

              {!asking && aiError && (
                <div className="rounded-2xl bg-red-50 border border-red-100 p-5 text-sm text-red-600">
                  {t("safetyAiErrorGeneric")}
                </div>
              )}

              {!asking && !aiAnswer && !aiPending && !aiError && (
                <p className="text-sm text-slate-400 text-center py-6">{t("safetyAiEmptyState")}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Q&A tab */}
        {tab === "qa" && (
          <div className="space-y-3">
            {qaLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              </div>
            ) : qaList.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                <MessageCircleQuestion className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium mb-1">{t("safetyQaEmptyState")}</p>
                <p className="text-xs text-slate-400">{t("safetyQaAskCta")}</p>
              </div>
            ) : (
              qaList.map((q) => (
                <Card key={q.id} className="rounded-2xl border-slate-100 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {q.category && (
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {q.category}
                        </Badge>
                      )}
                    </div>
                    <p className="font-bold text-slate-900 text-sm mb-2">{q.question}</p>
                    <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{q.answer}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Checklist tab */}
        {tab === "checklist" && (
          <div className="space-y-6">
            {checklistCategories.map((c) => (
              <Card key={c.id} className="rounded-3xl border-slate-100 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-emerald-500" />
                    {c.name}
                  </h3>
                  <ul className="space-y-2.5">
                    {c.checklist.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold">
                          {i + 1}
                        </span>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Mistakes tab */}
        {tab === "mistakes" && (
          <div className="space-y-6">
            {checklistCategories.map((c) => (
              <Card key={c.id} className="rounded-3xl border-slate-100 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    {c.name}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {c.mistakes.map((m, i) => (
                      <div key={i} className="rounded-2xl bg-red-50/50 border border-red-100 p-4">
                        <p className="font-bold text-slate-900 text-sm mb-1">{m.title}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
