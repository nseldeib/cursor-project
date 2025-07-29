

'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { LogIn, LogOut, User as UserIcon } from 'lucide-react'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    // Dynamically import Supabase client to avoid SSR issues
    const initSupabase = async () => {
      try {
        const { createClientComponentClient } = await import('@/lib/supabase')
        const client = createClientComponentClient()
        setSupabase(client)
      } catch (error) {
        console.error('Error initializing Supabase:', error)
      }
    }
    
    initSupabase()
  }, [])

  useEffect(() => {
    if (!supabase) return

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignIn = async () => {
    if (!supabase) return
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) console.error('Error signing in:', error.message)
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  const handleSignOut = async () => {
    if (!supabase) return
    try {
      const { error } = await supabase.auth.signOut()
      if (error) console.error('Error signing out:', error.message)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Welcome to Next.js + Supabase
          </h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <UserIcon className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Signed in successfully
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center space-x-2 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Get started by signing in with your GitHub account
                </p>
                
                <button
                  onClick={handleSignIn}
                  className="flex items-center justify-center space-x-2 w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Sign In with GitHub</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Next.js 14
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Built with the latest Next.js features including App Router
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Supabase Auth
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Secure authentication with OAuth providers
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                TypeScript
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Full TypeScript support for better development experience
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 