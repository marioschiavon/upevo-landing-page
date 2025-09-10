-- Create task_checklists table
CREATE TABLE public.task_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.task_checklists ENABLE ROW LEVEL SECURITY;

-- Create policies for task checklists
CREATE POLICY "Organization members can view task checklists" 
ON public.task_checklists 
FOR SELECT 
USING (
  task_id IN (
    SELECT t.id 
    FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    WHERE p.organization_id IN (
      SELECT om.organization_id
      FROM public.organization_members om
      JOIN public.users u ON om.user_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY "Organization members can manage task checklists" 
ON public.task_checklists 
FOR ALL 
USING (
  task_id IN (
    SELECT t.id 
    FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    WHERE p.organization_id IN (
      SELECT om.organization_id
      FROM public.organization_members om
      JOIN public.users u ON om.user_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY "Organization owners can delete task checklists" 
ON public.task_checklists 
FOR DELETE 
USING (
  task_id IN (
    SELECT t.id 
    FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    JOIN public.organizations o ON p.organization_id = o.id
    JOIN public.users u ON o.owner_id = u.id
    WHERE u.auth_user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_task_checklists_updated_at
BEFORE UPDATE ON public.task_checklists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();