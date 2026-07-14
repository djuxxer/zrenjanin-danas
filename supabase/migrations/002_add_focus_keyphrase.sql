-- =============================================
-- Dodaje focus_keyphrase kolonu za SEO ocenu
-- Pokreni ovo u Supabase SQL Editoru NAKON 001_initial_schema.sql
-- =============================================

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS focus_keyphrase TEXT;
