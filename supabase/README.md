# Database Setup for Note-Taking App

This directory contains the SQL scripts needed to set up your Supabase database for the note-taking application.

## Quick Setup

1. **Run the notes schema** (recommended for new installations):
   ```sql
   -- Copy and paste the contents of notes-schema.sql into the Supabase SQL Editor
   ```

2. **Or run the original schema** (if you want to keep the existing posts structure):
   ```sql
   -- Copy and paste the contents of schema.sql into the Supabase SQL Editor
   ```

## Files

- `schema.sql` - Original schema with profiles and posts tables
- `notes-schema.sql` - Enhanced schema for note-taking with categories and auto-updating timestamps
- `setup-email-auth.md` - Instructions for configuring email authentication

## Schema Overview

### Tables Created

#### `profiles` table
- User profile information
- Linked to Supabase auth.users
- Automatically populated on user signup

#### `notes` table (replaces posts)
- `id` - Unique identifier
- `user_id` - Reference to the user who owns the note
- `title` - Note title (defaults to "Untitled Note")
- `content` - Note content (can be empty)
- `category` - Note category (general, work, personal, ideas, todo)
- `created_at` - When the note was created
- `updated_at` - When the note was last modified (auto-updated)

### Security

- Row Level Security (RLS) is enabled on both tables
- Users can only see and modify their own data
- Policies are automatically created for SELECT, INSERT, UPDATE, and DELETE operations

### Features

- **Auto-updating timestamps**: The `updated_at` field is automatically updated whenever a note is modified
- **Categories**: Built-in support for organizing notes by category
- **Search-friendly**: Indexed for fast searching by user, creation date, category, and update date
- **Idempotent**: Scripts can be run multiple times safely without creating duplicates

## Migration from Posts to Notes

If you already have posts and want to migrate to notes, uncomment the migration section at the bottom of `notes-schema.sql` before running it.

## Environment Variables Required

Make sure your `.env.local` file has:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```