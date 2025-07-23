-- Fix installments constraint for parcelado payment (always 2 installments)
ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_installments_check;
ALTER TABLE public.budgets ADD CONSTRAINT budgets_installments_check 
  CHECK (
    (payment_method = 'parcelado' AND installments = 2) OR 
    (payment_method != 'parcelado' AND installments IS NULL) OR
    installments IS NULL
  );

-- Add constraint to ensure down_payment is required for parcelado
ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_down_payment_check;
ALTER TABLE public.budgets ADD CONSTRAINT budgets_down_payment_check 
  CHECK (
    (payment_method = 'parcelado' AND down_payment IS NOT NULL AND down_payment > 0) OR 
    (payment_method != 'parcelado') OR
    payment_method IS NULL
  );