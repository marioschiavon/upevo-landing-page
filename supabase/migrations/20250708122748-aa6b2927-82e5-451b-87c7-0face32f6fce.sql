-- Add logo_url and category fields to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS category TEXT;

-- Create storage bucket for organization logos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('organization-logos', 'organization-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for organization logos
CREATE POLICY "Organization logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'organization-logos');

CREATE POLICY "Authenticated users can upload organization logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'organization-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Organization owners can update their logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'organization-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Organization owners can delete their logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'organization-logos' AND auth.role() = 'authenticated');