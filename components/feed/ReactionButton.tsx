'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const REACTIONS = [
  { emoji: '👍', label: 'Like' },
  { emoji: '👎', label: 'Dislike' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Funny' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
]

interface ReactionCounts {
  [emoji: string]: number
}

interface ReactionButtonProps {
  postId: string
  userId: string
  onUpdate: () => void
}

export default function ReactionButton({ postId, userId, onUpdate }: ReactionButtonProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [userReaction, setUserReaction] = useState<string | null>(null)
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>({})
  const [loading, setLoading] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadReactions()
  }, [postId])

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadReactions = async () => {
    // Get all reactions for this post
    const { data } = await supabase
      .from('post_reactions')
      .select('emoji, user_id')
      .eq('post_id', postId)

    if (data) {
      // Count each emoji
      const counts: ReactionCounts = {}
      data.forEach(row => {
        counts[row.emoji] = (counts[row.emoji] || 0) + 1
        if (row.user_id === userId) {
          setUserReaction(row.emoji)
        }
      })
      setReactionCounts(counts)
    }
  }

  const handleReaction = async (emoji: string) => {
    if (loading) return
    setLoading(true)
    setShowPicker(false)

    try {
      if (userReaction === emoji) {
        // Remove reaction if clicking same one
        await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)
        setUserReaction(null)
      } else {
        // Remove old reaction if exists
        if (userReaction) {
          await supabase
            .from('post_reactions')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', userId)
        }
        // Add new reaction
        await supabase
          .from('post_reactions')
          .insert([{ post_id: postId, user_id: userId, emoji }])
        setUserReaction(emoji)
      }

      await loadReactions()
      onUpdate()
    } catch (error) {
      console.error('Error setting reaction:', error)
    } finally {
      setLoading(false)
    }
  }

  // Total reaction count
  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0)

  return (
    <div ref={pickerRef} style={{ position: 'relative', display: 'inline-block' }}>

      {/* Main reaction button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          backgroundColor: userReaction ? '#fef9c3' : 'transparent',
          border: userReaction ? '1px solid #fde68a' : '1px solid transparent',
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: '14px',
          color: userReaction ? '#92400e' : '#4b5563',
          transition: 'all 0.2s',
        }}
      >
        <span style={{ fontSize: '18px' }}>{userReaction || '👍'}</span>
        <span>{userReaction ? REACTIONS.find(r => r.emoji === userReaction)?.label : 'React'}</span>
        {totalReactions > 0 && (
          <span style={{
            backgroundColor: '#f3f4f6',
            borderRadius: '10px',
            padding: '1px 7px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151'
          }}>
            {totalReactions}
          </span>
        )}
      </button>

      {/* Reaction counts summary (show top reactions) */}
      {totalReactions > 0 && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
          {REACTIONS.filter(r => reactionCounts[r.emoji] > 0).map(r => (
            <span
              key={r.emoji}
              title={`${reactionCounts[r.emoji]} ${r.label}`}
              style={{ fontSize: '14px', cursor: 'default' }}
            >
              {r.emoji}
            </span>
          ))}
        </div>
      )}

      {/* Emoji picker popup */}
      {showPicker && (
        <div style={{
          position: 'absolute',
          bottom: '44px',
          left: '0',
          backgroundColor: 'white',
          borderRadius: '50px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          padding: '8px 12px',
          display: 'flex',
          gap: '4px',
          zIndex: 100,
          border: '1px solid #e5e7eb'
        }}>
          {REACTIONS.map(({ emoji, label }) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              title={label}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '26px',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '50%',
                transition: 'transform 0.15s',
                transform: userReaction === emoji ? 'scale(1.3)' : 'scale(1)',
                backgroundColor: userReaction === emoji ? '#fef9c3' : 'transparent',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.4)')}
              onMouseLeave={e => (e.currentTarget.style.transform = userReaction === emoji ? 'scale(1.3)' : 'scale(1)')}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
