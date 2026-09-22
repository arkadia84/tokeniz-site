
-- Add new columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS user_role text;

-- Update the handle_new_user trigger function to capture Google name data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, signup_method, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    NEW.raw_user_meta_data->>'full_name',
    NULL
  );
  RETURN NEW;
END;
$function$;
