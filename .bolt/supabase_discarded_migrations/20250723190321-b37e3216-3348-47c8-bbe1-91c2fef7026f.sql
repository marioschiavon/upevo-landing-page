-- Add client_id to budgets table and make project_id nullable
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS client_id UUID;
ALTER TABLE public.budgets ALTER COLUMN project_id DROP NOT NULL;

-- Add foreign key constraint for client_id
ALTER TABLE public.budgets ADD CONSTRAINT fk_budgets_client_id 
  FOREIGN KEY (client_id) REFERENCES public.clients(id);

-- Update existing budgets to have client_id based on project's client
UPDATE public.budgets 
SET client_id = (
  SELECT p.client_id 
  FROM public.projects p 
  WHERE p.id = budgets.project_id
)
WHERE client_id IS NULL AND project_id IS NOT NULL;

-- Make client_id NOT NULL after updating existing records
ALTER TABLE public.budgets ALTER COLUMN client_id SET NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_budgets_client_id ON public.budgets(client_id);