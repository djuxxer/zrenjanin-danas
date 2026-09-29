-- Dodaje kolonu za Google Ads conversion tracking (AW-XXXXXXXXX tag)
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS google_ads_id TEXT;

NOTIFY pgrst, 'reload schema';
