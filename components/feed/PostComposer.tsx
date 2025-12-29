'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
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

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening in your driving world?"
            className="min-h-[120px] resize-none focus:ring-yellow-500 focus:border-yellow-500"
            disabled={loading}
          />
          <div className="flex justify-between items-center mt-2">
            <span className={`text-sm ${isOverLimit ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              {charCount} / 1000
            </span>
          </div>
        </div>

        <div>
          <Input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Add a link (optional)"
            className="focus:ring-yellow-500 focus:border-yellow-500"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !content.trim() || isOverLimit}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
        >
          {loading ? 'Posting...' : 'Post'}
        </Button>
      </form>
    </Card>
  )
}
