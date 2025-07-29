-- Create Demo User for Testing
-- Run this in your Supabase SQL Editor

-- First, let's check if email confirmation is required
-- We'll disable it temporarily for testing
UPDATE auth.config 
SET enable_signup = true,
    enable_confirmations = false,
    enable_manual_linking = true;

-- Create a demo user directly in the auth.users table
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'demo@example.com',
  crypt('demo123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Demo User"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Also create a profile for the demo user
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  created_at,
  updated_at
) 
SELECT 
  id,
  email,
  'Demo User',
  created_at,
  updated_at
FROM auth.users 
WHERE email = 'demo@example.com'
ON CONFLICT (id) DO NOTHING;

-- Show the created user
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'demo@example.com';

-- Show the profile
SELECT 
  id,
  email,
  full_name,
  created_at
FROM public.profiles 
WHERE email = 'demo@example.com'; 