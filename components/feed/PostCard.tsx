'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import LikeButton from './LikeButton'
import CommentList from './CommentList'
import { MessageSquare } from 'lucide-react'

interface PostCardProps {
  post: {
    id: string
    author_id: string
    content: string
    link_url: string | null
    region: string
    created_at: string
    profiles: {
      name: string
      region: string
    }
  }
  userId: string
  onUpdate: () => void
}

export default function PostCard({ post, userId, onUpdate }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  return (
    <Card className="p-6 space-y-4">
      {/* Post Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-gray-900">{post.profiles.name}</p>
          <p className="text-sm text-gray-500">
            {post.profiles.region} • {formatDate(post.created_at)}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-3">
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        
        {/* Link URL */}
        {post.link_url && (
          <a
            href={post.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            🔗 {new URL(post.link_url).hostname}
          </a>
        )}
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex items-center gap-4">
        <LikeButton postId={post.id} userId={userId} onUpdate={onUpdate} />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="text-gray-600 hover:text-gray-900"
        >
          <MessageSquare className="w-4 h-4 mr-1" />
          {showComments ? 'Hide' : 'Show'} Comments
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <>
          <Separator />
          <CommentList postId={post.id} userId={userId} />
        </>
      )}
    </Card>
  )
}
