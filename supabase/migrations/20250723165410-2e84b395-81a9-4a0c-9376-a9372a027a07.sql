-- Add new fields to budgets table for enhanced budget creation
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS valid_until DATE;
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS installments INTEGER;
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS down_payment NUMERIC;
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC;
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC;
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS monthly_duration INTEGER;
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS observations TEXT;

-- Add check constraint for payment method
ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_payment_method_check;
ALTER TABLE public.budgets ADD CONSTRAINT budgets_payment_method_check 
  CHECK (payment_method IS NULL OR payment_method IN ('a_vista_inicio', 'a_vista_final', 'parcelado', 'mensal', 'por_hora'));

-- Add check constraint for installments (only allow 2-12 when payment is parcelado)
ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_installments_check;
ALTER TABLE public.budgets ADD CONSTRAINT budgets_installments_check 
  CHECK (
    (payment_method = 'parcelado' AND installments >= 2 AND installments <= 12) OR 
    (payment_method != 'parcelado' AND installments IS NULL) OR
    installments IS NULL
  );

-- Add check constraint for monthly duration (1-60 months when payment is mensal)
ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_monthly_duration_check;
ALTER TABLE public.budgets ADD CONSTRAINT budgets_monthly_duration_check 
  CHECK (
    (payment_method = 'mensal' AND monthly_duration >= 1 AND monthly_duration <= 60) OR 
    (payment_method != 'mensal' AND monthly_duration IS NULL) OR
    monthly_duration IS NULL
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_budgets_valid_until ON public.budgets(valid_until);
CREATE INDEX IF NOT EXISTS idx_budgets_payment_method ON public.budgets(payment_method);