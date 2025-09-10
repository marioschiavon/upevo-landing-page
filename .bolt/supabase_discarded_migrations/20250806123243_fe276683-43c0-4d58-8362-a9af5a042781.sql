-- Create google_calendar_tokens table for storing OAuth tokens
CREATE TABLE public.google_calendar_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for google_calendar_tokens
CREATE POLICY "Users can manage their own Google tokens"
ON public.google_calendar_tokens
FOR ALL
USING (user_id IN (SELECT users.id FROM users WHERE users.auth_user_id = auth.uid()));

-- Add google_calendar_event_id to events table
ALTER TABLE public.events 
ADD COLUMN google_calendar_event_id TEXT,
ADD COLUMN sync_with_google BOOLEAN DEFAULT false;

-- Add google_calendar_event_id to time_logs table  
ALTER TABLE public.time_logs
ADD COLUMN google_calendar_event_id TEXT;

-- Create trigger for google_calendar_tokens updated_at
CREATE TRIGGER update_google_calendar_tokens_updated_at
BEFORE UPDATE ON public.google_calendar_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();