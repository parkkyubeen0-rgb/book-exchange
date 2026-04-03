-- Create storage buckets for covers and ebooks

-- 1. Create covers bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create ebooks bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebooks', 'ebooks', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policies for covers bucket

-- Allow authenticated users to upload covers
CREATE POLICY "covers_insert_authenticated" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'covers');

-- Allow public read access to covers
CREATE POLICY "covers_select_public" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'covers');

-- Allow users to update their own covers
CREATE POLICY "covers_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'covers' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own covers
CREATE POLICY "covers_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'covers' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 4. Storage policies for ebooks bucket

-- Allow authenticated users to upload ebooks
CREATE POLICY "ebooks_insert_authenticated" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ebooks');

-- Allow users to read their own ebooks
CREATE POLICY "ebooks_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'ebooks' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users who completed exchange to read the ebook
-- This is handled at the application level with signed URLs

-- Allow users to update their own ebooks
CREATE POLICY "ebooks_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'ebooks' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own ebooks
CREATE POLICY "ebooks_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'ebooks' AND (storage.foldername(name))[1] = auth.uid()::text);
