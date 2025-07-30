import { createClientComponentClient } from './supabase'

// Example database types
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
}

export interface Note {
  id: string
  title: string
  content: string
  category: string
  user_id: string
  created_at: string
  updated_at: string
}

// Example database functions
export async function getProfile(userId: string) {
  try {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  try {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getNotes() {
  try {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false })
    
    return { data, error }
  } catch (error) {
    console.error('Database getNotes catch error:', error)
    return { data: null, error }
  }
}

export async function createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase
      .from('notes')
      .insert(note)
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    console.error('Database createNote catch error:', error)
    return { data: null, error }
  }
}

export async function updateNote(noteId: string, userId: string, updates: Partial<Pick<Note, 'title' | 'content' | 'category'>>) {
  try {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', noteId)
      .eq('user_id', userId)
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    console.error('Database updateNote catch error:', error)
    return { data: null, error }
  }
}

export async function deleteNote(noteId: string, userId: string) {
  try {
    const supabase = createClientComponentClient()
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', userId)
    
    return { error }
  } catch (error) {
    return { error }
  }
} 