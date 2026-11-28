CREATE TABLE public.hotmart_events (
  transaction text NOT NULL,
  event text NOT NULL,
  event_id text,
  email text NOT NULL,
  action text NOT NULL CHECK (action IN ('activate','deactivate')),
  occurred_at timestamptz NOT NULL,
  premium_until timestamptz,
  outcome text NOT NULL CHECK (outcome IN ('activated','deactivated','pending','stale')),
  received_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (transaction, event)
);
GRANT ALL ON public.hotmart_events TO service_role;
REVOKE ALL ON public.hotmart_events FROM anon, authenticated;
ALTER TABLE public.hotmart_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX hotmart_events_email_time ON public.hotmart_events (email, occurred_at DESC);

REVOKE UPDATE ON public.profiles FROM anon, authenticated;
REVOKE UPDATE (id, email, is_premium, premium_until, created_at) ON public.profiles FROM anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (display_name) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles, public.pending_premium TO service_role;

CREATE OR REPLACE FUNCTION public.apply_pending_premium(_user_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE p public.pending_premium%ROWTYPE; e text;
BEGIN
  SELECT lower(btrim(email)) INTO e FROM auth.users WHERE id = _user_id;
  IF e IS NULL THEN RETURN false; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(e, 7101));
  SELECT * INTO p FROM public.pending_premium WHERE lower(btrim(email)) = e ORDER BY updated_at DESC LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  UPDATE public.profiles SET is_premium = p.is_premium, premium_until = p.premium_until WHERE id = _user_id;
  IF NOT FOUND THEN RETURN false; END IF;
  DELETE FROM public.pending_premium WHERE lower(btrim(email)) = e;
  UPDATE public.hotmart_events SET outcome = CASE WHEN action = 'activate' THEN 'activated' ELSE 'deactivated' END WHERE email = e AND outcome = 'pending';
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.apply_pending_premium(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_pending_premium(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.link_profile_premium()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM public.apply_pending_premium(NEW.id);
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.link_profile_premium() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER link_profile_premium AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.link_profile_premium();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, lower(btrim(NEW.email)), coalesce(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.reconcile_my_premium()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email_confirmed_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN public.apply_pending_premium(auth.uid());
END $$;
REVOKE ALL ON FUNCTION public.reconcile_my_premium() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reconcile_my_premium() TO authenticated;

CREATE OR REPLACE FUNCTION public.process_hotmart_event(
  _transaction text, _event text, _event_id text, _email text,
  _status text, _offer text, _occurred_at timestamptz, _approved_at timestamptz
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  e text := lower(btrim(_email)); a text; u uuid; expiry timestamptz;
  previous public.hotmart_events%ROWTYPE; result text; latest timestamptz; days integer;
BEGIN
  IF length(_transaction) NOT BETWEEN 1 AND 100 OR length(e) NOT BETWEEN 3 AND 255 OR _occurred_at IS NULL OR _occurred_at > now() + interval '5 minutes' THEN RAISE EXCEPTION 'Invalid event'; END IF;
  IF _event IN ('PURCHASE_APPROVED','PURCHASE_COMPLETE') THEN
    IF _status NOT IN ('APPROVED','COMPLETE') OR _status IS NULL THEN RAISE EXCEPTION 'Purchase not approved'; END IF;
    IF _offer = 'i1qgmmj1' THEN days := 35; ELSIF _offer = 'gjv109ka' THEN days := 370; ELSE RAISE EXCEPTION 'Unknown offer'; END IF;
    IF _approved_at IS NULL OR _approved_at > now() + interval '5 minutes' THEN RAISE EXCEPTION 'Invalid approval date'; END IF;
    a := 'activate'; expiry := _approved_at + make_interval(days => days);
  ELSIF _event IN ('PURCHASE_REFUNDED','PURCHASE_CHARGEBACK','PURCHASE_PROTEST','PURCHASE_EXPIRED') THEN a := 'deactivate';
  ELSE RAISE EXCEPTION 'Unsupported event'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(e, 7101));
  SELECT * INTO previous FROM public.hotmart_events WHERE transaction = _transaction AND event = _event;
  IF FOUND THEN
    IF previous.email <> e THEN RAISE EXCEPTION 'Transaction email mismatch'; END IF;
    RETURN jsonb_build_object('status','duplicate','original_status',previous.outcome,'premium_until',previous.premium_until);
  END IF;
  IF EXISTS (SELECT 1 FROM public.hotmart_events WHERE transaction = _transaction AND email <> e) THEN RAISE EXCEPTION 'Transaction email mismatch'; END IF;
  IF a = 'activate' THEN
    SELECT * INTO previous FROM public.hotmart_events WHERE transaction = _transaction AND action = 'activate' ORDER BY occurred_at LIMIT 1;
    IF FOUND THEN expiry := previous.premium_until; END IF;
  END IF;
  SELECT greatest(
    (SELECT max(occurred_at) FROM public.hotmart_events WHERE email = e AND outcome <> 'stale'),
    (SELECT max(updated_at) FROM public.pending_premium WHERE lower(btrim(email)) = e)
  ) INTO latest;
  IF (_occurred_at < latest) OR (a = 'activate' AND EXISTS (SELECT 1 FROM public.hotmart_events WHERE transaction = _transaction AND action = 'deactivate')) THEN
    result := 'stale';
  ELSE
    SELECT id INTO u FROM auth.users WHERE lower(btrim(email)) = e LIMIT 1;
    IF u IS NOT NULL THEN PERFORM public.apply_pending_premium(u); END IF;
    UPDATE public.profiles SET is_premium = (a = 'activate'), premium_until = expiry WHERE id = u;
    IF FOUND THEN
      result := CASE WHEN a = 'activate' THEN 'activated' ELSE 'deactivated' END;
      DELETE FROM public.pending_premium WHERE lower(btrim(email)) = e;
    ELSE
      INSERT INTO public.pending_premium (email,is_premium,premium_until,event,updated_at)
      VALUES (e,a = 'activate',expiry,_event,_occurred_at)
      ON CONFLICT (email) DO UPDATE SET is_premium = EXCLUDED.is_premium, premium_until = EXCLUDED.premium_until, event = EXCLUDED.event, updated_at = EXCLUDED.updated_at;
      result := 'pending';
    END IF;
  END IF;
  INSERT INTO public.hotmart_events (transaction,event,event_id,email,action,occurred_at,premium_until,outcome)
  VALUES (_transaction,_event,_event_id,e,a,_occurred_at,expiry,result);
  RETURN jsonb_build_object('status',result,'premium_until',expiry);
END $$;
REVOKE ALL ON FUNCTION public.process_hotmart_event(text,text,text,text,text,text,timestamptz,timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_hotmart_event(text,text,text,text,text,text,timestamptz,timestamptz) TO service_role;

DO $$ DECLARE u uuid; BEGIN
  FOR u IN SELECT p.id FROM public.profiles p JOIN auth.users a ON a.id = p.id WHERE EXISTS (SELECT 1 FROM public.pending_premium pp WHERE lower(btrim(pp.email)) = lower(btrim(a.email))) LOOP
    PERFORM public.apply_pending_premium(u);
  END LOOP;
END $$;