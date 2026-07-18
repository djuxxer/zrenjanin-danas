-- =============================================
-- Dodaje kolonu za izvor naslovne slike (npr. "Unsplash", "Redakcija", ime fotografa).
-- Pokreni ovo u Supabase SQL Editoru NAKON prethodnih migracija.
-- =============================================

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS image_source TEXT;
