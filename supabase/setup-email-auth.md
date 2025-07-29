# Setup Email Authentication for Testing

## ✅ **Fixed! Here's the Simple Solution:**

The `auth.config` table doesn't exist in standard Supabase setups, so I've created a much simpler approach.

### 🔧 **Easy Setup Steps:**

1. **Go to your Supabase dashboard**
2. **Navigate to Authentication → Settings**
3. **Find "Enable email confirmations"**
4. **Turn it OFF** (disable it)
5. **Save the settings**

### 📧 **Test Email Authentication:**

Once email confirmation is disabled:

1. **Visit your deployed app** (should be updated now)
2. **Click "Sign In with Email"**
3. **Enter any email and password** (like `test@example.com` / `test123`)
4. **Click "Sign Up"**
5. **Account will be created instantly** - no email verification needed!

### 🎯 **Alternative Quick Demo Account:**

If you want a pre-made demo account, run this simple SQL in your Supabase SQL Editor:

```sql
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

Then you can sign in with:
- **Email**: `demo@test.com`
- **Password**: `demo123`

**The key is disabling email confirmation in your Supabase dashboard - then any email/password combination will work for creating accounts instantly!**

**Can you try disabling email confirmation in your Supabase dashboard and then test the email authentication?** 