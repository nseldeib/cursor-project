# Setup Email Authentication for Testing

## Disable Email Confirmation in Supabase Dashboard

1. **Go to your Supabase dashboard**
2. **Navigate to Authentication → Settings**
3. **Find "Enable email confirmations"**
4. **Turn it OFF** (disable it)
5. **Save the settings**

## Test Account Creation

Once email confirmation is disabled, you can:

1. **Visit your deployed app**
2. **Click "Sign In with Email"**
3. **Enter any email and password**
4. **Click "Sign Up"**
5. **Account will be created instantly** (no email verification needed)

## Demo Credentials

You can also create a test account with these credentials:
- **Email**: `test@example.com`
- **Password**: `test123`

## Alternative: Quick Demo Account

If you want to create a demo account quickly, run this in your Supabase SQL Editor:

```sql
-- Simple demo user creation (works after disabling email confirmation)
-- This creates a user that can sign in immediately

INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'demo@test.com',
  crypt('demo123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}'
) ON CONFLICT (email) DO NOTHING;
```

After running this, you can sign in with:
- **Email**: `demo@test.com`
- **Password**: `demo123` 