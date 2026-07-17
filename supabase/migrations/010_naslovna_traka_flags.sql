-- =============================================
-- Zamena starog sistema oznaka (breaking/featured/trending)
-- novim: naslovna_velika, naslovna_mala, traka_gore.
-- "Popularno" ubuduce ide isključivo po pravim pregledima (views),
-- bez ručne oznake.
-- Pokreni ovo u Supabase SQL Editoru NAKON prethodnih migracija.
-- =============================================

-- 1) Dodaj nove kolone
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS naslovna_velika BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS naslovna_mala BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS traka_gore BOOLEAN NOT NULL DEFAULT FALSE;

-- 2) Prebaci postojece podatke iz starih kolona u nove
--    (featured -> naslovna_mala, breaking -> traka_gore; "trending" se ne prenosi,
--    Popularno sekcija sad radi isključivo po pravim pregledima)
UPDATE public.articles SET naslovna_mala = featured WHERE featured = true;
UPDATE public.articles SET traka_gore = breaking WHERE breaking = true;

-- 3) Postavi JEDNU vest (najgledaniju medju "naslovna_mala") kao naslovna_velika,
--    da naslovna strana ima glavnu (veliku) vest odmah nakon migracije.
UPDATE public.articles
SET naslovna_velika = true
WHERE id = (
  SELECT id FROM public.articles
  WHERE naslovna_mala = true AND published = true
  ORDER BY views DESC
  LIMIT 1
);

-- 4) Ukloni stare kolone
ALTER TABLE public.articles
  DROP COLUMN IF EXISTS breaking,
  DROP COLUMN IF EXISTS featured,
  DROP COLUMN IF EXISTS trending;
