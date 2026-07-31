-- =============================================
-- "Kos" (soft-delete) sistem za vesti — brisanje vise ne uklanja vest
-- trajno iz baze, nego je samo oznaci kao obrisanu (i beleze ko i kada).
-- Vest se moze vratiti iz kosa, ili trajno obrisati kasnije.
-- Pokreni ovo u Supabase SQL Editoru NAKON prethodnih migracija.
-- =============================================

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Javna RLS politika za citanje vesti: obrisane vesti se NIKAD ne prikazuju
-- javno, cak i ako bi neko slucajno ostavio published=true.
DROP POLICY IF EXISTS "Published articles are public" ON public.articles;
CREATE POLICY "Published articles are public" ON public.articles
  FOR SELECT USING (
    published = true
    AND (scheduled_at IS NULL OR scheduled_at <= NOW())
    AND deleted_at IS NULL
  );

CREATE INDEX IF NOT EXISTS idx_articles_deleted_at ON public.articles(deleted_at);
