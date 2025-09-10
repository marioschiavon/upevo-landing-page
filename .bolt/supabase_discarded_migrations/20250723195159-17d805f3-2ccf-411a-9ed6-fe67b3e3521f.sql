-- Add 'cancelado' status as a valid option for budgets
ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_status_check;
ALTER TABLE public.budgets ADD CONSTRAINT budgets_status_check 
  CHECK (status IN ('aguardando', 'aprovado', 'recusado', 'cancelado'));