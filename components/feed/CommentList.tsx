'use client'

import { useState, useEffect } from 'react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getComments, addComment } from '@/app/feed/actions'
import type { CommentWithAuthor } from '@/lib/database.types'

interface CommentListProps {
  postId: string
  initialCommentsCount: number
}

export function CommentList({ postId, initialCommentsCount }: CommentListProps) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([])
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount)

  useEffect(() => {
    if (showComments && comments.length === 0) {
      loadComments()
    }
  }, [showComments])

  const loadComments = async () => {
    const result = await getComments(postId)
    if (!result.error) {
      setComments(result.comments)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    setError(null)

    const result = await addComment(postId, newComment)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setNewComment('')
      setLoading(false)
      setCommentsCount(prev => prev + 1)
      // Reload comments to show the new one
      await loadComments()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>{commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}</span>
      </Button>

      {showComments && (
        <div className="ml-4 space-y-3">
          <Separator />

          {/* Add comment form */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={loading}
              maxLength={500}
            />
            <Button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="bg-taxi-yellow hover:bg-taxi-yellow/90 text-black font-medium"
            >
              Post
            </Button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Comments list */}
          {comments.length > 0 && (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">
                      {comment.author?.name || 'Anonymous Driver'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          {comments.length === 0 && (
            <p className="text-sm text-gray-500 italic">No comments yet. Be the first to comment!</p>
          )}
        </div>
      )}
    </div>
  )
}
