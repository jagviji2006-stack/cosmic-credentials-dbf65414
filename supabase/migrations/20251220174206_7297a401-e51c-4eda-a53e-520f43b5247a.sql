-- Update admin credentials: change username to viitadmins and password to viit@dmin
-- First delete any existing admin credentials
DELETE FROM public.admin_credentials;

-- Insert new admin with correct credentials using pgcrypto
INSERT INTO public.admin_credentials (username, password_hash)
VALUES ('viitadmins', extensions.crypt('viit@dmin', extensions.gen_salt('bf')));