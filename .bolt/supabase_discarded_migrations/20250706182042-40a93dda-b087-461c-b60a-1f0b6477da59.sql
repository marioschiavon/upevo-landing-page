-- Create users table (profiles for additional user data)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organization_members table
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'colaborador')),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('em_andamento', 'finalizado', 'pausado')) DEFAULT 'em_andamento',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create budgets table
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('inicial', 'adicional')),
  description TEXT,
  total_value NUMERIC(15,2) NOT NULL CHECK (total_value >= 0),
  status TEXT NOT NULL CHECK (status IN ('aguardando', 'aprovado', 'recusado')) DEFAULT 'aguardando',
  delivery_days INTEGER CHECK (delivery_days > 0),
  currency TEXT NOT NULL DEFAULT 'BRL' CHECK (currency IN ('BRL', 'USD', 'EUR')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  description TEXT,
  value NUMERIC(15,2) NOT NULL CHECK (value >= 0),
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL CHECK (status IN ('pendente', 'pago', 'parcial')) DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('pendente', 'em_andamento', 'concluida')) DEFAULT 'pendente',
  priority TEXT NOT NULL CHECK (priority IN ('baixa', 'media', 'alta')) DEFAULT 'media',
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_logs table
CREATE TABLE public.task_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_hours NUMERIC(8,2) GENERATED ALWAYS AS (
    CASE 
      WHEN end_time IS NOT NULL AND start_time IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (end_time - start_time)) / 3600.0
      ELSE NULL 
    END
  ) STORED,
  hourly_rate NUMERIC(10,2) NOT NULL CHECK (hourly_rate >= 0),
  total_cost NUMERIC(15,2) GENERATED ALWAYS AS (
    CASE 
      WHEN end_time IS NOT NULL AND start_time IS NOT NULL 
      THEN (EXTRACT(EPOCH FROM (end_time - start_time)) / 3600.0) * hourly_rate
      ELSE NULL 
    END
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create payments when budget is approved
CREATE OR REPLACE FUNCTION public.create_payments_on_budget_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create payments if status changed to 'aprovado' and it's not already approved
  IF NEW.status = 'aprovado' AND OLD.status != 'aprovado' THEN
    -- Create a single payment for the full amount with 30 days due date
    INSERT INTO public.payments (
      budget_id,
      project_id,
      description,
      value,
      due_date,
      status
    ) VALUES (
      NEW.id,
      NEW.project_id,
      'Pagamento do orçamento: ' || COALESCE(NEW.description, 'Orçamento'),
      NEW.total_value,
      CURRENT_DATE + INTERVAL '30 days',
      'pendente'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic payment creation
CREATE TRIGGER create_payments_on_budget_approval
  AFTER UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.create_payments_on_budget_approval();

-- Function to check if project can be created (needs approved budget)
CREATE OR REPLACE FUNCTION public.validate_project_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be used in application logic since we can't enforce
  -- this at database level during initial project creation
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Create RLS policies for organizations
CREATE POLICY "Organization members can view organizations" ON public.organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
      )
    ) OR owner_id IN (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can update organizations" ON public.organizations
  FOR UPDATE USING (
    owner_id IN (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create organizations" ON public.organizations
  FOR INSERT TO authenticated WITH CHECK (
    owner_id IN (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    )
  );

-- Create RLS policies for organization_members
CREATE POLICY "Organization members can view members" ON public.organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Create RLS policies for clients, projects, budgets, payments, tasks, task_logs
-- All these tables should be accessible only to organization members

CREATE POLICY "Organization members can view clients" ON public.clients
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Organization members can manage clients" ON public.clients
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Organization members can view projects" ON public.projects
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Organization members can manage projects" ON public.projects
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Organization members can view budgets" ON public.budgets
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Organization members can manage budgets" ON public.budgets
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Organization members can view payments" ON public.payments
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id IN (
          SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Organization members can manage payments" ON public.payments
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id IN (
          SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Organization members can view tasks" ON public.tasks
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id IN (
          SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Organization members can manage tasks" ON public.tasks
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id IN (
          SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Organization members can view task logs" ON public.task_logs
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM public.tasks 
      WHERE project_id IN (
        SELECT id FROM public.projects 
        WHERE organization_id IN (
          SELECT organization_id FROM public.organization_members 
          WHERE user_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "Organization members can manage task logs" ON public.task_logs
  FOR ALL USING (
    task_id IN (
      SELECT id FROM public.tasks 
      WHERE project_id IN (
        SELECT id FROM public.projects 
        WHERE organization_id IN (
          SELECT organization_id FROM public.organization_members 
          WHERE user_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
          )
        )
      )
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX idx_organizations_owner_id ON public.organizations(owner_id);
CREATE INDEX idx_organization_members_org_user ON public.organization_members(organization_id, user_id);
CREATE INDEX idx_clients_organization_id ON public.clients(organization_id);
CREATE INDEX idx_projects_client_id ON public.projects(client_id);
CREATE INDEX idx_projects_organization_id ON public.projects(organization_id);
CREATE INDEX idx_budgets_project_id ON public.budgets(project_id);
CREATE INDEX idx_budgets_organization_id ON public.budgets(organization_id);
CREATE INDEX idx_payments_budget_id ON public.payments(budget_id);
CREATE INDEX idx_payments_project_id ON public.payments(project_id);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_task_logs_task_id ON public.task_logs(task_id);
CREATE INDEX idx_task_logs_user_id ON public.task_logs(user_id);