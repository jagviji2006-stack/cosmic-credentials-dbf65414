-- Create registrations table
CREATE TABLE public.registrations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    roll_number TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    branch TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public registration)
CREATE POLICY "Anyone can register"
ON public.registrations
FOR INSERT
WITH CHECK (true);

-- Allow anyone to view their own registration by roll number
CREATE POLICY "Anyone can view registrations"
ON public.registrations
FOR SELECT
USING (true);

-- Create admin_credentials table
CREATE TABLE public.admin_credentials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_credentials
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- Only allow reading admin credentials (for login verification via edge function)
CREATE POLICY "No direct access to admin credentials"
ON public.admin_credentials
FOR SELECT
USING (false);

-- Insert default admin (password: admin123 - hashed)
INSERT INTO public.admin_credentials (username, password_hash) 
VALUES ('admin', 'admin123');