-- Create Supabase Storage bucket for WhatsApp media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'whatsapp-media',
  'whatsapp-media',
  true,
  52428800, -- 50MB limit
  ARRAY['image/*', 'video/*', 'audio/*', 'application/*']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'whatsapp-media' );

-- Allow authenticated users to upload
CREATE POLICY IF NOT EXISTS "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'whatsapp-media' );

-- Allow authenticated users to update their uploads
CREATE POLICY IF NOT EXISTS "Authenticated users can update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'whatsapp-media' );

-- Add mediaUrl column to Message table if it doesn't exist
ALTER TABLE evolution_api."Message"
ADD COLUMN IF NOT EXISTS "mediaUrl" TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "idx_message_media_url" 
ON evolution_api."Message"("mediaUrl");
