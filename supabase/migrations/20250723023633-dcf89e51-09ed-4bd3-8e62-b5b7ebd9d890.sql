
-- Primeiro, criar função security definer para verificar se um usuário é membro de uma organização
CREATE OR REPLACE FUNCTION public.check_user_organization_membership(org_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Verificar se o usuário é owner da organização
  IF EXISTS (
    SELECT 1 FROM public.organizations o
    JOIN public.users u ON o.owner_id = u.id
    WHERE o.id = org_id AND u.auth_user_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;
  
  -- Verificar se o usuário é membro da organização
  IF EXISTS (
    SELECT 1 FROM public.organization_members om
    JOIN public.users u ON om.user_id = u.id
    WHERE om.organization_id = org_id AND u.auth_user_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Remover todas as políticas RLS atuais da tabela organization_members
DROP POLICY IF EXISTS "Organization owners can add members" ON public.organization_members;
DROP POLICY IF EXISTS "Organization owners can update members" ON public.organization_members;
DROP POLICY IF EXISTS "Organization owners can remove members" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view organization members where they are members" ON public.organization_members;

-- Criar novas políticas RLS usando a função security definer
CREATE POLICY "Users can view organization members"
ON public.organization_members
FOR SELECT
USING (public.check_user_organization_membership(organization_id));

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
