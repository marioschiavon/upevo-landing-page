-- Fix duplicate triggers - remove the old trigger
DROP TRIGGER IF EXISTS create_payments_on_budget_approval ON public.budgets;

-- Update the payment creation function to handle start_date correctly for all payment methods
CREATE OR REPLACE FUNCTION public.create_payments_on_budget_approval()
RETURNS trigger
LANGUAGE plpgsql
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