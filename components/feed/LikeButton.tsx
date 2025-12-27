'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toggleLike } from '@/app/feed/actions'

interface LikeButtonProps {
  postId: string
  initialLikesCount: number
  initialLiked: boolean
}

export function LikeButton({ postId, initialLikesCount, initialLiked }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isPending, startTransition] = useTransition()

  const handleToggleLike = () => {
    // Optimistic update
    const newLiked = !liked
    setLiked(newLiked)
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1)

    startTransition(async () => {
      const result = await toggleLike(postId)

      if (result.error) {
        // Revert optimistic update on error
        setLiked(!newLiked)
        setLikesCount(prev => newLiked ? prev - 1 : prev + 1)
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleLike}
      disabled={isPending}
      className={`gap-2 ${liked ? 'text-taxi-yellow hover:text-taxi-yellow/80' : ''}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span>{likesCount}</span>
    </Button>
  )
}
