-- =============================================
-- Podešavanja portala — jedan red sa opštom konfiguracijom
-- Pokreni ovo u Supabase SQL Editoru NAKON prethodnih migracija.
-- =============================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  site_name TEXT NOT NULL DEFAULT 'Zrenjanin Danas',
  site_url TEXT NOT NULL DEFAULT 'https://zrenjanindanas.rs',
  contact_email TEXT,
  tagline TEXT,
  analytics_id TEXT,
  fb_pixel TEXT,
  comments_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  newsletter_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are publicly readable" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can update settings" ON public.site_settings
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
