import { supabase } from "@/integrations/supabase/client";

// Отправка формы «Напишите нам» с вложениями.
const sb = supabase as any;
export const CONTACT_MAX_FILES = 5;
export const CONTACT_MAX_SIZE = 20 * 1024 * 1024; // 20 МБ
export const CONTACT_ACCEPT =
  "image/*,video/mp4,video/quicktime,video/webm,video/3gpp,application/pdf,text/plain,.doc,.docx,.xls,.xlsx";

const safeName = (name: string) => {
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot).toLowerCase().replace(/[^a-z0-9.]/g, "") : "";
  const base = (dot > 0 ? name.slice(0, dot) : name).replace(/[^\p{L}\p{N}_-]+/gu, "_").slice(0, 40) || "file";
  return `${base}${ext}`;
};

export async function sendContactMessage(
  data: { name: string; phone: string; email: string; message: string },
  files: File[],
  onProgress?: (done: number, total: number) => void,
) {
  const folder = `contact/${crypto.randomUUID()}`;
  const paths: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const path = `${folder}/${i + 1}-${safeName(f.name)}`;
    const { error } = await sb.storage.from("contact-attachments").upload(path, f, { contentType: f.type || undefined });
    if (error) throw new Error(`Файл «${f.name}» не загрузился: ${error.message}`);
    paths.push(path);
    onProgress?.(i + 1, files.length);
  }
  const { error } = await sb.rpc("submit_contact_message", {
    p_name: data.name, p_phone: data.phone, p_email: data.email, p_message: data.message, p_attachments: paths,
  });
  if (error) throw new Error(error.message);
}

export const formatSize = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} КБ` : `${(b / 1024 / 1024).toFixed(1)} МБ`);
