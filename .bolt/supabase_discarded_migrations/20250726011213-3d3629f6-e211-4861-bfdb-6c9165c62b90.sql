-- Security fixes for existing tables only

-- Add missing DELETE policies to existing tables
CREATE POLICY "Organization owners can delete organizations" 
ON public.organizations 
FOR DELETE 
USING (owner_id IN (
  SELECT users.id
  FROM users
  WHERE users.auth_user_id = auth.uid()
));

-- Add DELETE policy for users (soft delete only - update profile to inactive)
CREATE POLICY "Users can deactivate their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- Add DELETE policy for clients (organization owners can delete)
CREATE POLICY "Organization owners can delete clients" 
ON public.clients 
FOR DELETE 
USING (organization_id IN (
  SELECT o.id
  FROM organizations o
  JOIN users u ON o.owner_id = u.id
  WHERE u.auth_user_id = auth.uid()
));

-- Add DELETE policy for projects (organization owners can delete)
CREATE POLICY "Organization owners can delete projects" 
ON public.projects 
FOR DELETE 
USING (organization_id IN (
  SELECT o.id
  FROM organizations o
  JOIN users u ON o.owner_id = u.id
  WHERE u.auth_user_id = auth.uid()
));

-- Add DELETE policy for budgets (organization owners can delete)
CREATE POLICY "Organization owners can delete budgets" 
ON public.budgets 
FOR DELETE 
USING (organization_id IN (
  SELECT o.id
  FROM organizations o
  JOIN users u ON o.owner_id = u.id
  WHERE u.auth_user_id = auth.uid()
));

-- Add DELETE policy for payments (organization owners can delete)
CREATE POLICY "Organization owners can delete payments" 
ON public.payments 
FOR DELETE 
USING (organization_id IN (
  SELECT o.id
  FROM organizations o
  JOIN users u ON o.owner_id = u.id
  WHERE u.auth_user_id = auth.uid()
));

-- Add DELETE policy for tasks (organization owners can delete)
CREATE POLICY "Organization owners can delete tasks" 
ON public.tasks 
FOR DELETE 
USING (project_id IN (
  SELECT p.id
  FROM projects p
  JOIN organizations o ON p.organization_id = o.id
  JOIN users u ON o.owner_id = u.id
  WHERE u.auth_user_id = auth.uid()
));

-- Add DELETE policy for task logs (organization owners can delete)
CREATE POLICY "Organization owners can delete task logs" 
ON public.task_logs 
FOR DELETE 
USING (task_id IN (
  SELECT t.id
  FROM tasks t
  JOIN projects p ON t.project_id = p.id
  JOIN organizations o ON p.organization_id = o.id
  JOIN users u ON o.owner_id = u.id
  WHERE u.auth_user_id = auth.uid()
));

-- Ensure the budget payment trigger is properly set up
DROP TRIGGER IF EXISTS create_payments_on_budget_approval ON public.budgets;
CREATE TRIGGER create_payments_on_budget_approval
AFTER UPDATE ON public.budgets
FOR EACH ROW
EXECUTE FUNCTION public.create_payments_on_budget_approval();