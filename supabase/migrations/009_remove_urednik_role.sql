-- =============================================
-- Uklanja "urednik" ulogu — ostaju samo admin i novinar.
-- Pokreni ovo u Supabase SQL Editoru NAKON prethodnih migracija.
-- =============================================

-- 1) Ako slucajno postoji neko sa ulogom 'urednik', prebaci ga na 'novinar'
--    (bezbednosna mera, ne bi trebalo da ima takvih redova, ali za svaki slucaj)
UPDATE public.profiles SET role = 'novinar' WHERE role = 'urednik';

-- 2) Azuriraj CHECK ogranicenje da vise ne dozvoljava 'urednik'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'novinar'));

-- 3) Azuriraj RLS pravila da vise ne pominju 'urednik' (samo 'admin' ostaje povlascen)

DROP POLICY IF EXISTS "Novinari can update own" ON public.articles;
CREATE POLICY "Novinari can update own" ON public.articles
  FOR UPDATE TO authenticated USING (
    auth.uid() = author_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins delete articles" ON public.articles;
CREATE POLICY "Admins delete articles" ON public.articles
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins manage comments" ON public.comments;
CREATE POLICY "Admins manage comments" ON public.comments
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can view analytics" ON public.article_views;
CREATE POLICY "Admins can view analytics" ON public.article_views
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
