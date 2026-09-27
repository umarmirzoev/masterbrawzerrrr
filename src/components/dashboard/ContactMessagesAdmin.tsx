import { useEffect, useState } from "react";
import { Mail, Paperclip, Phone, Loader2, FileText, Film } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;
const STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "Новое", cls: "bg-emerald-100 text-emerald-700" },
  in_progress: { label: "В работе", cls: "bg-amber-100 text-amber-700" },
  done: { label: "Закрыто", cls: "bg-slate-100 text-slate-600" },
};

// Сообщения из формы «Напишите нам» (страница Контакты) с прикреплёнными файлами.
export default function ContactMessagesAdmin() {
  const [items, setItems] = useState<any[] | null>(null);
  const [links, setLinks] = useState<Record<string, string>>({});

  const load = async () => {
    const { data, error } = await sb.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) { setItems([]); return; }
    setItems(data ?? []);
    const paths: string[] = (data ?? []).flatMap((m: any) => m.attachments ?? []);
    if (paths.length) {
      const { data: signed } = await sb.storage.from("contact-attachments").createSignedUrls(paths, 60 * 60);
      const map: Record<string, string> = {};
      (signed ?? []).forEach((s: any, i: number) => { if (s?.signedUrl) map[paths[i]] = s.signedUrl; });
      setLinks(map);
    }
  };
  useEffect(() => { void load(); }, []);

  const setStatus = async (id: string, status: string) => {
    await sb.from("contact_messages").update({ status }).eq("id", id);
    setItems((prev) => prev?.map((m) => (m.id === id ? { ...m, status } : m)) ?? prev);
  };

  if (items === null) return <div className="py-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  if (!items.length) return <p className="text-sm text-muted-foreground py-4">Сообщений с сайта пока нет.</p>;

  return (
    <div className="space-y-3">
      {items.map((m) => {
        const st = STATUS[m.status] ?? STATUS.new;
        return (
          <Card key={m.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-foreground">{m.name}</p>
                <div className="flex items-center gap-2">
                  <Badge className={st.cls}>{st.label}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("ru-RU")}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1 hover:text-primary"><Phone className="w-3 h-3" /> {m.phone}</a>
                {m.email && <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 hover:text-primary"><Mail className="w-3 h-3" /> {m.email}</a>}
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{m.message}</p>
              {m.attachments?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {m.attachments.map((path: string) => {
                    const url = links[path];
                    const name = path.split("/").pop()?.replace(/^\d+-/, "") ?? "файл";
                    const isImg = /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(path);
                    const isVid = /\.(mp4|mov|webm|3gp)$/i.test(path);
                    return (
                      <a key={path} href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-1.5 pr-3 rounded-lg border bg-muted/40 hover:border-primary/40 text-xs max-w-[220px]">
                        {isImg && url ? <img src={url} alt="" className="w-9 h-9 rounded object-cover" /> : (
                          <span className="w-9 h-9 rounded bg-background flex items-center justify-center text-primary">
                            {isVid ? <Film className="w-4 h-4" /> : isImg ? <Paperclip className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </span>
                        )}
                        <span className="truncate">{name}</span>
                      </a>
                    );
                  })}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                {m.status !== "in_progress" && m.status !== "done" && <Button size="sm" variant="outline" onClick={() => setStatus(m.id, "in_progress")} className="h-8 rounded-full text-xs">Взять в работу</Button>}
                {m.status !== "done" && <Button size="sm" onClick={() => setStatus(m.id, "done")} className="h-8 rounded-full text-xs">Закрыть</Button>}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
