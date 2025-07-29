import { createClient } from '@supabase/supabase-js'

// Check environment variables first
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase environment check:', {
  url: supabaseUrl ? 'set' : 'missing',
  key: supabaseAnonKey ? 'set' : 'missing',
  urlValue: supabaseUrl,
  keyValue: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined'
})

// Simple client-side Supabase client
export const createClientComponentClient = () => {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.trim() === '' || supabaseAnonKey.trim() === '') {
    console.error('Environment variables are empty:', {
      url: supabaseUrl,
      key: supabaseAnonKey,
      urlEmpty: supabaseUrl === '',
      keyEmpty: supabaseAnonKey === '',
      urlTrimmedEmpty: supabaseUrl?.trim() === '',
      keyTrimmedEmpty: supabaseAnonKey?.trim() === ''
    })
    throw new Error('Missing Supabase environment variables')
  }
  
  console.log('Creating Supabase client with URL:', supabaseUrl)
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Server-side client (only create if environment variables are available)
export const supabase = supabaseUrl && supabaseAnonKey ? 
  createClient(supabaseUrl, supabaseAnonKey) : 
  null

// Server-side client with service role key
export const supabaseAdmin = supabaseUrl && process.env.SUPABASE_SERVICE_ROLE_KEY ? 
  createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY) : 
  null 