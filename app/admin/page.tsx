'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATEGORIES = [
  { id: 'taxi', label: '🚕 Taxi News' },
  { id: 'rideshare', label: '📱 Rideshare Apps' },
  { id: 'safety', label: '🛡️ Safety' },
  { id: 'government', label: '🏛️ Government & Tax' }
]

interface User {
  id: string
  name: string
  email: string
  region: string
  badge_number: string
  is_admin: boolean
  created_at: string
}

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

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'news' | 'users'>('news')
  
  // Users state
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  
  // News state
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loadingNews, setLoadingNews] = useState(false)
  
  // Add news form
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newSummary, setNewSummary] = useState('')
  const [newSource, setNewSource] = useState('')
  const [newSourceUrl, setNewSourceUrl] = useState('')
  const [newCategory, setNewCategory] = useState('taxi')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    checkAdmin()
  }, [])

  useEffect(() => {
    if (profile?.is_admin) {
      if (activeTab === 'users') {
        loadUsers()
      } else {
        loadNews()
      }
    }
  }, [activeTab, profile])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      window.location.href = '/signin'
      return
    }

    setUser(user)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profileData?.is_admin) {
      window.location.href = '/feed'
      return
    }

    setProfile(profileData)
    setLoading(false)
    loadNews()
  }

  const loadUsers = async () => {
    setLoadingUsers(true)
    
    // Get all profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading users:', error)
    } else {
      setUsers(profiles || [])
    }
    
    setLoadingUsers(false)
  }

  const loadNews = async () => {
    setLoadingNews(true)
    
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Error loading news:', error)
    } else {
      setNews(data || [])
    }
    
    setLoadingNews(false)
  }

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    if (userId === user.id) {
      alert("You can't remove your own admin status!")
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !currentStatus })
      .eq('id', userId)

    if (error) {
      console.error('Error updating admin status:', error)
      alert('Failed to update admin status')
    } else {
      loadUsers()
    }
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
    if (!confirm('Delete this news article?')) return

    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', newsId)

    if (error) {
      alert('Failed to delete')
    } else {
      loadNews()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/signin'
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#1f2937',
        borderBottom: '1px solid #374151',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: 'white' }}>
              ⚙️ Admin Portal
            </h1>
            <nav style={{ display: 'flex', gap: '16px' }}>
              <Link href="/feed" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>
                Feed
              </Link>
              <Link href="/news" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>
                News
              </Link>
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>{profile?.name}</span>
            <button
              onClick={handleSignOut}
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#9ca3af'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Tab Navigation */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '24px',
          display: 'inline-flex',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => setActiveTab('news')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              backgroundColor: activeTab === 'news' ? '#eab308' : 'transparent',
              color: activeTab === 'news' ? 'black' : '#666'
            }}
          >
            📰 Manage News
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              backgroundColor: activeTab === 'users' ? '#eab308' : 'transparent',
              color: activeTab === 'users' ? 'black' : '#666'
            }}
          >
            👥 Manage Users
          </button>
        </div>

        {/* News Tab */}
        {activeTab === 'news' && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>News Articles ({news.length})</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#eab308',
                  color: 'black',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {showAddForm ? '✕ Cancel' : '+ Add News'}
              </button>
            </div>

            {/* Add News Form */}
            {showAddForm && (
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
                      placeholder="Brief summary"
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
                        placeholder="e.g. BBC News"
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
                        {CATEGORIES.map((cat) => (
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
                      placeholder="https://..."
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

            {/* News List */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              {loadingNews ? (
                <p style={{ padding: '20px', textAlign: 'center' }}>Loading...</p>
              ) : news.length === 0 ? (
                <p style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No news articles yet</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600' }}>Title</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600' }}>Source</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600' }}>Category</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', color: '#666', fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {news.map((article) => (
                      <tr key={article.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px', maxWidth: '300px' }}>
                          <a href={article.source_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>
                            {article.title.length > 60 ? article.title.substring(0, 60) + '...' : article.title}
                          </a>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#666' }}>{article.source}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                          <span style={{ backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '4px' }}>
                            {article.category}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#666' }}>{formatDate(article.published_at)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleDeleteNews(article.id)}
                            style={{
                              padding: '6px 12px',
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>
              Registered Users ({users.length})
            </h2>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              {loadingUsers ? (
                <p style={{ padding: '20px', textAlign: 'center' }}>Loading...</p>
              ) : users.length === 0 ? (
                <p style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No users yet</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600' }}>Name</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600' }}>Region</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600' }}>Badge #</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600' }}>Joined</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', color: '#666', fontWeight: '600' }}>Admin</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', color: '#666', fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                          <div style={{ fontWeight: '500' }}>{u.name || 'Not set'}</div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#666' }}>{u.region || '-'}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#666' }}>{u.badge_number || '-'}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#666' }}>
                          {u.created_at ? formatDate(u.created_at) : '-'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          {u.is_admin ? (
                            <span style={{ 
                              backgroundColor: '#dcfce7', 
                              color: '#16a34a',
                              padding: '4px 8px', 
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              ✓ Admin
                            </span>
                          ) : (
                            <span style={{ 
                              backgroundColor: '#f3f4f6', 
                              color: '#666',
                              padding: '4px 8px', 
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              User
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button
                            onClick={() => toggleAdminStatus(u.id, u.is_admin)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: u.is_admin ? '#fee2e2' : '#dcfce7',
                              color: u.is_admin ? '#dc2626' : '#16a34a',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            {u.is_admin ? 'Remove Admin' : 'Make Admin'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
