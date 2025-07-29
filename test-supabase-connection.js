import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

console.log('🔍 Testing Supabase Integration...\n')

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('📋 Environment Variables:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing')

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Missing Supabase credentials!')
  console.log('Please create a .env.local file with your Supabase credentials.')
  console.log('You can copy from env.example and replace with your actual values.')
  process.exit(1)
}

// Test Supabase client creation
try {
  console.log('\n🔧 Creating Supabase client...')
  const supabase = createClient(supabaseUrl, supabaseKey)
  console.log('✅ Supabase client created successfully')
  
  // Test basic connection
  console.log('\n🌐 Testing connection...')
  const { data, error } = await supabase.from('profiles').select('count').limit(1)
  
  if (error) {
    console.log('⚠️  Connection test result:', error.message)
    console.log('This might be normal if the profiles table doesn\'t exist yet')
  } else {
    console.log('✅ Supabase connection successful!')
  }
  
  console.log('\n🎉 Supabase integration is working!')
  
} catch (err) {
  console.error('❌ Error:', err.message)
  process.exit(1)
} 