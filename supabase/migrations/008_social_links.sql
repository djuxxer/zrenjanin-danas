-- =============================================
-- Dodaje linkove ka drustvenim mrezama (za Organization schema "sameAs")
-- Pokreni ovo u Supabase SQL Editoru NAKON prethodnih migracija.
-- =============================================

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT;
