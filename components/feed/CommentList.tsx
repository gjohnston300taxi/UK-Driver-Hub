'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Comment Input */}
      <form onSubmit={addComment} style={{ display: 'flex', gap: '8px' }}>
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          disabled={submitting}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none'
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              addComment(e)
            }
          }}
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: submitting || !newComment.trim() ? '#d1d5db' : '#eab308',
            color: 'black',
            border: 'none',
            borderRadius: '6px',
            cursor: submitting || !newComment.trim() ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            fontSize: '14px'
          }}
        >
          {submitting ? 'Posting...' : 'Comment'}
        </button>
      </form>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', padding: '16px 0' }}>
          Loading comments...
        </p>
      ) : comments.length === 0 ? (
        <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', padding: '16px 0' }}>
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {comments.map((comment, index) => (
            <div key={comment.id}>
              {index > 0 && <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '12px 0' }} />}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontWeight: '600', fontSize: '14px', color: '#111827', margin: 0 }}>
                    {comment.profiles.name}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                    {formatDate(comment.created_at)}
                  </p>
                </div>
                <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
