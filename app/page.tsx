

'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { LogIn, LogOut, User as UserIcon, Mail, Github } from 'lucide-react'
import NoteApp from '@/components/NoteApp'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [authMessage, setAuthMessage] = useState('')

  useEffect(() => {
    // Dynamically import Supabase client to avoid SSR issues
    const initSupabase = async () => {
      try {
        const { createClientComponentClient } = await import('@/lib/supabase')
        const client = createClientComponentClient()
        setSupabase(client)
      } catch (error) {
        console.error('Error initializing Supabase:', error)
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

  const handleGitHubSignIn = async () => {
    if (!supabase) return
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      if (error) {
        console.error('Error signing in:', error.message)
        setAuthMessage(`GitHub sign-in error: ${error.message}`)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setAuthMessage('GitHub sign-in failed. Try email authentication instead.')
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase || !email || !password) return

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        setAuthMessage(`Sign in error: ${error.message}`)
      } else {
        setAuthMessage('')
        setEmail('')
        setPassword('')
        setShowEmailForm(false)
      }
    } catch (error) {
      console.error('Email sign in error:', error)
      setAuthMessage('Email sign-in failed')
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase || !email || !password) return

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: email.split('@')[0] // Use email prefix as name
          }
        }
      })
      
      if (error) {
        setAuthMessage(`Sign up error: ${error.message}`)
      } else {
        setAuthMessage('Account created successfully! You can now sign in.')
        setEmail('')
        setPassword('')
        setShowEmailForm(false)
      }
    } catch (error) {
      console.error('Email sign up error:', error)
      setAuthMessage('Email sign-up failed')
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
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
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                  Get started by signing in with your preferred method
                </p>

                {authMessage && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">{authMessage}</p>
                  </div>
                )}

                {!showEmailForm ? (
                  <div className="space-y-3">
                    <button
                      onClick={handleGitHubSignIn}
                      className="flex items-center justify-center space-x-2 w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                      <Github className="w-5 h-5" />
                      <span>Sign In with GitHub</span>
                    </button>

                    <button
                      onClick={() => setShowEmailForm(true)}
                      className="flex items-center justify-center space-x-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span>Sign In with Email</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        💡 <strong>Demo Account:</strong> Use any email/password to create an account instantly!
                      </p>
                    </div>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={handleEmailSignUp}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Sign Up
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEmailForm(false)}
                      className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      ← Back to other options
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

                      {/* Show NoteApp only when user is signed in */}
            {user && <NoteApp />}

          {/* Show features grid only when user is not signed in */}
          {!user && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
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
          )}
        </div>
      </div>
    </div>
  )
} 