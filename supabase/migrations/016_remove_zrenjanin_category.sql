-- =============================================
-- Uklanja "zrenjanin" kategoriju (sve vesti su rucno rasporedjene u prave
-- kategorije pre ove migracije). Bezbednosni UPDATE ispod ne bi trebalo
-- da pogodi nijedan red, ali ostaje kao zastita za svaki slucaj.
-- Pokreni ovo u Supabase SQL Editoru NAKON prethodnih migracija.
-- =============================================

UPDATE public.articles SET category = 'drustvo' WHERE category = 'zrenjanin';

ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_category_check;
ALTER TABLE public.articles ADD CONSTRAINT articles_category_check
  CHECK (category IN ('drustvo', 'hronika', 'sport', 'kultura', 'ekonomija'));
