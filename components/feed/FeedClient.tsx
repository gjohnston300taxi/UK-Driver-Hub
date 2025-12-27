'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PostComposer } from './PostComposer'
import { PostList } from './PostList'
import { getPosts } from '@/app/feed/actions'
import type { PostWithAuthor } from '@/lib/database.types'

interface FeedClientProps {
  initialPosts: PostWithAuthor[]
  userRegion: string | null
}

export function FeedClient({ initialPosts, userRegion }: FeedClientProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'my-region'>('all')
  const [posts, setPosts] = useState<PostWithAuthor[]>(initialPosts)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true)
      const result = await getPosts(activeTab)
      if (!result.error) {
        setPosts(result.posts)
      }
      setLoading(false)
    }

    // Only reload if we're switching tabs (not on initial mount)
    if (activeTab !== 'all' || posts !== initialPosts) {
      loadPosts()
    }
  }, [activeTab])

  return (
    <div className="space-y-6">
      {/* Region filter */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Driver Feed</h1>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'my-region')}>
          <TabsList>
            <TabsTrigger value="all">All UK</TabsTrigger>
            <TabsTrigger value="my-region" disabled={!userRegion}>
              My Region {userRegion ? `(${userRegion})` : ''}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Post composer */}
      <PostComposer />

      {/* Posts feed */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-taxi-yellow border-r-transparent"></div>
          <p className="mt-4 text-gray-500">Loading posts...</p>
        </div>
      ) : (
        <PostList posts={posts} />
      )}
    </div>
  )
}
