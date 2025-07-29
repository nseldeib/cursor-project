

'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { LogIn, LogOut, User as UserIcon } from 'lucide-react'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<any>(null)
  const [envDebug, setEnvDebug] = useState<any>(null)

  useEffect(() => {
    // Debug environment variables
    const debugEnv = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      urlStartsWith: process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') || false,
      keyStartsWith: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ') || false,
      urlEmpty: process.env.NEXT_PUBLIC_SUPABASE_URL === '',
      keyEmpty: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === '',
      urlUndefined: process.env.NEXT_PUBLIC_SUPABASE_URL === undefined,
      keyUndefined: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === undefined,
    }
    setEnvDebug(debugEnv)
    console.log('🔍 Environment Debug:', debugEnv)

    // Dynamically import Supabase client to avoid SSR issues
    const initSupabase = async () => {
      try {
        console.log('Initializing Supabase client...')
        console.log('Environment variables check:', {
          url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        })
        // Test direct access to environment variables
        const testUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const testKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        console.log('Direct env check:', {
          url: testUrl,
          key: testKey,
          urlLength: testUrl?.length || 0,
          keyLength: testKey?.length || 0
        })
        
        console.log('Direct test:', {
          testUrl,
          testKey: testKey ? `${testKey.substring(0, 20)}...` : 'undefined',
          testUrlType: typeof testUrl,
          testKeyType: typeof testKey
        })
        
        const { createClientComponentClient } = await import('@/lib/supabase')
        const client = createClientComponentClient()
        console.log('Supabase client created successfully')
        setSupabase(client)
      } catch (error) {
        console.error('Error initializing Supabase:', error)
        // Set loading to false even if Supabase fails to initialize
        setLoading(false)
      }
    }

    initSupabase()
  }, [])

  useEffect(() => {
    if (!supabase) {
      // If Supabase is not initialized, set loading to false after a timeout
      const timer = setTimeout(() => {
        setLoading(false)
      }, 2000)
      return () => clearTimeout(timer)
    }

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
    const { data: { subscription } = {} } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your app...</p>
        </div>
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

          {/* Debug Section */}
          {envDebug && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8 text-left">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                🔍 Environment Debug Info
              </h3>
              <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <div>URL Set: {envDebug.url ? '✅' : '❌'} ({envDebug.urlLength} chars)</div>
                <div>Key Set: {envDebug.key ? '✅' : '❌'} ({envDebug.keyLength} chars)</div>
                <div>URL HTTPS: {envDebug.urlStartsWith ? '✅' : '❌'}</div>
                <div>Key Format: {envDebug.keyStartsWith ? '✅' : '❌'}</div>
                <div>URL Empty: {envDebug.urlEmpty ? '❌' : '✅'}</div>
                <div>Key Empty: {envDebug.keyEmpty ? '❌' : '✅'}</div>
                <div>URL Undefined: {envDebug.urlUndefined ? '❌' : '✅'}</div>
                <div>Key Undefined: {envDebug.keyUndefined ? '❌' : '✅'}</div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {!supabase ? (
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    ⚠️ Supabase connection not available. Please check your environment variables.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your Vercel environment variables.
                  </p>
                </div>
              ) : user ? (
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
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {/* Database Example */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Next.js 14
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Built with the latest Next.js features including App Router
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Supabase Auth
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Secure authentication with OAuth providers
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                TypeScript
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Full TypeScript support for better development experience
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 