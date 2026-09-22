-- =============================================
-- Omogucava bezbednu izmenu slug-a (URL-a) vesti — stari slug se cuva u nizu
-- previous_slugs, pa se posetioci koji dodju na stari link automatski
-- preusmeravaju na novi, umesto da dobiju "stranica nije pronadjena".
-- Pokreni ovo u Supabase SQL Editoru NAKON prethodnih migracija.
-- =============================================

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS previous_slugs TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_articles_previous_slugs ON public.articles USING GIN (previous_slugs);
