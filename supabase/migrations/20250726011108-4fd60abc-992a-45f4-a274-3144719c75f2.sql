-- PHASE 1: Enable RLS and create policies for unprotected tables

-- Enable RLS on unprotected tables
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estatisticas_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cliente ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usuarios table
CREATE POLICY "Users can manage their own profile in usuarios" 
ON public.usuarios 
FOR ALL 
USING (user_auth = auth.uid())
WITH CHECK (user_auth = auth.uid());

-- RLS Policies for categorias table  
CREATE POLICY "Users can manage their own categories" 
ON public.categorias 
FOR ALL 
USING (usuario_id IN (SELECT id FROM public.usuarios WHERE user_auth = auth.uid()))
WITH CHECK (usuario_id IN (SELECT id FROM public.usuarios WHERE user_auth = auth.uid()));

-- RLS Policies for tarefas table
CREATE POLICY "Users can manage their own tasks" 
ON public.tarefas 
FOR ALL 
USING (usuario_id IN (SELECT id FROM public.usuarios WHERE user_auth = auth.uid()))
WITH CHECK (usuario_id IN (SELECT id FROM public.usuarios WHERE user_auth = auth.uid()));

-- RLS Policies for estatisticas_usuario table
CREATE POLICY "Users can view their own statistics" 
ON public.estatisticas_usuario 
FOR SELECT 
USING (usuario_id IN (SELECT id FROM public.usuarios WHERE user_auth = auth.uid()));

-- RLS Policies for apps table (public read access)
CREATE POLICY "Anyone can view apps" 
ON public.apps 
FOR SELECT 
USING (true);

-- RLS Policies for cliente table (organization-scoped)
CREATE POLICY "Organization members can manage legacy clients" 
ON public.cliente 
FOR ALL 
USING (id_organizacao IN (
  SELECT o.id::integer 
  FROM organizations o
  JOIN organization_members om ON o.id = om.organization_id
  JOIN users u ON om.user_id = u.id
  WHERE u.auth_user_id = auth.uid()
))
WITH CHECK (id_organizacao IN (
  SELECT o.id::integer 
  FROM organizations o
  JOIN organization_members om ON o.id = om.organization_id
  JOIN users u ON om.user_id = u.id
  WHERE u.auth_user_id = auth.uid()
));

