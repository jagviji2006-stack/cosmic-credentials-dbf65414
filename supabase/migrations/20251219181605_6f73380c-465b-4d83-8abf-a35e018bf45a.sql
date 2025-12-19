-- Enable pgcrypto so crypt() exists for password verification
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
