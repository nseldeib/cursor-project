'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { createClientComponentClient } from '@/lib/supabase'
import { getNotes, createNote, updateNote, deleteNote, Note } from '@/lib/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Search, Edit3, Trash2, BookOpen, Hash, Calendar } from 'lucide-react'

const CATEGORIES = [
  { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-800' },
  { value: 'work', label: 'Work', color: 'bg-blue-100 text-blue-800' },
  { value: 'personal', label: 'Personal', color: 'bg-green-100 text-green-800' },
  { value: 'ideas', label: 'Ideas', color: 'bg-purple-100 text-purple-800' },
  { value: 'todo', label: 'Todo', color: 'bg-orange-100 text-orange-800' },
]

export default function NoteApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [supabase, setSupabase] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'general' })

  useEffect(() => {
    const initSupabase = async () => {
      try {
        const client = createClientComponentClient()
        setSupabase(client)
        const { data: { session } } = await client.auth.getSession()
        setUser(session?.user ?? null)
        if (session?.user) {
          loadNotes()
        }
      } catch (error) {
        console.error('Error initializing Supabase in NoteApp:', error)
        setLoading(false)
      }
    }
    initSupabase()
  }, [])

  useEffect(() => {
    filterNotes()
  }, [notes, searchTerm, selectedCategory])

  const loadNotes = async () => {
    setLoading(true)
    const { data, error } = await getNotes()
    if (data) {
      setNotes(data)
    }
    if (error) {
      console.error('Error loading notes:', error)
    }
    setLoading(false)
  }

  const filterNotes = () => {
    let filtered = notes

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(note => note.category === selectedCategory)
    }

    setFilteredNotes(filtered)
  }

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newNote.title.trim()) return

    const { data, error } = await createNote({
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      user_id: user.id
    })

    if (error) {
      console.error('Error creating note:', error)
      alert(`Error creating note: ${error}`)
    } else {
      setNewNote({ title: '', content: '', category: 'general' })
      setShowNewNoteDialog(false)
      loadNotes()
    }
  }

  const handleUpdateNote = async () => {
    if (!user || !selectedNote) return

    const { data, error } = await updateNote(selectedNote.id, user.id, {
      title: selectedNote.title,
      content: selectedNote.content,
      category: selectedNote.category
    })

    if (error) {
      console.error('Error updating note:', error)
      alert(`Error updating note: ${error}`)
    } else {
      setIsEditing(false)
      loadNotes()
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return

    const { error } = await deleteNote(noteId, user.id)
    if (error) {
      console.error('Error deleting note:', error)
    } else {
      if (selectedNote?.id === noteId) {
        setSelectedNote(null)
      }
      loadNotes()
    }
  }

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(cat => cat.value === category) || CATEGORIES[0]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              My Notes
            </h2>
            <Dialog open={showNewNoteDialog} onOpenChange={setShowNewNoteDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Note</DialogTitle>
                  <DialogDescription>
                    Add a new note to your collection
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateNote} className="space-y-4">
                  <Input
                    placeholder="Note title..."
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    required
                  />
                  <select
                    value={newNote.category}
                    onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <Textarea
                    placeholder="Start writing your note..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    rows={4}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowNewNoteDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Note</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Categories</div>
            <div className="flex flex-wrap gap-1">
              <Badge
                variant={selectedCategory === 'all' ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Badge>
              {CATEGORIES.map(cat => (
                <Badge
                  key={cat.value}
                  variant={selectedCategory === cat.value ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              {notes.length === 0 ? 'No notes yet' : 'No notes match your search'}
            </div>
          ) : (
            filteredNotes.map(note => {
              const categoryInfo = getCategoryInfo(note.category)
              return (
                <Card
                  key={note.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    selectedNote?.id === note.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedNote(note)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium truncate">
                        {note.title}
                      </CardTitle>
                      <Badge className={`text-xs ${categoryInfo.color} shrink-0 ml-2`}>
                        {categoryInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {note.content || 'No content'}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(note.updated_at)}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* Note Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={getCategoryInfo(selectedNote.category).color}>
                    {getCategoryInfo(selectedNote.category).label}
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Updated {formatDate(selectedNote.updated_at)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                  {isEditing && (
                    <Button size="sm" onClick={handleUpdateNote}>
                      Save Changes
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Note</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{selectedNote.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteNote(selectedNote.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>

            {/* Note Content */}
            <div className="flex-1 p-4 bg-white dark:bg-gray-800 overflow-y-auto">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    value={selectedNote.title}
                    onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
                    className="text-lg font-semibold"
                    placeholder="Note title..."
                  />
                  <select
                    value={selectedNote.category}
                    onChange={(e) => setSelectedNote({ ...selectedNote, category: e.target.value })}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <Textarea
                    value={selectedNote.content}
                    onChange={(e) => setSelectedNote({ ...selectedNote, content: e.target.value })}
                    placeholder="Write your note here..."
                    className="min-h-96 resize-none"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {selectedNote.title}
                  </h1>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                      {selectedNote.content || 'This note is empty. Click Edit to add content.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a note to view
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a note from the sidebar or create a new one to get started.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}