-- PHASE 2: Fix database function security
-- Update existing functions to be more secure
CREATE OR REPLACE FUNCTION public.check_user_organization_membership(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = ''
AS $function$
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
$function$;

-- Update update_updated_at_column function for security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update validate_project_creation function for security
CREATE OR REPLACE FUNCTION public.validate_project_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  -- This function will be used in application logic since we can't enforce
  -- this at database level during initial project creation
  RETURN NEW;
END;
$function$;

-- Update create_payments_on_budget_approval function for security
CREATE OR REPLACE FUNCTION public.create_payments_on_budget_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  monthly_count INTEGER;
  current_month DATE;
  payment_start_date DATE;
  delivery_date DATE;
BEGIN
  -- Only create payments if status changed to 'aprovado' and it's not already approved
  IF NEW.status = 'aprovado' AND OLD.status != 'aprovado' THEN
    
    -- Validate required fields
    IF NEW.start_date IS NULL THEN
      RAISE EXCEPTION 'Data de início é obrigatória para aprovar orçamento';
    END IF;
    
    -- Set the payment start date (use start_date from budget)
    payment_start_date := NEW.start_date;
    
    -- Create payments based on payment method
    CASE NEW.payment_method
      WHEN 'parcelado' THEN
        -- Validate required fields for parcelado
        IF NEW.down_payment IS NULL OR NEW.delivery_days IS NULL THEN
          RAISE EXCEPTION 'Valor da entrada e prazo de entrega são obrigatórios para pagamento parcelado';
        END IF;
        
        -- Calculate delivery date
        delivery_date := payment_start_date + (NEW.delivery_days || ' days')::INTERVAL;
        
        -- Create down payment (start_date)
        INSERT INTO public.payments (
          budget_id,
          project_id,
          organization_id,
          description,
          value,
          due_date,
          status
        ) VALUES (
          NEW.id,
          NEW.project_id,
          NEW.organization_id,
          'Entrada - ' || COALESCE(NEW.description, 'Orçamento'),
          NEW.down_payment,
          payment_start_date,
          'pendente'
        );
        
        -- Create final payment (start_date + delivery_days)
        INSERT INTO public.payments (
          budget_id,
          project_id,
          organization_id,
          description,
          value,
          due_date,
          status
        ) VALUES (
          NEW.id,
          NEW.project_id,
          NEW.organization_id,
          'Pagamento Final - ' || COALESCE(NEW.description, 'Orçamento'),
          NEW.total_value - NEW.down_payment,
          delivery_date,
          'pendente'
        );
        
      WHEN 'a_vista_final' THEN
        -- Validate required fields
        IF NEW.delivery_days IS NULL THEN
          RAISE EXCEPTION 'Prazo de entrega é obrigatório para pagamento à vista no final';
        END IF;
        
        -- Calculate delivery date
        delivery_date := payment_start_date + (NEW.delivery_days || ' days')::INTERVAL;
        
        -- Create single payment (start_date + delivery_days)
        INSERT INTO public.payments (
          budget_id,
          project_id,
          organization_id,
          description,
          value,
          due_date,
          status
        ) VALUES (
          NEW.id,
          NEW.project_id,
          NEW.organization_id,
          'Pagamento à Vista - ' || COALESCE(NEW.description, 'Orçamento'),
          NEW.total_value,
          delivery_date,
          'pendente'
        );
        
      WHEN 'a_vista_inicio' THEN
        -- Create single payment (start_date)
        INSERT INTO public.payments (
          budget_id,
          project_id,
          organization_id,
          description,
          value,
          due_date,
          status
        ) VALUES (
          NEW.id,
          NEW.project_id,
          NEW.organization_id,
          'Pagamento à Vista - ' || COALESCE(NEW.description, 'Orçamento'),
          NEW.total_value,
          payment_start_date,
          'pendente'
        );
        
      WHEN 'mensal' THEN
        -- Validate required fields
        IF NEW.monthly_duration IS NULL THEN
          RAISE EXCEPTION 'Duração mensal é obrigatória para pagamento mensal';
        END IF;
        
        -- Create monthly payments (always on day 5)
        FOR monthly_count IN 1..NEW.monthly_duration LOOP
          current_month := DATE_TRUNC('month', payment_start_date) + ((monthly_count - 1) || ' months')::INTERVAL + '4 days'::INTERVAL;
          
          INSERT INTO public.payments (
            budget_id,
            project_id,
            organization_id,
            description,
            value,
            due_date,
            status
          ) VALUES (
            NEW.id,
            NEW.project_id,
            NEW.organization_id,
            'Pagamento Mensal ' || monthly_count || '/' || NEW.monthly_duration || ' - ' || COALESCE(NEW.description, 'Orçamento'),
            NEW.total_value / NEW.monthly_duration,
            current_month,
            'pendente'
          );
        END LOOP;
        
      WHEN 'por_hora' THEN
        -- Skip payment creation for hourly billing (manual process)
        NULL;
        
      ELSE
        -- Default case for other payment methods
        INSERT INTO public.payments (
          budget_id,
          project_id,
          organization_id,
          description,
          value,
          due_date,
          status
        ) VALUES (
          NEW.id,
          NEW.project_id,
          NEW.organization_id,
          'Pagamento - ' || COALESCE(NEW.description, 'Orçamento'),
          NEW.total_value,
          payment_start_date + INTERVAL '30 days',
          'pendente'
        );
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add missing DELETE policies to existing tables
CREATE POLICY "Organization owners can delete organizations" 
ON public.organizations 
FOR DELETE 
USING (owner_id IN (
  SELECT users.id
  FROM users
  WHERE users.auth_user_id = auth.uid()
));

-- Add missing trigger for budget payments
DROP TRIGGER IF EXISTS create_payments_on_budget_approval ON public.budgets;
CREATE TRIGGER create_payments_on_budget_approval
AFTER UPDATE ON public.budgets
FOR EACH ROW
EXECUTE FUNCTION public.create_payments_on_budget_approval();