import { supabase } from './supabase'

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
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { data, error }
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export async function createPost(post: Omit<Post, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single()
  
  return { data, error }
}

export async function deletePost(postId: string, userId: string) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', userId)
  
  return { error }
} 