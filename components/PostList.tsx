'use client'

import { useState, useEffect } from 'react'
import { getPosts, createPost, deletePost, Post } from '@/lib/database'
import { createClientComponentClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { Plus, Trash2 } from 'lucide-react'

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [newPost, setNewPost] = useState({ title: '', content: '' })
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }

    getUser()

    // Load posts
    loadPosts()
  }, [])

  const loadPosts = async () => {
    setLoading(true)
    const { data, error } = await getPosts()
    if (data) {
      setPosts(data)
    }
    if (error) {
      console.error('Error loading posts:', error)
    }
    setLoading(false)
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newPost.title || !newPost.content) return

    const { error } = await createPost({
      title: newPost.title,
      content: newPost.content,
      user_id: user.id
    })

    if (error) {
      console.error('Error creating post:', error)
    } else {
      setNewPost({ title: '', content: '' })
      loadPosts()
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!user) return

    const { error } = await deletePost(postId, user.id)
    if (error) {
      console.error('Error deleting post:', error)
    } else {
      loadPosts()
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Posts
      </h2>

      {user && (
        <form onSubmit={handleCreatePost} className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Create New Post
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Post title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
            <textarea
              placeholder="Post content"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
            <button
              type="submit"
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Post</span>
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
              {user && post.user_id === user.id && (
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {post.content}
            </p>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No posts yet. {user ? 'Create the first one!' : 'Sign in to create posts.'}
        </div>
      )}
    </div>
  )
} 