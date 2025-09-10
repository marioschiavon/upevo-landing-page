
-- First, drop the existing problematic policy
DROP POLICY IF EXISTS "Organization members can view members" ON public.organization_members;

-- Create simplified RLS policies for organization_members table
CREATE POLICY "Users can view organization members where they are members" 
ON public.organization_members 
FOR SELECT 
USING (
  organization_id IN (
    SELECT om.organization_id 
    FROM public.organization_members om 
    JOIN public.users u ON om.user_id = u.id 
    WHERE u.auth_user_id = auth.uid()
  )
  OR 
  organization_id IN (
    SELECT o.id 
    FROM public.organizations o 
    JOIN public.users u ON o.owner_id = u.id 
    WHERE u.auth_user_id = auth.uid()
  )
);

-- Create policy for INSERT operations
CREATE POLICY "Organization owners can add members" 
ON public.organization_members 
FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT o.id 
    FROM public.organizations o 
    JOIN public.users u ON o.owner_id = u.id 
    WHERE u.auth_user_id = auth.uid()
  )
);

-- Create policy for UPDATE operations
CREATE POLICY "Organization owners can update members" 
ON public.organization_members 
FOR UPDATE 
USING (
  organization_id IN (
    SELECT o.id 
    FROM public.organizations o 
    JOIN public.users u ON o.owner_id = u.id 
    WHERE u.auth_user_id = auth.uid()
  )
);

-- Create policy for DELETE operations
CREATE POLICY "Organization owners can remove members" 
ON public.organization_members 
FOR DELETE 
USING (
  organization_id IN (
    SELECT o.id 
    FROM public.organizations o 
    JOIN public.users u ON o.owner_id = u.id 
    WHERE u.auth_user_id = auth.uid()
  )
);

-- Also fix the organization_members role column constraint
ALTER TABLE public.organization_members 
DROP CONSTRAINT IF EXISTS organization_members_role_check;

ALTER TABLE public.organization_members 
ADD CONSTRAINT organization_members_role_check 
CHECK (role IN ('admin', 'colaborador', 'owner'));
