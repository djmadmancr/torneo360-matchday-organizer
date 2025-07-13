-- Update the trigger function to handle new user registration
-- New users will get 'team_admin' role by default but with no access to specific features
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
begin
  insert into public.users (auth_user_id, email, full_name, role)
  values (
    new.id, 
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    'team_admin'  -- Default role for new registrations
  );
  return new;
end;
$$;

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;