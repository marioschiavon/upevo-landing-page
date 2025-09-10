-- Fix RLS policies for payments table to handle budgets without project_id
DROP POLICY IF EXISTS "Organization members can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Organization members can view payments" ON public.payments;

-- Create new RLS policies using organization_id directly
CREATE POLICY "Organization members can view payments" 
ON public.payments 
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

CREATE POLICY "Organization members can manage payments" 
ON public.payments 
FOR ALL 
USING (organization_id IN (
  SELECT organization_members.organization_id
  FROM organization_members
  WHERE organization_members.user_id IN (
    SELECT users.id
    FROM users
    WHERE users.auth_user_id = auth.uid()
  )
));

-- Update payment creation function with correct due date logic
CREATE OR REPLACE FUNCTION public.create_payments_on_budget_approval()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  monthly_count INTEGER;
  current_month DATE;
BEGIN
  -- Only create payments if status changed to 'aprovado' and it's not already approved
  IF NEW.status = 'aprovado' AND OLD.status != 'aprovado' THEN
    
    -- Validate required fields
    IF NEW.start_date IS NULL THEN
      RAISE EXCEPTION 'Data de início é obrigatória para aprovar orçamento';
    END IF;
    
    -- Create payments based on payment method
    CASE NEW.payment_method
      WHEN 'parcelado' THEN
        -- Validate required fields for parcelado
        IF NEW.down_payment IS NULL OR NEW.delivery_days IS NULL THEN
          RAISE EXCEPTION 'Valor da entrada e prazo de entrega são obrigatórios para pagamento parcelado';
        END IF;
        
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
          NEW.start_date,
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
          NEW.start_date + (NEW.delivery_days || ' days')::INTERVAL,
          'pendente'
        );
        
      WHEN 'a_vista_final' THEN
        -- Validate required fields
        IF NEW.delivery_days IS NULL THEN
          RAISE EXCEPTION 'Prazo de entrega é obrigatório para pagamento à vista no final';
        END IF;
        
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
          NEW.start_date + (NEW.delivery_days || ' days')::INTERVAL,
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
          NEW.start_date,
          'pendente'
        );
        
      WHEN 'mensal' THEN
        -- Validate required fields
        IF NEW.monthly_duration IS NULL THEN
          RAISE EXCEPTION 'Duração mensal é obrigatória para pagamento mensal';
        END IF;
        
        -- Create monthly payments (always on day 5)
        FOR monthly_count IN 1..NEW.monthly_duration LOOP
          current_month := DATE_TRUNC('month', NEW.start_date) + ((monthly_count - 1) || ' months')::INTERVAL + '4 days'::INTERVAL;
          
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
          NEW.start_date + INTERVAL '30 days',
          'pendente'
        );
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$function$;