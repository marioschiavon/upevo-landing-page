-- Add organization_id to payments table for direct filtering
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Update existing payments with organization_id from projects
UPDATE public.payments 
SET organization_id = (
  SELECT p.organization_id 
  FROM public.projects p 
  WHERE p.id = payments.project_id
)
WHERE organization_id IS NULL;

-- Make organization_id NOT NULL after updating existing records
ALTER TABLE public.payments ALTER COLUMN organization_id SET NOT NULL;

-- Add foreign key constraint for organization_id
ALTER TABLE public.payments ADD CONSTRAINT fk_payments_organization_id 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

-- Create trigger for automatic payment creation on budget approval
DROP TRIGGER IF EXISTS budgets_payment_trigger ON public.budgets;
CREATE TRIGGER budgets_payment_trigger
  AFTER UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.create_payments_on_budget_approval();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_organization_id ON public.payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_budget_id ON public.payments(budget_id);

-- Update payment creation function to include organization_id
CREATE OR REPLACE FUNCTION public.create_payments_on_budget_approval()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only create payments if status changed to 'aprovado' and it's not already approved
  IF NEW.status = 'aprovado' AND OLD.status != 'aprovado' THEN
    -- Create payment based on payment method
    IF NEW.payment_method = 'parcelado' THEN
      -- Create down payment (immediate)
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
        CURRENT_DATE,
        'pendente'
      );
      
      -- Create final payment (30 days)
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
        CURRENT_DATE + INTERVAL '30 days',
        'pendente'
      );
    ELSE
      -- Create single payment for other methods
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
        CURRENT_DATE + INTERVAL '30 days',
        'pendente'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;