-- Create time_logs table for project time tracking
CREATE TABLE public.time_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  description TEXT,
  billable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for time_logs
CREATE POLICY "Organization members can view time logs" 
ON public.time_logs 
FOR SELECT 
USING (project_id IN (
  SELECT p.id 
  FROM projects p 
  WHERE p.organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id IN (
      SELECT id 
      FROM users 
      WHERE auth_user_id = auth.uid()
    )
  )
));

CREATE POLICY "Organization members can create time logs" 
ON public.time_logs 
FOR INSERT 
WITH CHECK (
  project_id IN (
    SELECT p.id 
    FROM projects p 
    WHERE p.organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id IN (
        SELECT id 
        FROM users 
        WHERE auth_user_id = auth.uid()
      )
    )
  ) AND 
  user_id IN (
    SELECT id 
    FROM users 
    WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can update their own time logs" 
ON public.time_logs 
FOR UPDATE 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p 
    WHERE p.organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id IN (
        SELECT id 
        FROM users 
        WHERE auth_user_id = auth.uid()
      )
    )
  ) AND 
  user_id IN (
    SELECT id 
    FROM users 
    WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Organization owners can delete time logs" 
ON public.time_logs 
FOR DELETE 
USING (project_id IN (
  SELECT p.id 
  FROM projects p 
  JOIN organizations o ON p.organization_id = o.id 
  JOIN users u ON o.owner_id = u.id 
  WHERE u.auth_user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_time_logs_updated_at
BEFORE UPDATE ON public.time_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically calculate duration when end_time is set
CREATE OR REPLACE FUNCTION public.calculate_time_log_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate duration in minutes when end_time is set
  IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
    NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to calculate duration automatically
CREATE TRIGGER calculate_duration_on_time_log_update
BEFORE UPDATE ON public.time_logs
FOR EACH ROW
EXECUTE FUNCTION public.calculate_time_log_duration();