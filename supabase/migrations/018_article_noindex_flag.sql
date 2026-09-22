-- =============================================
-- Dodaje "noindex" oznaku za vesti koje su preuzete/prenete od drugih izvora
-- (dogovor sa finansijerima) — vest ostaje potpuno vidljiva na sajtu, ali
-- Google je NE indeksira, cime se izbegava "duplicate content" problem kad
-- jaci portali prenesu istu vest. Niko sa strane ne vidi da je noindex.
-- Pokreni ovo u Supabase SQL Editoru NAKON prethodnih migracija.
-- =============================================

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS noindex BOOLEAN NOT NULL DEFAULT false;
