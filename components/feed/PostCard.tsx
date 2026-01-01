'use client'

import { useState } from 'react'
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

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '24px'
  }

  const separatorStyle: React.CSSProperties = {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '16px 0',
    border: 'none'
  }

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#4b5563'
  }

  return (
    <div style={cardStyle}>
      {/* Post Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontWeight: '600', color: '#111827', margin: 0 }}>{post.profiles.name}</p>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
            {post.profiles.region} • {formatDate(post.created_at)}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <div style={{ marginTop: '16px' }}>
        <p style={{ color: '#1f2937', whiteSpace: 'pre-wrap', margin: 0 }}>{post.content}</p>
        
        {/* Link URL */}
        {post.link_url && (
          <a
            href={post.link_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '14px',
              color: '#2563eb',
              textDecoration: 'none',
              marginTop: '12px'
            }}
          >
            🔗 {new URL(post.link_url).hostname}
          </a>
        )}
      </div>

      <hr style={separatorStyle} />

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <LikeButton postId={post.id} userId={userId} onUpdate={onUpdate} />
        
        <button
          onClick={() => setShowComments(!showComments)}
          style={buttonStyle}
        >
          <MessageSquare style={{ width: '16px', height: '16px', marginRight: '4px' }} />
          {showComments ? 'Hide' : 'Show'} Comments
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <>
          <hr style={separatorStyle} />
          <CommentList postId={post.id} userId={userId} />
        </>
      )}
    </div>
  )
}
