'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Types
interface Post {
  id: string
  author_id: string
  content: string
  link_url: string | null
  image_url: string | null
  region: string
  created_at: string
  profiles?: { name: string; region: string }
}

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles?: { name: string }
}

// Helper to extract YouTube video ID
const getYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export default function PostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [likeCount, setLikeCount] = useState(0)
  const [dislikeCount, setDislikeCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPost()
  }, [params.id])

  const loadPost = async () => {
    try {
      // Load post
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', params.id)
        .single()

      if (postError || !postData) {
        setError('Post not found')
        setLoading(false)
        return
      }

      // Load author profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, region')
        .eq('id', postData.author_id)
        .single()

      setPost({ ...postData, profiles: profileData })

      // Load comments
      const { data: commentsData } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', params.id)
        .order('created_at', { ascending: true })

      if (commentsData) {
        const commentsWithProfiles = await Promise.all(
          commentsData.map(async (comment) => {
            const { data: commentProfile } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', comment.user_id)
              .single()
            return { ...comment, profiles: commentProfile }
          })
        )
        setComments(commentsWithProfiles)
      }

      // Load like count
      const { count: likes } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', params.id)

      setLikeCount(likes || 0)

      // Load dislike count
      const { count: dislikes } = await supabase
        .from('post_dislikes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', params.id)

      setDislikeCount(dislikes || 0)

      setLoading(false)
    } catch (err) {
      setError('Failed to load post')
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <p style={{ fontSize: '18px', color: '#666' }}>Loading...</p>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        {/* Header */}
        <header style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '12px 16px'
        }}>
          <div style={{
            maxWidth: '680px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <a href="/feed" style={{ textDecoration: 'none' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                🚕 Driver Hub
              </h1>
            </a>
          </div>
        </header>

        <main style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '40px 20px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
              {error || 'Post not found'}
            </p>
            <a
              href="/feed"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#eab308',
                color: 'black',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600'
              }}
            >
              Go to Feed
            </a>
          </div>
        </main>
      </div>
    )
  }

  const youtubeId = post.link_url ? getYouTubeId(post.link_url) : null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 16px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '680px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <a href="/feed" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: 'black' }}>
              🚕 Driver Hub
            </h1>
          </a>
          <a
            href="/signin"
            style={{
              padding: '8px 16px',
              backgroundColor: '#eab308',
              color: 'black',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            Sign In
          </a>
        </div>
      </header>

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>
        {/* Post Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {/* Post Header */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: '600', fontSize: '15px' }}>
              {post.profiles?.name || 'Unknown Driver'}
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              {post.profiles?.region || post.region} • {formatDate(post.created_at)}
            </div>
          </div>

          {/* Post Content */}
          <p style={{ 
            margin: '0 0 12px 0', 
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap',
            fontSize: '15px'
          }}>
            {post.content}
          </p>

          {/* Post Image */}
          {post.image_url && (
            <div style={{ marginBottom: '12px' }}>
              <img
                src={post.image_url}
                alt="Post image"
                style={{
                  width: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  backgroundColor: '#f3f4f6'
                }}
              />
            </div>
          )}

          {/* YouTube Embed */}
          {youtubeId && (
            <div style={{ marginBottom: '12px' }}>
              <iframe
                width="100%"
                height="200"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ borderRadius: '8px' }}
              />
            </div>
          )}

          {/* Regular Link */}
          {post.link_url && !youtubeId && (
            <a
              href={post.link_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '10px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                marginBottom: '12px',
                textDecoration: 'none',
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{ 
                color: '#2563eb', 
                fontSize: '13px',
                wordBreak: 'break-all'
              }}>
                🔗 {post.link_url}
              </div>
            </a>
          )}

          {/* Stats */}
          <div style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '10px',
            display: 'flex',
            gap: '16px'
          }}>
            <span style={{ color: '#666', fontSize: '14px' }}>
              👍 {likeCount}
            </span>
            <span style={{ color: '#666', fontSize: '14px' }}>
              👎 {dislikeCount}
            </span>
            <span style={{ color: '#666', fontSize: '14px' }}>
              💬 {comments.length}
            </span>
          </div>
        </div>

        {/* Comments Section */}
        {comments.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
              Comments ({comments.length})
            </h3>
            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  padding: '10px',
                  marginBottom: '8px'
                }}
              >
                <div style={{ 
                  fontWeight: '600', 
                  fontSize: '13px',
                  marginBottom: '4px'
                }}>
                  {comment.profiles?.name || 'Anonymous'}
                  <span style={{ 
                    fontWeight: '400', 
                    color: '#999',
                    marginLeft: '8px'
                  }}>
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '14px' }}>{comment.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Join CTA */}
        <div style={{
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#92400e' }}>
            Join Driver Hub to like, comment, and share your own posts!
          </p>
          <a
            href="/signin"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#eab308',
              color: 'black',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600'
            }}
          >
            Sign Up / Sign In
          </a>
        </div>
      </main>
    </div>
  )
}
