ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_language text;

UPDATE public.profiles
SET preferred_language = 'ru'
WHERE preferred_language IS NULL;

ALTER TABLE public.profiles
ALTER COLUMN preferred_language SET DEFAULT 'ru',
ALTER COLUMN preferred_language SET NOT NULL;

ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_preferred_language_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_preferred_language_check
CHECK (preferred_language IN ('ru', 'tj', 'en'));

ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS title_key text,
ADD COLUMN IF NOT EXISTS message_key text,
ADD COLUMN IF NOT EXISTS payload jsonb;

CREATE OR REPLACE FUNCTION public.set_user_language_preference(p_language text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
  current_full_name text;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_language NOT IN ('ru', 'tj', 'en') THEN
    RAISE EXCEPTION 'Unsupported language: %', p_language;
  END IF;

  SELECT full_name
  INTO current_full_name
  FROM public.profiles
  WHERE user_id = current_user_id;

  IF current_full_name IS NULL THEN
    current_full_name := COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'full_name',
      split_part(COALESCE(auth.jwt() ->> 'email', ''), '@', 1),
      'Пользователь'
    );

    INSERT INTO public.profiles (user_id, full_name, preferred_language)
    VALUES (current_user_id, current_full_name, p_language)
    ON CONFLICT (user_id) DO UPDATE
    SET preferred_language = EXCLUDED.preferred_language;
  ELSE
    UPDATE public.profiles
    SET preferred_language = p_language
    WHERE user_id = current_user_id;
  END IF;

  RETURN p_language;
END;
$$;

