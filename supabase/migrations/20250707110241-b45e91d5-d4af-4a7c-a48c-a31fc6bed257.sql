-- Add missing columns to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL';

-- Update projects status constraint to include the requested values
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_status_check 
  CHECK (status IN ('em_andamento', 'concluido', 'pausado'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_organization_id ON public.clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON public.projects(organization_id);