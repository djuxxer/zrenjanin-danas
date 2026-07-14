-- =============================================
-- Brojanje pregleda vesti
-- SECURITY DEFINER funkcija zaobilazi RLS na kontrolisan način:
-- samo uvećava views i beleži red u article_views, ništa drugo.
-- Pokreni ovo u Supabase SQL Editoru NAKON prethodnih migracija.
-- =============================================

CREATE OR REPLACE FUNCTION public.increment_article_views(
  p_article_id UUID,
  p_ip_hash TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE public.articles
  SET views = views + 1
  WHERE id = p_article_id AND published = true;

  INSERT INTO public.article_views (article_id, ip_hash, user_agent)
  VALUES (p_article_id, p_ip_hash, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Anonimni posetioci i ulogovani korisnici smeju da pozovu OVU funkciju
-- (ali i dalje ne mogu direktno da menjaju articles.views zahvaljujući RLS)
GRANT EXECUTE ON FUNCTION public.increment_article_views(UUID, TEXT, TEXT) TO anon, authenticated;
