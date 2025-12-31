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
  content: string
  category: string
  created_at: string
  author_id: string
}

export default function NewsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [news, setNews] = useState<NewsItem[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) loadNews()
  }, [user])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/signin'; return }
    setUser(user)
    const { data } = await supabase.from('profiles').select('name, region').eq('id', user.id).single()
    if (!data?.name || !data?.region) { window.location.href = '/onboarding'; return }
    setProfile(data)
    setLoading(false)
  }

  const loadNews = async () => {
    const { data } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
    setNews(data || [])
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/signin'
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

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Industry News': '#3b82f6',
      'Regulations': '#ef4444',
      'Tips & Advice': '#10b981',
      'Local Updates': '#f59e0b',
      'Technology': '#8b5cf6'
    }
    return colors[category] || '#6b7280'
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
      {/* Header with Hamburger Menu */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Left side - Title + Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>🚕 Driver Hub</h1>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ padding: '8px', backgroundColor: 'transparent', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{mobileMenuOpen ? '✕' : '☰'}</button>
          </div>
          {/* Right side - Profile only */}
          <a href="/profile" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'black', fontWeight: 'bold', fontSize: '16px' }}>{profile?.name?.charAt(0).toUpperCase() || '?'}</a>
        </div>
        {mobileMenuOpen && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 99 }}>
            <nav style={{ display: 'flex', flexDirection: 'column', maxWidth: '680px', margin: '0 auto' }}>
              <a href="/feed" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>📰 Feed</a>
              <a href="/news" style={{ padding: '16px', color: '#eab308', textDecoration: 'none', fontSize: '16px', fontWeight: '600', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>📢 News</a>
              <a href="/marketplace" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>🏪 Marketplace</a>
              <a href="/finance" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>💰 Finance</a>
              <a href="/resources" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>📚 Resources</a>
              <a href="/assistant" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>🤖 Driver AI Assistant</a>
              <a href="/profile" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>👤 Profile</a>
              <button onClick={() => { setMobileMenuOpen(false); handleSignOut() }} style={{ padding: '16px', backgroundColor: 'transparent', border: 'none', color: '#dc2626', fontSize: '16px', textAlign: 'left', cursor: 'pointer' }}>🚪 Sign Out</button>
            </nav>
          </div>
        )}
      </header>

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0' }}>📢 Industry News</h2>

        {news.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '40px 20px', textAlign: 'center', color: '#666', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            No news articles yet. Check back soon!
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {news.map((item) => (
              <div key={item.id} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{ padding: '4px 10px', backgroundColor: '#eab308', color: 'black', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>{item.category}</span>
                  <span style={{ fontSize: '13px', color: '#999' }}>{formatDate(item.created_at)}</span>
                </div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '600', lineHeight: '1.3' }}>{item.title}</h3>
                <p style={{ margin: 0, fontSize: '15px', color: '#444', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{item.content}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
