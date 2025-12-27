'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createPost } from '@/app/feed/actions'

export function PostComposer() {
  const [content, setContent] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('content', content)
    formData.append('link_url', linkUrl)

    const result = await createPost(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      // Clear form on success
      setContent('')
      setLinkUrl('')
      setLoading(false)
      formRef.current?.reset()
    }
  }

  const charCount = content.length
  const isOverLimit = charCount > 1000

  return (
    <Card>
      <CardContent className="pt-6">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="What's happening in your driving world?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={loading}
            />
            <div className={`text-xs mt-1 text-right ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
              {charCount} / 1000
            </div>
          </div>

          <div>
            <Input
              type="url"
              placeholder="Add a link (optional)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading || !content.trim() || isOverLimit}
              className="bg-taxi-yellow hover:bg-taxi-yellow/90 text-black font-medium"
            >
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
