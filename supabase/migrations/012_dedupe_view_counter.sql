-- =============================================
-- Sprecava da ista IP adresa uveca brojac pregleda vise puta u kratkom
-- periodu (npr. kad neko otvori istu vest 5 puta za redom, ili test od strane
-- redakcije). Isti pregled sa iste IP adrese za istu vest se ne racuna
-- ponovo unutar 30 minuta.
-- Pokreni ovo u Supabase SQL Editoru NAKON prethodnih migracija.
-- =============================================

CREATE OR REPLACE FUNCTION public.increment_article_views(
  p_article_id UUID,
  p_ip_hash TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_recent_view_exists BOOLEAN;
BEGIN
  -- Proveri da li ista IP adresa vec ima zabelezen pregled ove vesti
  -- u poslednjih 30 minuta
  SELECT EXISTS (
    SELECT 1 FROM public.article_views
    WHERE article_id = p_article_id
      AND ip_hash = p_ip_hash
      AND viewed_at > NOW() - INTERVAL '30 minutes'
  ) INTO v_recent_view_exists;

  IF v_recent_view_exists THEN
    RETURN;
  END IF;

  UPDATE public.articles
  SET views = views + 1
  WHERE id = p_article_id AND published = true;

  INSERT INTO public.article_views (article_id, ip_hash, user_agent)
  VALUES (p_article_id, p_ip_hash, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.increment_article_views(UUID, TEXT, TEXT) TO anon, authenticated;
