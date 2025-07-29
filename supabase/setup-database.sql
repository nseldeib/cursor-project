-- Safe Database Setup Script for Next.js + Supabase App
-- This script only creates tables if they don't exist and won't affect existing tables
-- Run this in your Supabase SQL Editor

-- Check if profiles table exists, create only if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    CREATE TABLE public.profiles (
      id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT,
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );
    
    -- Enable Row Level Security
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for profiles table
    CREATE POLICY "Users can view their own profile" ON public.profiles
      FOR SELECT USING (auth.uid() = id);
      
    CREATE POLICY "Users can update their own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = id);
      
    CREATE POLICY "Users can insert their own profile" ON public.profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
      
    RAISE NOTICE 'Created profiles table with RLS policies';
  ELSE
    RAISE NOTICE 'Profiles table already exists - skipping creation';
  END IF;
END $$;

-- Check if posts table exists, create only if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'posts') THEN
    CREATE TABLE public.posts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );
    
    -- Enable Row Level Security
    ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for posts table
    CREATE POLICY "Anyone can view posts" ON public.posts
      FOR SELECT USING (true);
      
    CREATE POLICY "Authenticated users can create posts" ON public.posts
      FOR INSERT WITH CHECK (auth.uid() = user_id);
      
    CREATE POLICY "Users can update their own posts" ON public.posts
      FOR UPDATE USING (auth.uid() = user_id);
      
    CREATE POLICY "Users can delete their own posts" ON public.posts
      FOR DELETE USING (auth.uid() = user_id);
      
    -- Create indexes for better performance
    CREATE INDEX idx_posts_user_id ON public.posts(user_id);
    CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
    
    RAISE NOTICE 'Created posts table with RLS policies and indexes';
  ELSE
    RAISE NOTICE 'Posts table already exists - skipping creation';
  END IF;
END $$;

-- Create or replace function to handle new user signup (safe to run multiple times)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if profiles table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'avatar_url'
    ) ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup (safe to recreate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert some sample data only if posts table is empty
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'posts') THEN
    IF NOT EXISTS (SELECT 1 FROM public.posts LIMIT 1) THEN
      -- Get a real user ID if any exists, otherwise skip sample data
      IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
        INSERT INTO public.posts (title, content, user_id) 
        SELECT 
          'Welcome to Next.js + Supabase!',
          'This is a sample post to demonstrate the database functionality. You can create, edit, and delete posts once you''re signed in.',
          (SELECT id FROM auth.users LIMIT 1)
        WHERE NOT EXISTS (SELECT 1 FROM public.posts);
        
        RAISE NOTICE 'Added sample post';
      END IF;
    ELSE
      RAISE NOTICE 'Posts table already has data - skipping sample data';
    END IF;
  END IF;
END $$;

-- Show summary of what exists
SELECT 
  'Database setup completed!' as status,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') as profiles_table_exists,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename = 'posts') as posts_table_exists,
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'posts') 
    THEN (SELECT COUNT(*) FROM public.posts) 
    ELSE 0 END) as total_posts; 