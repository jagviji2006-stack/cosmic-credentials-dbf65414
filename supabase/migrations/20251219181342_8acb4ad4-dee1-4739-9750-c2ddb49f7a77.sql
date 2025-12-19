-- Create a function to verify admin password using pgcrypto
CREATE OR REPLACE FUNCTION public.verify_admin_password(p_username text, p_password text)
RETURNS TABLE(admin_id uuid, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ac.id as admin_id,
    (ac.password_hash = crypt(p_password, ac.password_hash)) as is_valid
  FROM admin_credentials ac
  WHERE ac.username = p_username;
END;
$$;

-- Create a function to update admin session
CREATE OR REPLACE FUNCTION public.update_admin_session(p_admin_id uuid, p_session_token text, p_expires_at timestamp with time zone)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE admin_credentials 
  SET session_token = p_session_token, session_expires = p_expires_at
  WHERE id = p_admin_id;
END;
$$;

-- Create a function to verify admin session
CREATE OR REPLACE FUNCTION public.verify_admin_session(p_admin_id uuid, p_session_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stored_token text;
  v_expires timestamp with time zone;
BEGIN
  SELECT session_token, session_expires INTO v_stored_token, v_expires
  FROM admin_credentials
  WHERE id = p_admin_id;
  
  IF v_stored_token IS NULL THEN
    RETURN false;
  END IF;
  
  IF v_expires < now() THEN
    RETURN false;
  END IF;
  
  RETURN v_stored_token = p_session_token;
END;
$$;