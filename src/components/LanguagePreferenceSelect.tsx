import { Languages } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { isLanguage } from "@/lib/i18n";

interface LanguagePreferenceSelectProps {
  className?: string;
}

export default function LanguagePreferenceSelect({
  className,
}: LanguagePreferenceSelectProps) {
  const { language, languageOptions, setLanguage, t } = useLanguage();

  return (
    <div className={className}>
      <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
        {t("languagePreferenceLabel")}
      </label>
      <Select
        value={language}
        onValueChange={(value) => {
          if (isLanguage(value)) {
            setLanguage(value);
          }
        }}
      >
        <SelectTrigger className="h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languageOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-muted-foreground" />
                <span>
                  {option.value === "ru"
                    ? t("languageOptionRu")
                    : option.value === "tj"
                      ? t("languageOptionTj")
                      : t("languageOptionEn")}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-2">
        {t("languagePreferenceHint")}
      </p>
    </div>
  );
}
