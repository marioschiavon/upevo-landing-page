-- Create events table for calendar functionality
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  origin TEXT NOT NULL DEFAULT 'internal' CHECK (origin IN ('internal', 'google')),
  google_event_id TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for events access
CREATE POLICY "Organization members can view events" 
ON public.events 
FOR SELECT 
USING (check_user_organization_membership(organization_id));

CREATE POLICY "Organization members can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (
  check_user_organization_membership(organization_id) AND 
  created_by IN (SELECT users.id FROM users WHERE users.auth_user_id = auth.uid())
);

CREATE POLICY "Organization members can update events" 
ON public.events 
FOR UPDATE 
USING (check_user_organization_membership(organization_id));

CREATE POLICY "Organization owners can delete events" 
ON public.events 
FOR DELETE 
USING (organization_id IN (
  SELECT o.id FROM organizations o
  JOIN users u ON o.owner_id = u.id
  WHERE u.auth_user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();