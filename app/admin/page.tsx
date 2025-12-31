'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const NEWS_CATEGORIES = [
  { id: 'taxi', label: '🚕 Taxi News' },
  { id: 'rideshare', label: '📱 Rideshare Apps' },
  { id: 'safety', label: '🛡️ Safety' },
  { id: 'government', label: '🏛️ Government & Tax' }
]

const COMPANY_CATEGORIES = [
  { id: 'cars', label: '🚗 Car Sales' },
  { id: 'insurance', label: '🛡️ Insurance' }
]

const EMOJI_OPTIONS = ['🚕', '🚖', '🚗', '🏠', '⚡', '🏭', '🔋', '🤝', '⭐', '📱', '🌳', '🏢', '🌊', '💼', '🛡️', '🚙', '🏪', '💚', '🔵', '🟡']

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

interface MarketplaceCompany {
  id: string
  name: string
  description: string
  website: string
  logo: string
  category: 'cars' | 'insurance'
  features: string[]
  created_at: string
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'news' | 'users' | 'marketplace'>('news')
  
  // Users state
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  
  // News state
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loadingNews, setLoadingNews] = useState(false)
  
  // Marketplace state
  const [companies, setCompanies] = useState<MarketplaceCompany[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [marketplaceFilter, setMarketplaceFilter] = useState<'all' | 'cars' | 'insurance'>('all')
  
  // Add news form
  const [showAddNewsForm, setShowAddNewsForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newSummary, setNewSummary] = useState('')
  const [newSource, setNewSource] = useState('')
  const [newSourceUrl, setNewSourceUrl] = useState('')
  const [newCategory, setNewCategory] = useState('taxi')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [submittingNews, setSubmittingNews] = useState(false)

  // Add company form
  const [showAddCompanyForm, setShowAddCompanyForm] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [companyDescription, setCompanyDescription] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [companyLogo, setCompanyLogo] = useState('🏢')
  const [companyCategory, setCompanyCategory] = useState<'cars' | 'insurance'>('cars')
  const [companyFeatures, setCompanyFeatures] = useState('')
  const [submittingCompany, setSubmittingCompany] = useState(false)

  useEffect(() => {
    checkAdmin()
  }, [])

  useEffect(() => {
    if (profile?.is_admin) {
      if (activeTab === 'users') {
        loadUsers()
      } else if (activeTab === 'news') {
        loadNews()
      } else if (activeTab === 'marketplace') {
        loadCompanies()
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

  const loadCompanies = async () => {
    setLoadingCompanies(true)
    const { data, error } = await supabase
      .from('marketplace_companies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading companies:', error)
    } else {
      setCompanies(data || [])
    }
    setLoadingCompanies(false)
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

    setSubmittingNews(true)

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
      setShowAddNewsForm(false)
      loadNews()
    }

    setSubmittingNews(false)
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

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!companyName.trim() || !companyDescription.trim() || !companyWebsite.trim()) {
      alert('Please fill in name, description, and website')
      return
    }

    setSubmittingCompany(true)

    // Parse features from comma-separated string
    const featuresArray = companyFeatures
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0)

    const { error } = await supabase
      .from('marketplace_companies')
      .insert([{
        name: companyName.trim(),
        description: companyDescription.trim(),
        website: companyWebsite.trim(),
        logo: companyLogo,
        category: companyCategory,
        features: featuresArray
      }])

    if (error) {
      console.error('Error adding company:', error)
      alert('Failed to add company: ' + error.message)
    } else {
      setCompanyName('')
      setCompanyDescription('')
      setCompanyWebsite('')
      setCompanyLogo('🏢')
      setCompanyCategory('cars')
      setCompanyFeatures('')
      setShowAddCompanyForm(false)
      loadCompanies()
    }

    setSubmittingCompany(false)
  }

  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    if (!confirm(`Delete "${companyName}" from the marketplace?`)) return

    const { error } = await supabase
      .from('marketplace_companies')
      .delete()
      .eq('id', companyId)

    if (error) {
      alert('Failed to delete company')
    } else {
      loadCompanies()
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

  const filteredCompanies = marketplaceFilter === 'all' 
    ? companies 
    : companies.filter(c => c.category === marketplaceFilter)

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
      {/* Admin Header */}
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
            <Link href="/feed" style={{ textDecoration: 'none' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: 'white' }}>
                🚕 Driver Hub
              </h1>
            </Link>
            <span style={{ 
              backgroundColor: '#dc2626', 
              color: 'white', 
              padding: '4px 12px', 
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              ADMIN
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/feed" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>
              ← Back to Feed
            </Link>
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>
              {profile?.name}
            </span>
            <button
              onClick={handleSignOut}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'white'
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
          borderRadius: '12px',
          padding: '6px',
          marginBottom: '24px',
          display: 'flex',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => setActiveTab('news')}
            style={{
              flex: 1,
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              backgroundColor: activeTab === 'news' ? '#1f2937' : 'transparent',
              color: activeTab === 'news' ? 'white' : '#666',
              transition: 'all 0.2s'
            }}
          >
            📰 Manage News
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            style={{
              flex: 1,
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              backgroundColor: activeTab === 'marketplace' ? '#1f2937' : 'transparent',
              color: activeTab === 'marketplace' ? 'white' : '#666',
              transition: 'all 0.2s'
            }}
          >
            🛒 Marketplace
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              flex: 1,
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              backgroundColor: activeTab === 'users' ? '#1f2937' : 'transparent',
              color: activeTab === 'users' ? 'white' : '#666',
              transition: 'all 0.2s'
            }}
          >
            👥 Manage Users
          </button>
        </div>

        {/* News Tab */}
        {activeTab === 'news' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>
                News Articles ({news.length})
              </h2>
              <button
                onClick={() => setShowAddNewsForm(!showAddNewsForm)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: showAddNewsForm ? '#6b7280' : '#eab308',
                  color: 'black',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                {showAddNewsForm ? 'Cancel' : '+ Add News'}
              </button>
            </div>

            {/* Add News Form */}
            {showAddNewsForm && (
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
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                      Summary
                    </label>
                    <textarea
                      value={newSummary}
                      onChange={(e) => setNewSummary(e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        resize: 'vertical'
                      }}
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
                          boxSizing: 'border-box'
                        }}
                      >
                        {NEWS_CATEGORIES.map((cat) => (
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
                    disabled={submittingNews}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: submittingNews ? '#9ca3af' : '#eab308',
                      color: 'black',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: submittingNews ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {submittingNews ? 'Adding...' : 'Add Article'}
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
                            {article.title.length > 50 ? article.title.substring(0, 50) + '...' : article.title}
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

        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '20px' }}>
                  Marketplace Companies ({filteredCompanies.length})
                </h2>
                {/* Filter buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['all', 'cars', 'insurance'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setMarketplaceFilter(filter)}
                      style={{
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: marketplaceFilter === filter ? '#1f2937' : '#e5e7eb',
                        color: marketplaceFilter === filter ? 'white' : '#666'
                      }}
                    >
                      {filter === 'all' ? 'All' : filter === 'cars' ? '🚗 Cars' : '🛡️ Insurance'}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowAddCompanyForm(!showAddCompanyForm)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: showAddCompanyForm ? '#6b7280' : '#eab308',
                  color: 'black',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                {showAddCompanyForm ? 'Cancel' : '+ Add Company'}
              </button>
            </div>

            {/* Add Company Form */}
            {showAddCompanyForm && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Add New Company</h3>
                <form onSubmit={handleAddCompany}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                        placeholder="e.g. Acme Taxis Ltd"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                        Category *
                      </label>
                      <select
                        value={companyCategory}
                        onChange={(e) => setCompanyCategory(e.target.value as 'cars' | 'insurance')}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      >
                        {COMPANY_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                      Description *
                    </label>
                    <textarea
                      value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                      required
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        resize: 'vertical'
                      }}
                      placeholder="Brief description of what the company offers..."
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                        Website URL *
                      </label>
                      <input
                        type="url"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                        placeholder="https://www.example.com"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                        Logo Emoji
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {EMOJI_OPTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setCompanyLogo(emoji)}
                            style={{
                              width: '36px',
                              height: '36px',
                              border: companyLogo === emoji ? '2px solid #eab308' : '1px solid #d1d5db',
                              borderRadius: '6px',
                              backgroundColor: companyLogo === emoji ? '#fef3c7' : 'white',
                              cursor: 'pointer',
                              fontSize: '18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                      Features (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={companyFeatures}
                      onChange={(e) => setCompanyFeatures(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      placeholder="e.g. 24/7 Support, Free Delivery, Finance Available"
                    />
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      Enter features separated by commas. These will appear as badges on the company card.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingCompany}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: submittingCompany ? '#9ca3af' : '#eab308',
                      color: 'black',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: submittingCompany ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {submittingCompany ? 'Adding...' : 'Add Company'}
                  </button>
                </form>
              </div>
            )}

            {/* Companies List */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              {loadingCompanies ? (
                <p style={{ padding: '20px', textAlign: 'center' }}>Loading...</p>
              ) : filteredCompanies.length === 0 ? (
                <p style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No companies yet</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600' }}>Company</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600' }}>Category</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600' }}>Features</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600' }}>Added</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', color: '#666', fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map((company) => (
                      <tr key={company.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ 
                              fontSize: '24px',
                              width: '40px',
                              height: '40px',
                              backgroundColor: company.category === 'cars' ? '#fef3c7' : '#dcfce7',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {company.logo}
                            </span>
                            <div>
                              <div style={{ fontWeight: '600' }}>{company.name}</div>
                              <a 
                                href={company.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none' }}
                              >
                                {company.website.replace('https://', '').replace('www.', '')}
                              </a>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                          <span style={{ 
                            backgroundColor: company.category === 'cars' ? '#fef3c7' : '#dcfce7',
                            color: company.category === 'cars' ? '#92400e' : '#166534',
                            padding: '4px 10px', 
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {company.category === 'cars' ? '🚗 Car Sales' : '🛡️ Insurance'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '12px', maxWidth: '200px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {company.features?.slice(0, 3).map((feature, idx) => (
                              <span
                                key={idx}
                                style={{
                                  backgroundColor: '#f3f4f6',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '11px'
                                }}
                              >
                                {feature}
                              </span>
                            ))}
                            {company.features?.length > 3 && (
                              <span style={{ fontSize: '11px', color: '#666' }}>
                                +{company.features.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#666' }}>
                          {formatDate(company.created_at)}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleDeleteCompany(company.id, company.name)}
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
