'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import PostCard from './PostCard'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Post {
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

interface PostListProps {
  userId: string
  userRegion: string
}

export default function PostList({ userId, userRegion }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'my-region'>('all')

  useEffect(() => {
    loadPosts()
  }, [filter])

  const loadPosts = async () => {
    setLoading(true)

    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_author_id_fkey (
          name,
          region
        )
      `)
      .order('created_at', { ascending: false })

    // Apply region filter
    if (filter === 'my-region') {
      query = query.eq('region', userRegion)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading posts:', error)
    } else {
      setPosts(data || [])
    }

    setLoading(false)
  }

  const handlePostUpdate = () => {
    loadPosts()
  }

  const tabContainerStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '16px'
  }

  const tabsWrapperStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    padding: '4px'
  }

  const getTabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: isActive ? '#eab308' : 'transparent',
    color: isActive ? 'black' : '#6b7280',
    transition: 'all 0.2s'
  })

  const loadingStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '32px',
    textAlign: 'center'
  }

  if (loading) {
    return (
      <div style={loadingStyle}>
        <p style={{ color: '#6b7280', margin: 0 }}>Loading posts...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Region Filter */}
      <div style={tabContainerStyle}>
        <div style={tabsWrapperStyle}>
          <button
            onClick={() => setFilter('all')}
            style={getTabStyle(filter === 'all')}
          >
            All UK
          </button>
          <button
            onClick={() => setFilter('my-region')}
            style={getTabStyle(filter === 'my-region')}
          >
            My Region ({userRegion})
          </button>
        </div>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div style={loadingStyle}>
          <p style={{ color: '#6b7280', margin: 0 }}>
            {filter === 'my-region' 
              ? `No posts from ${userRegion} yet. Be the first to share!`
              : 'No posts yet. Be the first to share something!'
            }
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              userId={userId}
              onUpdate={handlePostUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
