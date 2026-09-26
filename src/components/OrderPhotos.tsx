import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Trash2, ImageOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteOrderPhoto, listOrderPhotos, uploadOrderPhoto, type OrderPhoto, type PhotoKind } from "@/lib/orderExtras";

interface Props {
  orderId: string;
  /** Мастер может добавлять фото; клиент и админ только смотрят. */
  canUpload?: boolean;
}

const LABEL: Record<PhotoKind, string> = { before: "До работы", after: "После работы" };

// Фото «до и после»: мастер снимает, клиент видит результат (в том числе из другой страны).
export default function OrderPhotos({ orderId, canUpload = false }: Props) {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<OrderPhoto[] | null>(null);
  const [uploading, setUploading] = useState<PhotoKind | null>(null);
  const [open, setOpen] = useState<OrderPhoto | null>(null);
  const inputs = { before: useRef<HTMLInputElement>(null), after: useRef<HTMLInputElement>(null) };

  const load = () => listOrderPhotos(orderId).then(setPhotos);
  useEffect(() => { void load(); }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onFiles = async (kind: PhotoKind, files: FileList | null) => {
    if (!files?.length) return;
    setUploading(kind);
    try {
      for (const f of Array.from(files).slice(0, 6)) await uploadOrderPhoto(orderId, kind, f);
      toast({ title: "Фото добавлено" });
      await load();
    } catch (e) {
      toast({ title: "Не удалось загрузить фото", description: (e as Error).message, variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const remove = async (p: OrderPhoto) => {
    try {
      await deleteOrderPhoto(p.id);
      setOpen(null);
      await load();
    } catch (e) {
      toast({ title: "Не удалось удалить", description: (e as Error).message, variant: "destructive" });
    }
  };

  if (photos === null) return null; // миграция не применена
  if (!canUpload && photos.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <p className="font-semibold text-foreground">Фото «до и после»</p>
        {(["before", "after"] as PhotoKind[]).map((kind) => {
          const list = photos.filter((p) => p.kind === kind);
          return (
            <div key={kind}>
              <p className="text-xs font-semibold text-muted-foreground mb-2">{LABEL[kind]}</p>
              <div className="flex flex-wrap gap-2">
                {list.map((p) => (
                  <button key={p.id} type="button" onClick={() => setOpen(p)} className="w-20 h-20 rounded-xl overflow-hidden border bg-muted hover:opacity-90">
                    {p.url ? <img src={p.url} alt={LABEL[kind]} className="w-full h-full object-cover" /> : <ImageOff className="w-5 h-5 m-auto text-muted-foreground" />}
                  </button>
                ))}
                {canUpload && (
                  <>
                    <input ref={inputs[kind]} type="file" accept="image/*" capture="environment" multiple className="hidden"
                      onChange={(e) => { void onFiles(kind, e.target.files); e.target.value = ""; }} />
                    <button type="button" onClick={() => inputs[kind].current?.click()} disabled={!!uploading}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-primary/40 text-primary flex flex-col items-center justify-center gap-1 text-[11px] font-semibold hover:bg-primary/5 disabled:opacity-60">
                      {uploading === kind ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                      Добавить
                    </button>
                  </>
                )}
                {!canUpload && list.length === 0 && <p className="text-xs text-muted-foreground">Нет фото</p>}
              </div>
            </div>
          );
        })}
      </CardContent>
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-2xl p-2">
          {open && (
            <div className="space-y-2">
              <img src={open.url} alt="" className="w-full max-h-[75vh] object-contain rounded-lg" />
              <div className="flex items-center justify-between px-2 pb-1">
                <span className="text-sm text-muted-foreground">{LABEL[open.kind]} · {new Date(open.created_at).toLocaleString("ru-RU")}</span>
                {canUpload && (
                  <button type="button" onClick={() => remove(open)} className="text-sm text-destructive inline-flex items-center gap-1"><Trash2 className="w-4 h-4" /> Удалить</button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
