-- =============================================
-- "UZIVO" (live blog) — izborni dan i slicni dogadjaji.
-- Cetiri tabele:
--   live_blogs    - sam uzivo prenos (naslov, slug, status)
--   live_entries  - objave u feedu (najnovija na vrhu)
--   live_turnout  - izlaznost po satima (za linijski grafikon)
--   live_results  - rezultati po listama (za stubicasti grafikon)
-- Pokreni ovo u Supabase SQL Editoru PRE primene koda.
-- =============================================

CREATE TABLE IF NOT EXISTS public.live_blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'ended')),
  published BOOLEAN NOT NULL DEFAULT false,
  -- Podesavanja prikaza
  turnout_title TEXT NOT NULL DEFAULT 'Izlaznost birača',
  results_title TEXT NOT NULL DEFAULT 'Rezultati',
  results_note TEXT,            -- npr. "Obrađeno 45% biračkih mesta"
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.live_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_id UUID NOT NULL REFERENCES public.live_blogs(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'update' CHECK (kind IN ('update', 'important')),
  title TEXT,
  body TEXT NOT NULL,
  image_url TEXT,
  pinned BOOLEAN NOT NULL DEFAULT false,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.live_turnout (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_id UUID NOT NULL REFERENCES public.live_blogs(id) ON DELETE CASCADE,
  label TEXT NOT NULL,                 -- npr. "12:00"
  sort_order INT NOT NULL DEFAULT 0,   -- redosled na grafikonu
  percent NUMERIC(5,2) NOT NULL CHECK (percent >= 0 AND percent <= 100),
  compare_percent NUMERIC(5,2) CHECK (compare_percent IS NULL OR (compare_percent >= 0 AND compare_percent <= 100)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (blog_id, label)
);

CREATE TABLE IF NOT EXISTS public.live_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_id UUID NOT NULL REFERENCES public.live_blogs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                  -- naziv liste / kandidata
  color TEXT NOT NULL DEFAULT '#0F2A5C',
  percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (percent >= 0 AND percent <= 100),
  votes INT CHECK (votes IS NULL OR votes >= 0),
  seats INT CHECK (seats IS NULL OR seats >= 0),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_entries_blog ON public.live_entries(blog_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_turnout_blog ON public.live_turnout(blog_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_live_results_blog ON public.live_results(blog_id, sort_order);

ALTER TABLE public.live_blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_turnout ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_results ENABLE ROW LEVEL SECURITY;

-- Javnost cita samo objavljene prenose (i njihove podatke)
DROP POLICY IF EXISTS "Published live blogs are public" ON public.live_blogs;
CREATE POLICY "Published live blogs are public" ON public.live_blogs
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Live entries of published blogs are public" ON public.live_entries;
CREATE POLICY "Live entries of published blogs are public" ON public.live_entries
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.live_blogs b WHERE b.id = blog_id AND b.published = true));

DROP POLICY IF EXISTS "Live turnout of published blogs is public" ON public.live_turnout;
CREATE POLICY "Live turnout of published blogs is public" ON public.live_turnout
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.live_blogs b WHERE b.id = blog_id AND b.published = true));

DROP POLICY IF EXISTS "Live results of published blogs are public" ON public.live_results;
CREATE POLICY "Live results of published blogs are public" ON public.live_results
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.live_blogs b WHERE b.id = blog_id AND b.published = true));

-- Prijavljeni clanovi redakcije (svako ko ima profil) mogu sve da citaju i menjaju
DROP POLICY IF EXISTS "Staff manage live blogs" ON public.live_blogs;
CREATE POLICY "Staff manage live blogs" ON public.live_blogs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Staff manage live entries" ON public.live_entries;
CREATE POLICY "Staff manage live entries" ON public.live_entries
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Staff manage live turnout" ON public.live_turnout;
CREATE POLICY "Staff manage live turnout" ON public.live_turnout
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Staff manage live results" ON public.live_results;
CREATE POLICY "Staff manage live results" ON public.live_results
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()));

NOTIFY pgrst, 'reload schema';
