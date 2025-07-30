-- Update schema to support note-taking app
-- This script will safely migrate from posts to notes

-- Create notes table (enhanced version of posts)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notes') THEN
    CREATE TABLE public.notes (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      title TEXT NOT NULL DEFAULT 'Untitled Note',
      content TEXT DEFAULT '',
      category TEXT DEFAULT 'general',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );
  END IF;
END $$;

-- Enable Row Level Security for notes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notes' AND policyname = 'Users can view their own notes'
  ) THEN
    ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

    -- Create policies for notes table
    CREATE POLICY "Users can view their own notes" ON notes
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can create their own notes" ON notes
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own notes" ON notes
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own notes" ON notes
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes for better performance
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notes_user_id') THEN
    CREATE INDEX idx_notes_user_id ON notes(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notes_created_at') THEN
    CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notes_category') THEN
    CREATE INDEX idx_notes_category ON notes(category);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notes_updated_at') THEN
    CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
  END IF;
END $$;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'handle_notes_updated_at'
  ) THEN
    CREATE TRIGGER handle_notes_updated_at
      BEFORE UPDATE ON notes
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- Optional: Migrate existing posts to notes (uncomment if you want to keep existing data)
-- DO $$
-- BEGIN
--   IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'posts') THEN
--     INSERT INTO notes (user_id, title, content, created_at, updated_at)
--     SELECT user_id, title, content, created_at, updated_at
--     FROM posts
--     ON CONFLICT DO NOTHING;
--   END IF;
-- END $$;