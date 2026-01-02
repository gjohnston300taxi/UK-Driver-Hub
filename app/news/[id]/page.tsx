'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface NewsItem {
  id: string
  title: string
  content: string
  category: string
  created_at: string
  author_id: string
}

export default function NewsArticlePage() {
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [article, setArticle] = useState<NewsItem | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user && params.id) {
      loadArticle(params.id as string)
    }
  }, [user, params.id])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/signin'; return }
    setUser(user)
    const { data } = await supabase.from('profiles').select('name, region').eq('id', user.id).single()
    if (!data?.name || !data?.region) { window.location.href = '/onboarding'; return }
  }

  const loadArticle = async (id: string) => {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !data) {
      setNotFound(true)
    } else {
      setArticle(data)
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
        <p style={{ fontSize: '18px', color: '#666' }}>Loading...</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <main style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>
          <a 
            href="/news" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: '#666', 
              textDecoration: 'none',
              marginBottom: '16px',
              fontSize: '14px'
            }}
          >
            ← Back to News
          </a>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '40px 20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Article Not Found</h2>
            <p style={{ color: '#666', margin: 0 }}>This article may have been removed or doesn't exist.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>
        {/* Back Link */}
        <a 
          href="/news" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: '#666', 
            textDecoration: 'none',
            marginBottom: '16px',
            fontSize: '14px'
          }}
        >
          ← Back to News
        </a>

        {/* Article */}
        {article && (
          <article style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '24px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
          }}>
            {/* Category & Date */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ 
                padding: '6px 12px', 
                backgroundColor: '#eab308', 
                color: 'black', 
                borderRadius: '16px', 
                fontSize: '13px', 
                fontWeight: '500' 
              }}>
                {article.category}
              </span>
              <span style={{ fontSize: '14px', color: '#999' }}>
                {formatDate(article.created_at)}
              </span>
            </div>

            {/* Title */}
            <h1 style={{ 
              margin: '0 0 20px 0', 
              fontSize: '28px', 
              fontWeight: '700', 
              lineHeight: '1.3',
              color: '#111'
            }}>
              {article.title}
            </h1>

            {/* Divider */}
            <div style={{ 
              height: '1px', 
              backgroundColor: '#e5e7eb', 
              margin: '20px 0' 
            }} />

            {/* Content */}
            <div style={{ 
              fontSize: '16px', 
              lineHeight: '1.8', 
              color: '#333',
              whiteSpace: 'pre-wrap'
            }}>
              {article.content}
            </div>

            {/* Share Section */}
            <div style={{ 
              marginTop: '32px', 
              paddingTop: '20px', 
              borderTop: '1px solid #e5e7eb' 
            }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
                Share this article:
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1DA1F2',
                    color: 'white',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  Twitter
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#4267B2',
                    color: 'white',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  Facebook
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#25D366',
                    color: 'white',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </article>
        )}
      </main>
    </div>
  )
}
