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
  email: string
  region: string
  is_admin: boolean
  created_at: string
}

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  source_url: string
  category: string
  created_at: string
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
}

interface MarketplaceListing {
  id: string
  category: string
  title: string
  description: string
  price: string
  contact_info: string
  website_url: string
  region: string
  featured: boolean
  created_at: string
}

interface Feedback {
  id: string
  user_id: string
  user_name: string
  user_region: string
  likes: string
  dislikes: string
  features: string
  status: string
  created_at: string
}

const NEWS_CATEGORIES = [
  'Industry News', 'Regulation Update', 'Technology', 'Business Tips', 
  'Safety', 'Local News', 'Events', 'Announcements'
]

const REGIONS = [
  'National 🇬🇧', 'Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'Northern Ireland 🇬🇧',
  'London 🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'North East England 🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'North West England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Yorkshire & Humber 🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'East Midlands 🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'West Midlands 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'East England 🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'South East England 🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'South West England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Republic of Ireland 🇮🇪'
]

const MARKETPLACE_CATEGORIES = ['insurance', 'cars', 'parts']

const FEEDBACK_STATUSES = ['new', 'read', 'in-progress', 'done']

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'users' | 'news' | 'companies' | 'marketplace' | 'feedback'>('users')
  
  // Data states
  const [users, setUsers] = useState<Profile[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [feedback, setFeedback] = useState<Feedback[]>([])
  
  // Form states
  const [showNewsForm, setShowNewsForm] = useState(false)
  const [showCompanyForm, setShowCompanyForm] = useState(false)
  const [showListingForm, setShowListingForm] = useState(false)
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [editingListing, setEditingListing] = useState<MarketplaceListing | null>(null)

  useEffect(() => {
    checkAdmin()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadUsers()
      loadNews()
      loadCompanies()
      loadListings()
      loadFeedback()
    }
  }, [isAdmin])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/signin'; return }
    setUser(user)

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      window.location.href = '/feed'
      return
    }

    setIsAdmin(true)
    setLoading(false)
  }

  const loadUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
  }

  const loadNews = async () => {
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false })
    setNews(data || [])
  }

  const loadCompanies = async () => {
    const { data } = await supabase.from('companies').select('*').order('region').order('name')
    setCompanies(data || [])
  }

  const loadListings = async () => {
    const { data } = await supabase.from('marketplace_listings').select('*').order('created_at', { ascending: false })
    setListings(data || [])
  }

  const loadFeedback = async () => {
    const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false })
    setFeedback(data || [])
  }

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !currentStatus })
      .eq('id', userId)
    
    if (!error) loadUsers()
  }

  const deleteNews = async (id: string) => {
    if (!confirm('Delete this news article?')) return
    await supabase.from('news').delete().eq('id', id)
    loadNews()
  }

  const deleteCompany = async (id: string) => {
    if (!confirm('Delete this company?')) return
    await supabase.from('companies').delete().eq('id', id)
    loadCompanies()
  }

  const deleteListing = async (id: string) => {
    if (!confirm('Delete this listing?')) return
    await supabase.from('marketplace_listings').delete().eq('id', id)
    loadListings()
  }

  const updateFeedbackStatus = async (id: string, status: string) => {
    await supabase.from('feedback').update({ status }).eq('id', id)
    loadFeedback()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#ef4444'
      case 'read': return '#f59e0b'
      case 'in-progress': return '#3b82f6'
      case 'done': return '#10b981'
      default: return '#666'
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>⚙️ Admin Panel</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[
            { id: 'users', label: '👥 Users' },
            { id: 'news', label: '📰 News' },
            { id: 'companies', label: '🏢 Companies' },
            { id: 'marketplace', label: '🏪 Marketplace' },
            { id: 'feedback', label: '📝 Feedback' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '10px 16px',
                backgroundColor: activeTab === tab.id ? '#eab308' : 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              {tab.label}
              {tab.id === 'feedback' && feedback.filter(f => f.status === 'new').length > 0 && (
                <span style={{
                  marginLeft: '6px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '11px'
                }}>
                  {feedback.filter(f => f.status === 'new').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Registered Users ({users.length})</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Region</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Joined</th>
                    <th style={{ textAlign: 'center', padding: '10px' }}>Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px' }}>{u.name}</td>
                      <td style={{ padding: '10px' }}>{u.region}</td>
                      <td style={{ padding: '10px' }}>{formatDate(u.created_at)}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => toggleAdmin(u.id, u.is_admin)}
                          style={{
                            padding: '4px 12px',
                            backgroundColor: u.is_admin ? '#10b981' : '#e5e7eb',
                            color: u.is_admin ? 'white' : '#666',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          {u.is_admin ? 'Yes' : 'No'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>News Articles ({news.length})</h2>
              <button
                onClick={() => { setEditingNews(null); setShowNewsForm(true) }}
                style={{ padding: '8px 16px', backgroundColor: '#eab308', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                + Add News
              </button>
            </div>

            {showNewsForm && (
              <NewsForm
                item={editingNews}
                onSave={() => { setShowNewsForm(false); loadNews() }}
                onCancel={() => setShowNewsForm(false)}
              />
            )}

            <div style={{ display: 'grid', gap: '12px' }}>
              {news.map(item => (
                <div key={item.id} style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '11px', backgroundColor: '#eab308', padding: '2px 8px', borderRadius: '4px' }}>{item.category}</span>
                      <h3 style={{ margin: '8px 0 4px', fontSize: '15px' }}>{item.title}</h3>
                      <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{item.source} • {formatDate(item.created_at)}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => { setEditingNews(item); setShowNewsForm(true) }} style={{ padding: '4px 8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                      <button onClick={() => deleteNews(item.id)} style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>Companies ({companies.length})</h2>
              <button
                onClick={() => { setEditingCompany(null); setShowCompanyForm(true) }}
                style={{ padding: '8px 16px', backgroundColor: '#eab308', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                + Add Company
              </button>
            </div>

            {showCompanyForm && (
              <CompanyForm
                item={editingCompany}
                onSave={() => { setShowCompanyForm(false); loadCompanies() }}
                onCancel={() => setShowCompanyForm(false)}
              />
            )}

            <div style={{ display: 'grid', gap: '12px' }}>
              {companies.map(item => (
                <div key={item.id} style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '11px', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '4px' }}>{item.region}</span>
                      <h3 style={{ margin: '8px 0 4px', fontSize: '15px' }}>{item.name} ⭐ {item.rating}</h3>
                      <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{item.description?.substring(0, 100)}...</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => { setEditingCompany(item); setShowCompanyForm(true) }} style={{ padding: '4px 8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                      <button onClick={() => deleteCompany(item.id)} style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>Marketplace Listings ({listings.length})</h2>
              <button
                onClick={() => { setEditingListing(null); setShowListingForm(true) }}
                style={{ padding: '8px 16px', backgroundColor: '#eab308', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                + Add Listing
              </button>
            </div>

            {showListingForm && (
              <ListingForm
                item={editingListing}
                onSave={() => { setShowListingForm(false); loadListings() }}
                onCancel={() => setShowListingForm(false)}
              />
            )}

            <div style={{ display: 'grid', gap: '12px' }}>
              {listings.map(item => (
                <div key={item.id} style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: item.featured ? '2px solid #eab308' : '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '11px', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>{item.category}</span>
                      {item.featured && <span style={{ fontSize: '11px', backgroundColor: '#eab308', padding: '2px 8px', borderRadius: '4px', marginLeft: '6px' }}>⭐ Featured</span>}
                      <h3 style={{ margin: '8px 0 4px', fontSize: '15px' }}>{item.title}</h3>
                      <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{item.description?.substring(0, 100)}...</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => { setEditingListing(item); setShowListingForm(true) }} style={{ padding: '4px 8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                      <button onClick={() => deleteListing(item.id)} style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>User Feedback ({feedback.length})</h2>
            
            {feedback.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>No feedback received yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {feedback.map(item => (
                  <div key={item.id} style={{ 
                    padding: '16px', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    borderLeft: `4px solid ${getStatusColor(item.status)}`
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <strong>{item.user_name}</strong>
                        <span style={{ color: '#666', marginLeft: '8px', fontSize: '13px' }}>{item.user_region}</span>
                        <div style={{ fontSize: '12px', color: '#999' }}>{formatDate(item.created_at)}</div>
                      </div>
                      <select
                        value={item.status}
                        onChange={(e) => updateFeedbackStatus(item.id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid #e5e7eb',
                          backgroundColor: getStatusColor(item.status),
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {FEEDBACK_STATUSES.map(s => (
                          <option key={s} value={s} style={{ backgroundColor: 'white', color: 'black' }}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Feedback Content */}
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {item.likes && (
                        <div>
                          <strong style={{ color: '#10b981', fontSize: '13px' }}>👍 What they like:</strong>
                          <p style={{ margin: '4px 0 0', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{item.likes}</p>
                        </div>
                      )}
                      {item.dislikes && (
                        <div>
                          <strong style={{ color: '#ef4444', fontSize: '13px' }}>👎 What they dislike:</strong>
                          <p style={{ margin: '4px 0 0', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{item.dislikes}</p>
                        </div>
                      )}
                      {item.features && (
                        <div>
                          <strong style={{ color: '#3b82f6', fontSize: '13px' }}>💡 Feature requests:</strong>
                          <p style={{ margin: '4px 0 0', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{item.features}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// News Form Component
function NewsForm({ item, onSave, onCancel }: { item: NewsItem | null, onSave: () => void, onCancel: () => void }) {
  const [title, setTitle] = useState(item?.title || '')
  const [summary, setSummary] = useState(item?.summary || '')
  const [source, setSource] = useState(item?.source || '')
  const [sourceUrl, setSourceUrl] = useState(item?.source_url || '')
  const [category, setCategory] = useState(item?.category || NEWS_CATEGORIES[0])
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim() || !summary.trim()) { alert('Title and summary required'); return }
    setSaving(true)

    const data = { title: title.trim(), summary: summary.trim(), source: source.trim(), source_url: sourceUrl.trim(), category }

    if (item) {
      await supabase.from('news').update(data).eq('id', item.id)
    } else {
      await supabase.from('news').insert([data])
    }

    setSaving(false)
    onSave()
  }

  return (
    <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '16px' }}>
      <h3 style={{ margin: '0 0 12px' }}>{item ? 'Edit News' : 'Add News'}</h3>
      <div style={{ display: 'grid', gap: '12px' }}>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
        <textarea placeholder="Summary" value={summary} onChange={(e) => setSummary(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px', minHeight: '100px' }} />
        <input type="text" placeholder="Source (e.g. BBC News)" value={source} onChange={(e) => setSource(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
        <input type="url" placeholder="Source URL" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px' }}>
          {NEWS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', backgroundColor: '#eab308', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>{saving ? 'Saving...' : 'Save'}</button>
          <button onClick={onCancel} style={{ padding: '10px 20px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// Company Form Component
function CompanyForm({ item, onSave, onCancel }: { item: Company | null, onSave: () => void, onCancel: () => void }) {
  const [name, setName] = useState(item?.name || '')
  const [region, setRegion] = useState(item?.region || REGIONS[0])
  const [rating, setRating] = useState(item?.rating?.toString() || '4.0')
  const [description, setDescription] = useState(item?.description || '')
  const [websiteUrl, setWebsiteUrl] = useState(item?.website_url || '')
  const [pros, setPros] = useState(item?.pros?.join('\n') || '')
  const [cons, setCons] = useState(item?.cons?.join('\n') || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) { alert('Name required'); return }
    setSaving(true)

    const data = {
      name: name.trim(),
      region,
      rating: parseFloat(rating),
      description: description.trim(),
      website_url: websiteUrl.trim(),
      pros: pros.split('\n').filter(p => p.trim()),
      cons: cons.split('\n').filter(c => c.trim())
    }

    if (item) {
      await supabase.from('companies').update(data).eq('id', item.id)
    } else {
      await supabase.from('companies').insert([data])
    }

    setSaving(false)
    onSave()
  }

  return (
    <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '16px' }}>
      <h3 style={{ margin: '0 0 12px' }}>{item ? 'Edit Company' : 'Add Company'}</h3>
      <div style={{ display: 'grid', gap: '12px' }}>
        <input type="text" placeholder="Company Name" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
        <select value={region} onChange={(e) => setRegion(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px' }}>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <input type="number" placeholder="Rating (e.g. 4.5)" value={rating} onChange={(e) => setRating(e.target.value)} min="1" max="5" step="0.1" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px', minHeight: '80px' }} />
        <input type="url" placeholder="Website URL" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
        <textarea placeholder="Pros (one per line)" value={pros} onChange={(e) => setPros(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px', minHeight: '60px' }} />
        <textarea placeholder="Cons (one per line)" value={cons} onChange={(e) => setCons(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px', minHeight: '60px' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', backgroundColor: '#eab308', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>{saving ? 'Saving...' : 'Save'}</button>
          <button onClick={onCancel} style={{ padding: '10px 20px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// Listing Form Component
function ListingForm({ item, onSave, onCancel }: { item: MarketplaceListing | null, onSave: () => void, onCancel: () => void }) {
  const [category, setCategory] = useState(item?.category || MARKETPLACE_CATEGORIES[0])
  const [title, setTitle] = useState(item?.title || '')
  const [description, setDescription] = useState(item?.description || '')
  const [price, setPrice] = useState(item?.price || '')
  const [contactInfo, setContactInfo] = useState(item?.contact_info || '')
  const [websiteUrl, setWebsiteUrl] = useState(item?.website_url || '')
  const [region, setRegion] = useState(item?.region || REGIONS[0])
  const [featured, setFeatured] = useState(item?.featured || false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) { alert('Title required'); return }
    setSaving(true)

    const data = {
      category,
      title: title.trim(),
      description: description.trim(),
      price: price.trim(),
      contact_info: contactInfo.trim(),
      website_url: websiteUrl.trim(),
      region,
      featured
    }

    if (item) {
      await supabase.from('marketplace_listings').update(data).eq('id', item.id)
    } else {
      await supabase.from('marketplace_listings').insert([data])
    }

    setSaving(false)
    onSave()
  }

  return (
    <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '16px' }}>
      <h3 style={{ margin: '0 0 12px' }}>{item ? 'Edit Listing' : 'Add Listing'}</h3>
      <div style={{ display: 'grid', gap: '12px' }}>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px' }}>
          {MARKETPLACE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px', minHeight: '80px' }} />
        <input type="text" placeholder="Price (optional)" value={price} onChange={(e) => setPrice(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
        <input type="text" placeholder="Contact Info (optional)" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
        <input type="url" placeholder="Website URL" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
        <select value={region} onChange={(e) => setRegion(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px' }}>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured listing
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', backgroundColor: '#eab308', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>{saving ? 'Saving...' : 'Save'}</button>
          <button onClick={onCancel} style={{ padding: '10px 20px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
