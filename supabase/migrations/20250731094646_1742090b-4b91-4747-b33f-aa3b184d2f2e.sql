-- Criar tabela de documentos do projeto
CREATE TABLE public.project_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para documentos
CREATE POLICY "Organization members can view project documents" 
ON public.project_documents 
FOR SELECT 
USING (organization_id IN (
  SELECT organization_members.organization_id
  FROM organization_members
  WHERE organization_members.user_id IN (
    SELECT users.id
    FROM users
    WHERE users.auth_user_id = auth.uid()
  )
));

CREATE POLICY "Organization members can create project documents" 
ON public.project_documents 
FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT organization_members.organization_id
    FROM organization_members
    WHERE organization_members.user_id IN (
      SELECT users.id
      FROM users
      WHERE users.auth_user_id = auth.uid()
    )
  ) AND
  uploaded_by IN (
    SELECT users.id
    FROM users
    WHERE users.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can update project documents" 
ON public.project_documents 
FOR UPDATE 
USING (organization_id IN (
  SELECT organization_members.organization_id
  FROM organization_members
  WHERE organization_members.user_id IN (
    SELECT users.id
    FROM users
    WHERE users.auth_user_id = auth.uid()
  )
));

CREATE POLICY "Organization owners and document uploaders can delete project documents" 
ON public.project_documents 
FOR DELETE 
USING (
  organization_id IN (
    SELECT o.id
    FROM organizations o
    JOIN users u ON o.owner_id = u.id
    WHERE u.auth_user_id = auth.uid()
  ) OR
  uploaded_by IN (
    SELECT users.id
    FROM users
    WHERE users.auth_user_id = auth.uid()
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_project_documents_updated_at
BEFORE UPDATE ON public.project_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();