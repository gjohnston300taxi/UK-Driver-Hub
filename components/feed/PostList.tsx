'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">Loading posts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Region Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'my-region')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              All UK
            </TabsTrigger>
            <TabsTrigger 
              value="my-region"
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              My Region ({userRegion})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">
            {filter === 'my-region' 
              ? `No posts from ${userRegion} yet. Be the first to share!`
              : 'No posts yet. Be the first to share something!'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
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
