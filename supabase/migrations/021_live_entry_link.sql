-- Opcioni link "Procitaj vise" uz svaku objavu u Uzivo prenosu
-- (vodi na vest sa Zrenjanin Danas ili na drugi sajt).
-- Pokreni u Supabase SQL Editoru PRE primene koda.

ALTER TABLE public.live_entries
  ADD COLUMN IF NOT EXISTS link_url TEXT,
  ADD COLUMN IF NOT EXISTS link_label TEXT;

NOTIFY pgrst, 'reload schema';
