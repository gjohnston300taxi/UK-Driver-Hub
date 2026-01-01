'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface PostComposerProps {
  userId: string
  userRegion: string
}

export default function PostComposer({ userId, userRegion }: PostComposerProps) {
  const [content, setContent] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (!content.trim()) {
      setError('Post content cannot be empty')
      setLoading(false)
      return
    }

    if (content.length > 1000) {
      setError('Post content must be 1000 characters or less')
      setLoading(false)
      return
    }

    try {
      const { error: insertError } = await supabase
        .from('posts')
        .insert([
          {
            author_id: userId,
            content: content.trim(),
            link_url: linkUrl.trim() || null,
            region: userRegion
          }
        ])

      if (insertError) {
        throw insertError
      }

      // Clear form
      setContent('')
      setLinkUrl('')
      
      // Refresh the page to show new post
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  const charCount = content.length
  const isOverLimit = charCount > 1000

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '24px'
  }

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '120px',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '16px',
    resize: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '16px',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  }

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    backgroundColor: loading || !content.trim() || isOverLimit ? '#d1d5db' : '#eab308',
    color: loading || !content.trim() || isOverLimit ? '#6b7280' : 'black',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: loading || !content.trim() || isOverLimit ? 'not-allowed' : 'pointer'
  }

  return (
    <div style={cardStyle}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening in your driving world?"
            style={textareaStyle}
            disabled={loading}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ 
              fontSize: '14px', 
              color: isOverLimit ? '#dc2626' : '#6b7280',
              fontWeight: isOverLimit ? '500' : 'normal'
            }}>
              {charCount} / 1000
            </span>
          </div>
        </div>

        <div>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Add a link (optional)"
            style={inputStyle}
            disabled={loading}
          />
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '12px 16px',
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !content.trim() || isOverLimit}
          style={buttonStyle}
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  )
}
