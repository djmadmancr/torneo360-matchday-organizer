-- Update the trigger function to handle new user registration with roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
begin
  insert into public.users (auth_user_id, email, full_name, role, roles)
  values (
    new.id, 
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    'team_admin',  -- Default role for new registrations
    '["team_admin"]'::jsonb  -- Default roles array
  );
  return new;
end;
$$;