-- Fix admin password verification: pgcrypto lives in the `extensions` schema in this backend
-- so `crypt()` is not found when the function search_path is only `public`.

CREATE OR REPLACE FUNCTION public.verify_admin_password(p_username text, p_password text)
RETURNS TABLE(admin_id uuid, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ac.id as admin_id,
    (ac.password_hash = extensions.crypt(p_password, ac.password_hash)) as is_valid
  FROM public.admin_credentials ac
  WHERE ac.username = p_username;
END;
$$;