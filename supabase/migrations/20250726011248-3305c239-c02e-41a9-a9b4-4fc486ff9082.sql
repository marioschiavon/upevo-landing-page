-- Fix remaining security issues - update all functions to have proper search_path

-- Get list of all functions that need fixing
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
  AND routine_definition NOT LIKE '%SET search_path%';