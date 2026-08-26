import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationParams } from "@/lib/i18n";

interface Props {
  master: any;
}

// Блок "О мастере" показывает биографию специалиста или генерирует описание по его данным.
export default function MasterAbout({ master }: Props) {
  const { t } = useLanguage();
  const bio = master.bio || buildBio(master, t);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <Card className="hover-soft hover-glow">
        <CardContent className="p-5 sm:p-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-primary" /> {t("mpAboutTitle")}
          </h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{bio}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Если мастер не заполнил описание, собираем его из данных профиля на языке интерфейса.
function buildBio(master: any, t: (key: string, params?: TranslationParams) => string): string {
  return t("mpBio", {
    name: master.full_name?.split(" ")[0] || "",
    cats: master.service_categories?.join(", ") || "",
    years: master.experience_years || 3,
    districts: master.working_districts?.join(", ") || "Душанбе",
  });
}
