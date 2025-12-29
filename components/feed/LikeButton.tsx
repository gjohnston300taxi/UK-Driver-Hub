'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface LikeButtonProps {
  postId: string
  userId: string
  onUpdate: () => void
}

export default function LikeButton({ postId, userId, onUpdate }: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadLikes()
  }, [postId])

  const loadLikes = async () => {
    // Get total like count
    const { count } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)

    setLikeCount(count || 0)

    // Check if current user has liked
    const { data } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    setHasLiked(!!data)
  }

  const toggleLike = async () => {
    if (loading) return

    setLoading(true)

    // Optimistic UI update
    const previousHasLiked = hasLiked
    const previousCount = likeCount

    setHasLiked(!hasLiked)
    setLikeCount(hasLiked ? likeCount - 1 : likeCount + 1)

    try {
      if (hasLiked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)

        if (error) throw error
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert([{ post_id: postId, user_id: userId }])

        if (error) {
          // Handle unique constraint violation (already liked)
          if (error.code === '23505') {
            // Just reload the actual state
            await loadLikes()
          } else {
            throw error
          }
        }
      }

      // Reload to ensure accuracy
      await loadLikes()
      onUpdate()
    } catch (error) {
      console.error('Error toggling like:', error)
      
      // Revert optimistic update on error
      setHasLiked(previousHasLiked)
      setLikeCount(previousCount)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLike}
      disabled={loading}
      className={`${
        hasLiked 
          ? 'text-yellow-600 hover:text-yellow-700' 
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      <Heart 
        className={`w-4 h-4 mr-1 ${hasLiked ? 'fill-yellow-600' : ''}`}
      />
      {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
    </Button>
  )
}
