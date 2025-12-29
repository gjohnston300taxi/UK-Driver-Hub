'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATEGORIES = [
  { id: 'all', label: 'All News' },
  { id: 'taxi', label: '🚕 Taxi News' },
  { id: 'rideshare', label: '📱 Rideshare Apps' },
  { id: 'safety', label: '🛡️ Safety' },
  { id: 'government', label: '🏛️ Government & Tax' }
]

interface NewsArticle {
  id: string
  title: string
  summary: string
  source: string
  source_url: string
  category: string
  image_url: string | null
  published_at: string
}

interface Profile {
  id: string
  name: string
  is_admin: boolean
}

export default function NewsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Admin form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newSummary, setNewSummary] = useState('')
  const [newSource, setNewSource] = useState('')
  const [newSourceUrl, setNewSourceUrl] = useState('')
  const [newCategory, setNewCategory] = useState('taxi')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadUser()
    loadNews()
  }, [])

  useEffect(() => {
    loadNews()
  }, [selectedCategory])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setUser(user)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, name, is_admin')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)
    }
  }

  const loadNews = async () => {
    let query = supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })

    if (selectedCategory !== 'all') {
      query = query.eq('category', selectedCategory)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading news:', error)
    } else {
      setNews(data || [])
    }
    setLoading(false)
  }

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTitle.trim() || !newSource.trim() || !newSourceUrl.trim()) {
      alert('Please fill in title, source, and URL')
      return
    }

    setSubmitting(true)

    const { error } = await supabase
      .from('news')
      .insert([{
        title: newTitle.trim(),
        summary: newSummary.trim() || null,
        source: newSource.trim(),
        source_url: newSourceUrl.trim(),
        category: newCategory,
        image_url: newImageUrl.trim() || null,
        published_at: new Date().toISOString()
      }])

    if (error) {
      console.error('Error adding news:', error)
      alert('Failed to add news: ' + error.message)
    } else {
      // Reset form
      setNewTitle('')
      setNewSummary('')
      setNewSource('')
      setNewSourceUrl('')
      setNewCategory('taxi')
      setNewImageUrl('')
      setShowAddForm(false)
      loadNews()
    }

    setSubmitting(false)
  }

  const handleDeleteNews = async (newsId: string) => {
    if (!confirm('Are you sure you want to delete this news article?')) return

    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', newsId)

    if (error) {
      console.error('Error deleting news:', error)
      alert('Failed to delete news')
    } else {
      loadNews()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getCategoryLabel = (categoryId: string) => {
    const cat = CATEGORIES.find(c => c.id === categoryId)
    return cat?.label || categoryId
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/signin'
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link href="/feed" style={{ textDecoration: 'none' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: 'black' }}>
                🚕 Driver Feed
              </h1>
            </Link>
            <nav style={{ display: 'flex', gap: '16px' }}>
              <Link href="/feed" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
                Feed
              </Link>
              <Link href="/news" style={{ color: '#eab308', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                News
              </Link>
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <>
                <Link
                  href="/profile"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#eab308',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    color: 'black',
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}
                >
                  {profile?.name?.charAt(0).toUpperCase() || '?'}
                </Link>
                <button
                  onClick={handleSignOut}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/signin"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#eab308',
                  color: 'black',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Page Title */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            📰 Industry News
          </h2>
          <p style={{ color: '#666', margin: 0 }}>
            Stay updated with the latest taxi and private hire news from across the UK
          </p>
        </div>

        {/* Admin Add Button */}
        {profile?.is_admin && (
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#eab308',
                color: 'black',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {showAddForm ? '✕ Cancel' : '+ Add News Article'}
            </button>
          </div>
        )}

        {/* Admin Add Form */}
        {showAddForm && profile?.is_admin && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Add News Article</h3>
            <form onSubmit={handleAddNews}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Article headline"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Summary
                </label>
                <textarea
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Brief summary of the article"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                    Source *
                  </label>
                  <input
                    type="text"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="e.g. BBC News, HMRC"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      backgroundColor: 'white'
                    }}
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Article URL *
                </label>
                <input
                  type="url"
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="https://..."
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="https://... (thumbnail image)"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '12px 24px',
                  backgroundColor: submitting ? '#9ca3af' : '#eab308',
                  color: 'black',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                {submitting ? 'Adding...' : 'Add Article'}
              </button>
            </form>
          </div>
        )}

        {/* Category Filter */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '10px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                backgroundColor: selectedCategory === cat.id ? '#eab308' : 'transparent',
                color: selectedCategory === cat.id ? 'black' : '#666'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* News Articles */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Loading news...
          </div>
        ) : news.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            color: '#666',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            No news articles yet. Check back soon!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {news.map((article) => (
              <article
                key={article.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: article.image_url ? 'row' : 'column'
                }}
              >
                {article.image_url && (
                  <div style={{
                    width: '200px',
                    minHeight: '150px',
                    flexShrink: 0,
                    backgroundColor: '#f3f4f6'
                  }}>
                    <img
                      src={article.image_url}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                )}
                <div style={{ padding: '20px', flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                    gap: '12px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      {getCategoryLabel(article.category)}
                    </span>
                    {profile?.is_admin && (
                      <button
                        onClick={() => handleDeleteNews(article.id)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '18px',
                    lineHeight: '1.4'
                  }}>
                    <a
                      href={article.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      {article.title}
                    </a>
                  </h3>
                  
                  {article.summary && (
                    <p style={{ 
                      margin: '0 0 12px 0', 
                      color: '#666',
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}>
                      {article.summary}
                    </p>
                  )}
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '13px',
                    color: '#999'
                  }}>
                    <span>{article.source}</span>
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                  
                  <a
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: '12px',
                      color: '#eab308',
                      textDecoration: 'none',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}
                  >
                    Read full article →
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
