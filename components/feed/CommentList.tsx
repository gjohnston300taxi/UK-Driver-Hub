'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: {
    name: string
  }
}

interface CommentListProps {
  postId: string
  userId: string
}

export default function CommentList({ postId, userId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadComments()
  }, [postId])

  const loadComments = async () => {
    setLoading(true)

    const { data, error: fetchError } = await supabase
      .from('post_comments')
      .select(`
        *,
        profiles!post_comments_user_id_fkey (name)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('Error loading comments:', fetchError)
    } else {
      setComments(data || [])
    }

    setLoading(false)
  }

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('post_comments')
        .insert([
          {
            post_id: postId,
            user_id: userId,
            content: newComment.trim()
          }
        ])

      if (insertError) throw insertError

      setNewComment('')
      await loadComments()
    } catch (err: any) {
      setError(err.message || 'Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short'
    })
  }

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <form onSubmit={addComment} className="flex gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          disabled={submitting}
          className="flex-1 focus:ring-yellow-500 focus:border-yellow-500"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              addComment(e)
            }
          }}
        />
        <Button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          {submitting ? 'Posting...' : 'Comment'}
        </Button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <p className="text-sm text-gray-500 text-center py-4">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment, index) => (
            <div key={comment.id}>
              {index > 0 && <Separator className="my-3" />}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-gray-900">
                    {comment.profiles.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(comment.created_at)}
                  </p>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
