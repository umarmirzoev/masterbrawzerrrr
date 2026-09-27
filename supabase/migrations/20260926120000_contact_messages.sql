-- Форма «Напишите нам» на странице «Контакты»: сообщения с вложениями (фото, видео, документы).

-- Хранилище вложений: до 20 МБ на файл, только безопасные типы.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contact-attachments', 'contact-attachments', false, 20971520,
  ARRAY[
    'image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif',
    'video/mp4','video/quicktime','video/webm','video/3gpp',
    'application/pdf','text/plain',
    'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO UPDATE SET file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Загружать может любой посетитель (форма работает и без входа), только в папку contact/.
DROP POLICY IF EXISTS "Anyone uploads contact attachments" ON storage.objects;
CREATE POLICY "Anyone uploads contact attachments" ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'contact-attachments' AND split_part(name, '/', 1) = 'contact');

-- Смотреть файлы могут только админы.
DROP POLICY IF EXISTS "Admins read contact attachments" ON storage.objects;
CREATE POLICY "Admins read contact attachments" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'contact-attachments' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')));

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  message text NOT NULL,
  attachments text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'done')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage contact messages" ON public.contact_messages;
CREATE POLICY "Admins manage contact messages" ON public.contact_messages FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Отправка сообщения (в т.ч. гостем) + уведомление всем админам.
CREATE OR REPLACE FUNCTION public.submit_contact_message(
  p_name text, p_phone text, p_email text, p_message text, p_attachments text[] DEFAULT '{}'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_files text[];
BEGIN
  IF length(trim(coalesce(p_name, ''))) < 2 OR length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) < 9
     OR length(trim(coalesce(p_message, ''))) < 3 THEN
    RAISE EXCEPTION 'invalid_input';
  END IF;

  -- Принимаем только пути из нашей папки, не больше 5 файлов.
  SELECT coalesce(array_agg(f), '{}') INTO v_files
  FROM (SELECT unnest(coalesce(p_attachments, '{}')) AS f LIMIT 5) t
  WHERE f LIKE 'contact/%';

  INSERT INTO public.contact_messages (user_id, name, phone, email, message, attachments)
  VALUES (auth.uid(), left(trim(p_name), 100), left(trim(p_phone), 30), nullif(left(trim(coalesce(p_email, '')), 120), ''),
          left(trim(p_message), 3000), v_files)
  RETURNING id INTO v_id;

  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  SELECT ur.user_id,
         '✉️ Новое сообщение с сайта',
         left(trim(p_name), 60) || ' • ' || left(trim(p_phone), 30) ||
           CASE WHEN array_length(v_files, 1) > 0 THEN ' • файлов: ' || array_length(v_files, 1) ELSE '' END,
         'contact_message', v_id
  FROM public.user_roles ur
  WHERE ur.role IN ('admin', 'super_admin');

  RETURN v_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.submit_contact_message(text, text, text, text, text[]) TO anon, authenticated;
