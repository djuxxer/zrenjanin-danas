-- =============================================
-- Storage bucket za upload slika uz vesti
-- Pokreni ovo u Supabase SQL Editoru NAKON prethodnih migracija.
-- =============================================

-- Kreira javni bucket "article-images" (slike su javno dostupne preko URL-a, upload samo za ulogovane)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-images',
  'article-images',
  true,
  5242880, -- 5MB limit po slici
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Svako može da PROČITA sliku (javne slike na sajtu)
CREATE POLICY "Article images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-images');

-- Samo ulogovani korisnici (novinari/urednici/admin) mogu da otpreme sliku
CREATE POLICY "Authenticated users can upload article images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-images');

-- Ulogovani korisnici mogu da obrišu slike koje su sami otpremili
CREATE POLICY "Users can delete their own uploaded images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'article-images' AND owner = auth.uid());
