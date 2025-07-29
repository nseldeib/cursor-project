import { createClientComponentClient } from './supabase'

// Example database types
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
}

export interface Post {
  id: string
  title: string
  content: string
  user_id: string
  created_at: string
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

export async function getPosts() {
  try {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    return { data, error }
  } catch (error) {
    console.error('Database getPosts catch error:', error)
    return { data: null, error }
  }
}

export async function createPost(post: Omit<Post, 'id' | 'created_at'>) {
  try {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    console.error('Database createPost catch error:', error)
    return { data: null, error }
  }
}

export async function deletePost(postId: string, userId: string) {
  try {
    const supabase = createClientComponentClient()
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId)
    
    return { error }
  } catch (error) {
    return { error }
  }
} 