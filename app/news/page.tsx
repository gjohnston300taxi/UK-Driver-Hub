'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  source_url: string
  category: string
  created_at: string
}

export default function NewsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [news, setNews] = useState<NewsItem[]>([])
  const [loadingNews, setLoadingNews] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/signin'; return }
    setUser(user)
    const { data } = await supabase.from('profiles').select('name, region').eq('id', user.id).single()
    if (!data?.name || !data?.region) { window.location.href = '/onboarding'; return }
    setProfile(data)
    setLoading(false)
    loadNews()
  }

  const loadNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setNews(data)
      }
    } catch (err) {
      console.error('Error loading news:', err)
    }
    setLoadingNews(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getPreview = (text: string, maxLength: number = 150) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
        <p style={{ fontSize: '18px', color: '#666' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0' }}>📢 Industry News</h2>

        {loadingNews ? (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '40px 20px', textAlign: 'center', color: '#666', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            Loading news...
          </div>
        ) : !news || news.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '40px 20px', textAlign: 'center', color: '#666', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            No news articles yet. Check back soon!
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {news.map((item) => (
              <a
                key={item.id}
                href={`/news/${item.id}`}
                style={{
                  display: 'block',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  textDecoration: 'none',
                  color: 'inherit',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ padding: '4px 10px', backgroundColor: '#eab308', color: 'black', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                    {item.category || 'News'}
                  </span>
                  <span style={{ fontSize: '13px', color: '#999' }}>{formatDate(item.created_at)}</span>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', lineHeight: '1.3', color: '#111' }}>
                  {item.title}
                </h3>
                {item.source && (
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#888' }}>
                    📰 {item.source}
                  </p>
                )}
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                  {getPreview(item.summary)}
                </p>
                <span style={{ fontSize: '14px', color: '#eab308', fontWeight: '500' }}>
                  Read more →
                </span>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
