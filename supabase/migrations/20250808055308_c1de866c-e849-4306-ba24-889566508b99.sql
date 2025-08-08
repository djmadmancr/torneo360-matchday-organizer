-- Crear usuarios de demo con contraseñas conocidas
-- Primero verificamos si ya existen los usuarios en auth.users

-- Crear un super admin con credenciales conocidas
DO $$
DECLARE
    admin_user_id uuid;
    team_user_id uuid;
    organizer_user_id uuid;
    referee_user_id uuid;
BEGIN
    -- Verificar si ya existe admin@demo.com y actualizarlo si es necesario
    UPDATE users 
    SET role = 'admin', roles = '["admin"]'::jsonb 
    WHERE email = 'admin@demo.com';

    -- Si no existe, crearlo (esto normalmente se hace desde la función edge)
    IF NOT FOUND THEN
        INSERT INTO users (email, full_name, role, roles, auth_user_id)
        VALUES (
            'admin@demo.com',
            'Administrador Demo',
            'admin',
            '["admin"]'::jsonb,
            gen_random_uuid()
        );
    END IF;

    -- Asegurar que todos los roles estén correctos
    UPDATE users SET role = 'team_admin', roles = '["team_admin"]'::jsonb WHERE email = 'team@demo.com';
    UPDATE users SET role = 'organizer', roles = '["organizer"]'::jsonb WHERE email = 'organizer@demo.com';
    UPDATE users SET role = 'referee', roles = '["referee"]'::jsonb WHERE email = 'referee@demo.com';
END $$;