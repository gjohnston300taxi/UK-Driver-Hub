'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  image_url: string | null
  created_at: string
  updated_at: string
  profiles?: { name: string }
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (slug) {
      loadPost()
    }
  }, [slug])

  const loadPost = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error || !data) {
      setNotFound(true)
    } else {
      // Load author name
      if (data.author_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', data.author_id)
          .single()
        setPost({ ...data, profiles: profile })
      } else {
        setPost(data)
      }
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Convert markdown-style content to HTML-safe rendering
  const renderContent = (content: string) => {
    // Split by newlines and process
    const lines = content.split('\n')
    const elements: JSX.Element[] = []
    let currentList: string[] = []
    let listType: 'ul' | 'ol' | null = null

    const flushList = () => {
      if (currentList.length > 0 && listType) {
        elements.push(
          listType === 'ul' ? (
            <ul key={elements.length} style={{ marginBottom: '16px', paddingLeft: '24px' }}>
              {currentList.map((item, i) => (
                <li key={i} style={{ marginBottom: '8px', lineHeight: '1.7' }}>{item}</li>
              ))}
            </ul>
          ) : (
            <ol key={elements.length} style={{ marginBottom: '16px', paddingLeft: '24px' }}>
              {currentList.map((item, i) => (
                <li key={i} style={{ marginBottom: '8px', lineHeight: '1.7' }}>{item}</li>
              ))}
            </ol>
          )
        )
        currentList = []
        listType = null
      }
    }

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()

      // Headers
      if (trimmedLine.startsWith('### ')) {
        flushList()
        elements.push(
          <h3 key={index} style={{ fontSize: '20px', fontWeight: '600', marginTop: '32px', marginBottom: '12px', color: '#1f2937' }}>
            {trimmedLine.slice(4)}
          </h3>
        )
      } else if (trimmedLine.startsWith('## ')) {
        flushList()
        elements.push(
          <h2 key={index} style={{ fontSize: '24px', fontWeight: '600', marginTop: '40px', marginBottom: '16px', color: '#1f2937' }}>
            {trimmedLine.slice(3)}
          </h2>
        )
      } else if (trimmedLine.startsWith('# ')) {
        flushList()
        elements.push(
          <h1 key={index} style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '40px', marginBottom: '16px', color: '#1f2937' }}>
            {trimmedLine.slice(2)}
          </h1>
        )
      }
      // Bullet points
      else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        if (listType !== 'ul') {
          flushList()
          listType = 'ul'
        }
        currentList.push(trimmedLine.slice(2))
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(trimmedLine)) {
        if (listType !== 'ol') {
          flushList()
          listType = 'ol'
        }
        currentList.push(trimmedLine.replace(/^\d+\.\s/, ''))
      }
      // Empty line
      else if (trimmedLine === '') {
        flushList()
      }
      // Regular paragraph
      else {
        flushList()
        // Handle bold text with **
        const processedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        elements.push(
          <p 
            key={index} 
            style={{ marginBottom: '16px', lineHeight: '1.8', color: '#374151' }}
            dangerouslySetInnerHTML={{ __html: processedLine }}
          />
        )
      }
    })

    flushList()
    return elements
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
        <p style={{ fontSize: '18px', color: '#666' }}>Loading...</p>
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <main style={{ maxWidth: '700px', margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Post Not Found</h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>The blog post you're looking for doesn't exist.</p>
          <Link href="/blog" style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#eab308',
            color: 'black',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600'
          }}>
            ← Back to Blog
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Hero Image - Fixed to show full image without stretching */}
      {post.image_url && (
        <div style={{
          width: '100%',
          maxHeight: '450px',
          overflow: 'hidden',
          backgroundColor: '#1f2937',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <img
            src={post.image_url}
            alt={post.title}
            style={{
              width: '100%',
              maxHeight: '450px',
              objectFit: 'contain',
              backgroundColor: '#1f2937'
            }}
          />
        </div>
      )}

      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 16px' }}>
        {/* Back Link */}
        <Link href="/blog" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#eab308',
          textDecoration: 'none',
          fontWeight: '500',
          marginBottom: '24px'
        }}>
          ← Back to Blog
        </Link>

        {/* Article */}
        <article style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {/* Meta */}
          <div style={{
            fontSize: '14px',
            color: '#eab308',
            marginBottom: '16px',
            fontWeight: '500'
          }}>
            {formatDate(post.created_at)}
            {post.profiles?.name && ` • ${post.profiles.name}`}
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '24px',
            lineHeight: '1.3'
          }}>
            {post.title}
          </h1>

          {/* Content */}
          <div style={{ fontSize: '17px' }}>
            {renderContent(post.content)}
          </div>
        </article>

        {/* CTA */}
        <div style={{
          backgroundColor: '#fef3c7',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
          marginTop: '32px'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#92400e' }}>
            Join UK Driver Hub Today
          </h3>
          <p style={{ color: '#92400e', marginBottom: '20px' }}>
            Connect with fellow drivers, track your earnings, and stay informed.
          </p>
          <Link href="/signin" style={{
            display: 'inline-block',
            padding: '14px 28px',
            backgroundColor: '#eab308',
            color: 'black',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '16px'
          }}>
            Sign Up Free
          </Link>
        </div>
      </main>
    </div>
  )
}