REVOKE ALL ON FUNCTION public.set_user_language_preference(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_user_language_preference(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.shop_order_notification_key(input_status text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE input_status
    WHEN 'pending' THEN 'notifShopOrderPendingMessage'
    WHEN 'confirmed' THEN 'notifShopOrderConfirmedMessage'
    WHEN 'processing' THEN 'notifShopOrderProcessingMessage'
    WHEN 'shipped' THEN 'notifShopOrderShippedMessage'
    WHEN 'delivered' THEN 'notifShopOrderDeliveredMessage'
    WHEN 'completed' THEN 'notifShopOrderCompletedMessage'
    WHEN 'cancelled' THEN 'notifShopOrderCancelledMessage'
    ELSE 'notifShopOrderStatusUpdatedTitle'
  END;
$$;

CREATE OR REPLACE FUNCTION public.shop_payment_title_key(input_status text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE input_status
    WHEN 'paid' THEN 'notifShopPaymentPaidTitle'
    WHEN 'pending' THEN 'notifShopPaymentPendingTitle'
    WHEN 'failed' THEN 'notifShopPaymentFailedTitle'
    ELSE 'notifShopPaymentPendingTitle'
  END;
$$;

CREATE OR REPLACE FUNCTION public.shop_payment_message_key(input_status text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE input_status
    WHEN 'paid' THEN 'notifShopPaymentPaidMessage'
    WHEN 'pending' THEN 'notifShopPaymentPendingMessage'
    WHEN 'failed' THEN 'notifShopPaymentFailedMessage'
    ELSE 'notifShopPaymentPendingMessage'
  END;
$$;

CREATE OR REPLACE FUNCTION public.notify_admins()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_record RECORD;
  notif_title text;
  notif_message text;
  notif_type text;
  notif_related_id uuid;
  notif_title_key text;
  notif_message_key text;
  notif_payload jsonb;
BEGIN
  IF to_regclass('public.notifications') IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'profiles' THEN
    notif_title := 'Новый пользователь';
    notif_message := 'Зарегистрировался новый пользователь: ' || COALESCE(NEW.full_name, 'Без имени');
    notif_type := 'new_user';
    notif_related_id := NEW.id;
    notif_title_key := 'notifNewUserTitle';
    notif_message_key := 'notifNewUserMessage';
    notif_payload := jsonb_build_object('fullName', COALESCE(NEW.full_name, 'Без имени'));
  ELSIF TG_TABLE_NAME = 'master_applications' THEN
    notif_title := 'Новая заявка мастера';
    notif_message := 'Получена заявка от ' || COALESCE(NEW.full_name, 'Без имени') || ' (' || COALESCE(NEW.specialization, '') || ')';
    notif_type := 'new_application';
    notif_related_id := NEW.id;
    notif_title_key := 'notifNewApplicationTitle';
    notif_message_key := 'notifNewApplicationMessage';
    notif_payload := jsonb_build_object(
      'fullName', COALESCE(NEW.full_name, 'Без имени'),
      'specialization', COALESCE(NEW.specialization, '')
    );
  ELSIF TG_TABLE_NAME = 'orders' THEN
    notif_title := 'Новый заказ';
    notif_message := 'Создан новый заказ по адресу: ' || COALESCE(NEW.address, '—');
    notif_type := 'new_order';
    notif_related_id := NEW.id;
    notif_title_key := 'notifAdminNewOrderTitle';
    notif_message_key := 'notifAdminNewOrderMessage';
    notif_payload := jsonb_build_object('address', COALESCE(NEW.address, '—'));
  ELSIF TG_TABLE_NAME = 'reviews' THEN
    notif_title := 'Новый отзыв';
    notif_message := 'Получен новый отзыв с оценкой ' || NEW.rating || '/5';
    notif_type := 'new_review';
    notif_related_id := NEW.id;
    notif_title_key := 'notifAdminReviewTitle';
    notif_message_key := 'notifAdminReviewMessage';
    notif_payload := jsonb_build_object('rating', NEW.rating);
  ELSE
    RETURN NEW;
  END IF;

  FOR admin_record IN
    SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'super_admin')
  LOOP
    BEGIN
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        title_key,
        message_key,
        payload,
        type,
        related_id
      )
      VALUES (
        admin_record.user_id,
        notif_title,
        notif_message,
        notif_title_key,
        notif_message_key,
        notif_payload,
        notif_type,
        notif_related_id
      );
    EXCEPTION
      WHEN OTHERS THEN
        CONTINUE;
    END;
  END LOOP;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_admins_support()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_record RECORD;
BEGIN
  FOR admin_record IN
    SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'super_admin')
  LOOP
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      title_key,
      message_key,
      payload,
      type,
      related_id
    )
    VALUES (
      admin_record.user_id,
      'Новое обращение в поддержку',
      'Получено обращение: ' || COALESCE(NEW.subject, ''),
      'notifSupportTicketTitle',
      'notifSupportTicketMessage',
      jsonb_build_object('subject', COALESCE(NEW.subject, '')),
      'support_ticket',
      NEW.id
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_shop_order_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_record RECORD;
  order_number text;
  payment_title text;
  status_title text;
  status_message_key text;
BEGIN
  order_number := substring(NEW.id::text, 1, 8);

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.shop_order_status_history (order_id, status, note, changed_by)
    VALUES (NEW.id, NEW.status, 'Заказ оформлен клиентом', NEW.user_id);

    FOR admin_record IN
      SELECT user_id
      FROM public.user_roles
      WHERE role IN ('admin', 'super_admin')
    LOOP
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        title_key,
        message_key,
        payload,
        type,
        related_id
      )
      VALUES (
        admin_record.user_id,
        'Новый заказ магазина',
        'Поступил заказ #' || order_number || ' на сумму ' || NEW.total || ' сомонӣ',
        'notifShopOrderAdminTitle',
        'notifShopOrderAdminMessage',
        jsonb_build_object('orderNumber', order_number, 'total', NEW.total),
        'shop_order_admin',
        NEW.id
      );
    END LOOP;

    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      title_key,
      message_key,
      payload,
      type,
      related_id
    )
    VALUES (
      NEW.user_id,
      'Заказ принят',
      'Ваш заказ #' || order_number || ' создан и ожидает подтверждения',
      'notifShopOrderAcceptedTitle',
      'notifShopOrderAcceptedMessage',
      jsonb_build_object('orderNumber', order_number),
      'shop_order',
      NEW.id
    );

    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    status_title := public.shop_order_status_label(NEW.status);
    status_message_key := public.shop_order_notification_key(NEW.status);

    INSERT INTO public.shop_order_status_history (order_id, status, note, changed_by)
    VALUES (NEW.id, NEW.status, status_title, auth.uid());

    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      title_key,
      message_key,
      payload,
      type,
      related_id
    )
    VALUES (
      NEW.user_id,
      'Статус заказа обновлен',
      'Заказ #' || order_number || ': ' || status_title,
      'notifShopOrderStatusUpdatedTitle',
      status_message_key,
      jsonb_build_object('orderNumber', order_number),
      'shop_order',
      NEW.id
    );

    FOR admin_record IN
      SELECT user_id
      FROM public.user_roles
      WHERE role IN ('admin', 'super_admin')
    LOOP
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        title_key,
        message_key,
        payload,
        type,
        related_id
      )
      VALUES (
        admin_record.user_id,
        'Статус заказа изменен',
        'Заказ #' || order_number || ': ' || status_title,
        'notifShopOrderStatusUpdatedTitle',
        status_message_key,
        jsonb_build_object('orderNumber', order_number),
        'shop_order_admin',
        NEW.id
      );
    END LOOP;
  END IF;

  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
    payment_title := CASE NEW.payment_status
      WHEN 'paid' THEN 'Оплата получена'
      WHEN 'pending' THEN 'Ожидается оплата'
      WHEN 'failed' THEN 'Ошибка оплаты'
      ELSE 'Статус оплаты обновлен'
    END;

    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      title_key,
      message_key,
      payload,
      type,
      related_id
    )
    VALUES (
      NEW.user_id,
      payment_title,
      'Заказ #' || order_number || ': ' || payment_title,
      public.shop_payment_title_key(NEW.payment_status),
      public.shop_payment_message_key(NEW.payment_status),
      jsonb_build_object('orderNumber', order_number),
      'shop_payment',
      NEW.id
    );

    FOR admin_record IN
      SELECT user_id
      FROM public.user_roles
      WHERE role IN ('admin', 'super_admin')
    LOOP
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        title_key,
        message_key,
        payload,
        type,
        related_id
      )
      VALUES (
        admin_record.user_id,
        'Оплата заказа обновлена',
        'Заказ #' || order_number || ': ' || payment_title,
        'notifAdminShopPaymentUpdatedTitle',
        public.shop_payment_message_key(NEW.payment_status),
        jsonb_build_object('orderNumber', order_number),
        'shop_payment_admin',
        NEW.id
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;
