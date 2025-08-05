-- Fix security warnings by setting proper search_path on functions
CREATE OR REPLACE FUNCTION public.calculate_time_log_duration()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Calculate duration in minutes when end_time is set
  IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
    NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;
  
  RETURN NEW;
END;
$$;