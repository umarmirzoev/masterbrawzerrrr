import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { tx } from "@/lib/localizeNames";

interface Props {
  master: any;
}

// Секция районов показывает, где мастер готов выезжать на заказы.
export default function MasterDistricts({ master }: Props) {
  const districts = master.working_districts || [];
  if (districts.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, ease: "easeOut" }}>
      <Card className="group/sec transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-100/50 hover:ring-1 hover:ring-primary/20">
        <CardContent className="p-5 sm:p-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-300 group-hover/sec:-translate-y-1"><MapPin className="w-4 h-4 text-primary" /></span> {tx("Районы работы", "Work districts", "Ноҳияҳои корӣ")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {districts.map((d: string, i: number) => (
              <motion.span key={d} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
              <Badge variant="secondary" className="cursor-default text-sm px-4 py-2 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 hover:text-white hover:shadow-md">
                <MapPin className="w-3 h-3 mr-1.5" /> {d}
              </Badge>
              </motion.span>
            ))}
          </div>

          {/* Map */}
          {master.latitude && master.longitude && (
            <div className="mt-4 rounded-xl overflow-hidden border border-border/50 transition-shadow duration-300 hover:shadow-lg">
              <iframe
                title="Местоположение"
                width="100%"
                height="200"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${master.longitude - 0.02},${master.latitude - 0.015},${master.longitude + 0.02},${master.latitude + 0.015}&layer=mapnik&marker=${master.latitude},${master.longitude}`}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
