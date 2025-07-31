-- Create RLS policies for upevolution storage bucket

-- Policy for viewing project documents (SELECT)
CREATE POLICY "Organization members can view project documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'upevolution' 
  AND (storage.foldername(name))[1] = 'projects'
  AND (storage.foldername(name))[2]::uuid IN (
    SELECT p.id 
    FROM public.projects p
    WHERE p.organization_id IN (
      SELECT om.organization_id
      FROM public.organization_members om
      JOIN public.users u ON om.user_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
  )
);

-- Policy for uploading project documents (INSERT)
CREATE POLICY "Organization members can upload project documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'upevolution' 
  AND (storage.foldername(name))[1] = 'projects'
  AND (storage.foldername(name))[2]::uuid IN (
    SELECT p.id 
    FROM public.projects p
    WHERE p.organization_id IN (
      SELECT om.organization_id
      FROM public.organization_members om
      JOIN public.users u ON om.user_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
  )
);

-- Policy for deleting project documents (DELETE)
CREATE POLICY "Organization owners and uploaders can delete project documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'upevolution' 
  AND (storage.foldername(name))[1] = 'projects'
  AND (
    -- Organization owners can delete
    (storage.foldername(name))[2]::uuid IN (
      SELECT p.id 
      FROM public.projects p
      JOIN public.organizations o ON p.organization_id = o.id
      JOIN public.users u ON o.owner_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
    OR
    -- Document uploaders can delete their own files
    owner = auth.uid()
  )
);