-- =============================================
-- Uklanja "politika" kategoriju. Postojece vesti sa tom kategorijom se
-- bezbedno prebacuju na "zrenjanin" pre nego sto se ogranicenje kolone
-- azurira da vise ne dozvoljava "politika".
-- Pokreni ovo u Supabase SQL Editoru NAKON prethodnih migracija.
-- =============================================

UPDATE public.articles SET category = 'zrenjanin' WHERE category = 'politika';

ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_category_check;
ALTER TABLE public.articles ADD CONSTRAINT articles_category_check
  CHECK (category IN ('drustvo', 'hronika', 'sport', 'kultura', 'ekonomija', 'zrenjanin'));
