'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Profile {
  id: string
  name: string
  region: string
  email?: string
  is_admin: boolean
  created_at: string
}

interface NewsItem {
  id: string
  title: string
  content: string
  category: string
  created_at: string
  author_id: string
}

interface Company {
  id: string
  name: string
  region: string
  rating: number
  description: string
  website_url: string
  pros: string[]
  cons: string[]
  created_at: string
}

interface MarketplaceListing {
  id: string
  category: string
  title: string
  description: string
  price: string
  contact_info: string
  website_url: string
  image_url: string
  region: string
  featured: boolean
  created_at: string
}

const REGIONS = [
  'Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Northern Ireland 🇬🇧',
  'London 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'North East England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'North West England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Yorkshire & Humber 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'East Midlands 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'West Midlands 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'East England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'South East England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'South West England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Republic of Ireland 🇮🇪',
  'National 🇬🇧'
]

const NEWS_CATEGORIES = [
  'Industry News',
  'Regulation Update',
  'Technology',
  'Business Tips',
  'Safety',
  'Local News',
  'Events',
  'Announcements'
]

const MARKETPLACE_CATEGORIES = [
  { id: 'insurance', label: '🛡️ Insurance' },
  { id: 'cars', label: '🚗 Cars for Sale' },
  { id: 'parts', label: '🔧 Car Parts' },
  { id: 'accessories', label: '📱 Accessories' },
  { id: 'services', label: '🔨 Services' }
]

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'users' | 'news' | 'companies' | 'marketplace'>('users')
  
  // Users state
  const [users, setUsers] = useState<Profile[]>([])
  
  // News state
  const [news, setNews] = useState<NewsItem[]>([])
  const [showNewsForm, setShowNewsForm] = useState(false)
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null)
  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    category: 'Industry News'
  })
  
  // Companies state
  const [companies, setCompanies] = useState<Company[]>([])
  const [showCompanyForm, setShowCompanyForm] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [companyForm, setCompanyForm] = useState({
    name: '',
    region: '',
    rating: 4.0,
    description: '',
    website_url: '',
    pros: '',
    cons: ''
  })
  
  // Marketplace state
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [showListingForm, setShowListingForm] = useState(false)
  const [editingListing, setEditingListing] = useState<MarketplaceListing | null>(null)
  const [listingForm, setListingForm] = useState({
    category: 'insurance',
    title: '',
    description: '',
    price: '',
    contact_info: '',
    website_url: '',
    image_url: '',
    region: 'National 🇬🇧',
    featured: false
  })

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      window.location.href = '/signin'
      return
    }

    setUser(user)
    
    // Check if user is admin in the database
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (profile?.is_admin === true) {
      setIsAdmin(true)
      loadUsers()
      loadNews()
      loadCompanies()
      loadListings()
    }
    
    setLoading(false)
  }

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name', { ascending: true })

    if (!error && data) {
      setUsers(data)
    }
  }

  const loadNews = async () => {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setNews(data)
    }
  }

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('region', { ascending: true })
      .order('name', { ascending: true })

    if (!error && data) {
      setCompanies(data)
    }
  }

  const loadListings = async () => {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (!error && data) {
      setListings(data)
    }
  }

  // User functions
  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !currentStatus })
      .eq('id', userId)

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage(currentStatus ? 'Admin access removed' : 'Admin access granted')
      loadUsers()
    }
  }

  // News functions
  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const newsData = {
      title: newsForm.title.trim(),
      content: newsForm.content.trim(),
      category: newsForm.category,
      author_id: user.id
    }

    let error
    if (editingNews) {
      const { error: updateError } = await supabase
        .from('news')
        .update(newsData)
        .eq('id', editingNews.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('news')
        .insert([newsData])
      error = insertError
    }

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage(editingNews ? 'News updated!' : 'News published!')
      resetNewsForm()
      loadNews()
    }

    setSaving(false)
  }

  const editNews = (item: NewsItem) => {
    setEditingNews(item)
    setNewsForm({
      title: item.title,
      content: item.content,
      category: item.category
    })
    setShowNewsForm(true)
  }

  const deleteNews = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news article?')) return

    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id)

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('News deleted!')
      loadNews()
    }
  }

  const resetNewsForm = () => {
    setNewsForm({
      title: '',
      content: '',
      category: 'Industry News'
    })
    setEditingNews(null)
    setShowNewsForm(false)
  }

  // Company functions
  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const companyData = {
      name: companyForm.name.trim(),
      region: companyForm.region,
      rating: companyForm.rating,
      description: companyForm.description.trim(),
      website_url: companyForm.website_url.trim(),
      pros: companyForm.pros.split('\n').filter(p => p.trim()),
      cons: companyForm.cons.split('\n').filter(c => c.trim())
    }

    let error
    if (editingCompany) {
      const { error: updateError } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', editingCompany.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('companies')
        .insert([companyData])
      error = insertError
    }

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage(editingCompany ? 'Company updated!' : 'Company added!')
      resetCompanyForm()
      loadCompanies()
    }

    setSaving(false)
  }

  const editCompany = (company: Company) => {
    setEditingCompany(company)
    setCompanyForm({
      name: company.name,
      region: company.region,
      rating: company.rating,
      description: company.description,
      website_url: company.website_url || '',
      pros: (company.pros || []).join('\n'),
      cons: (company.cons || []).join('\n')
    })
    setShowCompanyForm(true)
  }

  const deleteCompany = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company?')) return

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id)

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Company deleted!')
      loadCompanies()
    }
  }

  const resetCompanyForm = () => {
    setCompanyForm({
      name: '',
      region: '',
      rating: 4.0,
      description: '',
      website_url: '',
      pros: '',
      cons: ''
    })
    setEditingCompany(null)
    setShowCompanyForm(false)
  }

  // Marketplace functions
  const handleListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const listingData = {
      category: listingForm.category,
      title: listingForm.title.trim(),
      description: listingForm.description.trim(),
      price: listingForm.price.trim(),
      contact_info: listingForm.contact_info.trim(),
      website_url: listingForm.website_url.trim(),
      image_url: listingForm.image_url.trim(),
      region: listingForm.region,
      featured: listingForm.featured
    }

    let error
    if (editingListing) {
      const { error: updateError } = await supabase
        .from('marketplace_listings')
        .update(listingData)
        .eq('id', editingListing.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('marketplace_listings')
        .insert([listingData])
      error = insertError
    }

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage(editingListing ? 'Listing updated!' : 'Listing added!')
      resetListingForm()
      loadListings()
    }

    setSaving(false)
  }

  const editListing = (listing: MarketplaceListing) => {
    setEditingListing(listing)
    setListingForm({
      category: listing.category,
      title: listing.title,
      description: listing.description,
      price: listing.price || '',
      contact_info: listing.contact_info || '',
      website_url: listing.website_url || '',
      image_url: listing.image_url || '',
      region: listing.region,
      featured: listing.featured
    })
    setShowListingForm(true)
  }

  const deleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return

    const { error } = await supabase
      .from('marketplace_listings')
      .delete()
      .eq('id', id)

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Listing deleted!')
      loadListings()
    }
  }

  const resetListingForm = () => {
    setListingForm({
      category: 'insurance',
      title: '',
      description: '',
      price: '',
      contact_info: '',
      website_url: '',
      image_url: '',
      region: 'National 🇬🇧',
      featured: false
    })
    setEditingListing(null)
    setShowListingForm(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
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
        <p style={{ fontSize: '18px', color: '#666' }}>Loading...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>🔒 Access Denied</h1>
          <p style={{ color: '#666' }}>You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>⚙️ Admin Panel</h1>
          <p style={{ margin: 0, color: '#666' }}>Manage users, news, companies and marketplace</p>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            backgroundColor: message.startsWith('Error') ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${message.startsWith('Error') ? '#fecaca' : '#bbf7d0'}`,
            color: message.startsWith('Error') ? '#dc2626' : '#16a34a',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              flex: '1 1 auto',
              padding: '10px 8px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              backgroundColor: activeTab === 'users' ? '#eab308' : 'transparent',
              color: activeTab === 'users' ? 'black' : '#666'
            }}
          >
            👥 Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('news')}
            style={{
              flex: '1 1 auto',
              padding: '10px 8px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              backgroundColor: activeTab === 'news' ? '#eab308' : 'transparent',
              color: activeTab === 'news' ? 'black' : '#666'
            }}
          >
            📰 News ({news.length})
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            style={{
              flex: '1 1 auto',
              padding: '10px 8px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              backgroundColor: activeTab === 'companies' ? '#eab308' : 'transparent',
              color: activeTab === 'companies' ? 'black' : '#666'
            }}
          >
            🏢 Companies ({companies.length})
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            style={{
              flex: '1 1 auto',
              padding: '10px 8px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              backgroundColor: activeTab === 'marketplace' ? '#eab308' : 'transparent',
              color: activeTab === 'marketplace' ? 'black' : '#666'
            }}
          >
            🏪 Marketplace ({listings.length})
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>👥 Registered Users</h2>
            <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
              Toggle admin access for users. Admins can access this panel and manage content.
            </p>
            
            <div style={{ display: 'grid', gap: '8px' }}>
              {users.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No users found.</p>
              ) : (
                users.map(profile => (
                  <div
                    key={profile.id}
                    style={{
                      padding: '12px',
                      backgroundColor: profile.is_admin ? '#fef3c7' : '#f9fafb',
                      borderRadius: '8px',
                      border: `1px solid ${profile.is_admin ? '#eab308' : '#e5e7eb'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {profile.name || 'No name'}
                        {profile.is_admin && <span style={{ fontSize: '12px', backgroundColor: '#eab308', padding: '2px 8px', borderRadius: '4px' }}>Admin</span>}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        {profile.region || 'No region'}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAdmin(profile.id, profile.is_admin)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: profile.is_admin ? '#dc2626' : '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        flexShrink: 0
                      }}
                    >
                      {profile.is_admin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>📰 News Articles</h2>
              <button
                onClick={() => setShowNewsForm(!showNewsForm)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#eab308',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {showNewsForm ? '✕ Cancel' : '+ Add News'}
              </button>
            </div>

            {/* News Form */}
            {showNewsForm && (
              <form onSubmit={handleNewsSubmit} style={{
                backgroundColor: '#f9fafb',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <h3 style={{ margin: '0 0 16px 0' }}>{editingNews ? 'Edit News Article' : 'Add News Article'}</h3>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Category *</label>
                  <select
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                  >
                    {NEWS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Title *</label>
                  <input
                    type="text"
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Content *</label>
                  <textarea
                    value={newsForm.content}
                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                    required
                    rows={8}
                    style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#eab308',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: saving ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {saving ? 'Saving...' : (editingNews ? 'Update News' : 'Publish News')}
                  </button>
                  {editingNews && (
                    <button
                      type="button"
                      onClick={resetNewsForm}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* News List */}
            <div style={{ display: 'grid', gap: '8px' }}>
              {news.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No news articles yet.</p>
              ) : (
                news.map(item => (
                  <div
                    key={item.id}
                    style={{
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600' }}>{item.title}</div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        {item.category} • {formatDate(item.created_at)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => editNews(item)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteNews(item.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>🏢 Regional Companies</h2>
              <button
                onClick={() => setShowCompanyForm(!showCompanyForm)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#eab308',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {showCompanyForm ? '✕ Cancel' : '+ Add Company'}
              </button>
            </div>

            <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
              These companies appear in Resources → "Who to Work For"
            </p>

            {/* Company Form */}
            {showCompanyForm && (
              <form onSubmit={handleCompanySubmit} style={{
                backgroundColor: '#f9fafb',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <h3 style={{ margin: '0 0 16px 0' }}>{editingCompany ? 'Edit Company' : 'Add New Company'}</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Company Name *</label>
                    <input
                      type="text"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Region *</label>
                    <select
                      value={companyForm.region}
                      onChange={(e) => setCompanyForm({ ...companyForm, region: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                    >
                      <option value="">Select region</option>
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Rating (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={companyForm.rating}
                      onChange={(e) => setCompanyForm({ ...companyForm, rating: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Website URL</label>
                    <input
                      type="url"
                      value={companyForm.website_url}
                      onChange={(e) => setCompanyForm({ ...companyForm, website_url: e.target.value })}
                      placeholder="https://..."
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Description *</label>
                  <textarea
                    value={companyForm.description}
                    onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                    required
                    rows={3}
                    style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Pros (one per line)</label>
                    <textarea
                      value={companyForm.pros}
                      onChange={(e) => setCompanyForm({ ...companyForm, pros: e.target.value })}
                      rows={4}
                      placeholder="Good pay rates&#10;Flexible hours&#10;Modern app"
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Cons (one per line)</label>
                    <textarea
                      value={companyForm.cons}
                      onChange={(e) => setCompanyForm({ ...companyForm, cons: e.target.value })}
                      rows={4}
                      placeholder="High commission&#10;Limited areas&#10;Busy periods"
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#eab308',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: saving ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {saving ? 'Saving...' : (editingCompany ? 'Update Company' : 'Add Company')}
                  </button>
                  {editingCompany && (
                    <button
                      type="button"
                      onClick={resetCompanyForm}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Companies List */}
            <div style={{ display: 'grid', gap: '8px' }}>
              {companies.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No companies added yet. Add companies here and they will appear in Resources.</p>
              ) : (
                companies.map(company => (
                  <div
                    key={company.id}
                    style={{
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600' }}>{company.name}</div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        {company.region} • ⭐ {company.rating}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => editCompany(company)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteCompany(company.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>🏪 Marketplace Listings</h2>
              <button
                onClick={() => setShowListingForm(!showListingForm)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#eab308',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {showListingForm ? '✕ Cancel' : '+ Add Listing'}
              </button>
            </div>

            <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
              These listings appear in the Marketplace page
            </p>

            {/* Listing Form */}
            {showListingForm && (
              <form onSubmit={handleListingSubmit} style={{
                backgroundColor: '#f9fafb',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <h3 style={{ margin: '0 0 16px 0' }}>{editingListing ? 'Edit Listing' : 'Add New Listing'}</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Category *</label>
                    <select
                      value={listingForm.category}
                      onChange={(e) => setListingForm({ ...listingForm, category: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                    >
                      {MARKETPLACE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Region</label>
                    <select
                      value={listingForm.region}
                      onChange={(e) => setListingForm({ ...listingForm, region: e.target.value })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                    >
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Title *</label>
                  <input
                    type="text"
                    value={listingForm.title}
                    onChange={(e) => setListingForm({ ...listingForm, title: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Description *</label>
                  <textarea
                    value={listingForm.description}
                    onChange={(e) => setListingForm({ ...listingForm, description: e.target.value })}
                    required
                    rows={3}
                    style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Price</label>
                    <input
                      type="text"
                      value={listingForm.price}
                      onChange={(e) => setListingForm({ ...listingForm, price: e.target.value })}
                      placeholder="£99/month or Free quote"
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Contact Info</label>
                    <input
                      type="text"
                      value={listingForm.contact_info}
                      onChange={(e) => setListingForm({ ...listingForm, contact_info: e.target.value })}
                      placeholder="Phone or email"
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Website URL</label>
                    <input
                      type="url"
                      value={listingForm.website_url}
                      onChange={(e) => setListingForm({ ...listingForm, website_url: e.target.value })}
                      placeholder="https://..."
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Image URL</label>
                    <input
                      type="url"
                      value={listingForm.image_url}
                      onChange={(e) => setListingForm({ ...listingForm, image_url: e.target.value })}
                      placeholder="https://..."
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={listingForm.featured}
                      onChange={(e) => setListingForm({ ...listingForm, featured: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontWeight: '500' }}>⭐ Featured listing (shows at top)</span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#eab308',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: saving ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {saving ? 'Saving...' : (editingListing ? 'Update Listing' : 'Add Listing')}
                  </button>
                  {editingListing && (
                    <button
                      type="button"
                      onClick={resetListingForm}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Listings List */}
            <div style={{ display: 'grid', gap: '8px' }}>
              {listings.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No listings added yet. Add listings here and they will appear in Marketplace.</p>
              ) : (
                listings.map(listing => (
                  <div
                    key={listing.id}
                    style={{
                      padding: '12px',
                      backgroundColor: listing.featured ? '#fef3c7' : '#f9fafb',
                      borderRadius: '8px',
                      border: `1px solid ${listing.featured ? '#eab308' : '#e5e7eb'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600' }}>
                        {listing.featured && '⭐ '}{listing.title}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        {MARKETPLACE_CATEGORIES.find(c => c.id === listing.category)?.label} • {listing.region}
                        {listing.price && ` • ${listing.price}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => editListing(listing)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteListing(listing.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
