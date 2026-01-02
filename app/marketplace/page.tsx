'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Listing {
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

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🏪' },
  { id: 'insurance', label: 'Insurance', icon: '🛡️' },
  { id: 'cars', label: 'Cars for Sale', icon: '🚗' },
  { id: 'parts', label: 'Car Parts', icon: '🔧' }
]

export default function MarketplacePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState<Listing[]>([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadUser()
    loadListings()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/signin'; return }
    setUser(user)
    const { data } = await supabase.from('profiles').select('name, region').eq('id', user.id).single()
    if (!data?.name || !data?.region) { window.location.href = '/onboarding'; return }
    setProfile(data)
    setLoading(false)
  }

  const loadListings = async () => {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .in('category', ['insurance', 'cars', 'parts'])
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setListings(data)
    }
    setLoadingListings(false)
  }

  const filteredListings = selectedCategory === 'all' 
    ? listings 
    : listings.filter(l => l.category === selectedCategory)

  const listingsByCategory = listings.reduce((acc, listing) => {
    if (!acc[listing.category]) {
      acc[listing.category] = []
    }
    acc[listing.category].push(listing)
    return acc
  }, {} as { [key: string]: Listing[] })

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId) || { id: categoryId, label: categoryId, icon: '📦' }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'insurance': return '#dcfce7'
      case 'cars': return '#e0e7ff'
      case 'parts': return '#dbeafe'
      default: return '#f3f4f6'
    }
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
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>🏪 Marketplace</h2>
        <p style={{ color: '#666', margin: '0 0 20px 0' }}>Exclusive deals and services for taxi drivers</p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                backgroundColor: selectedCategory === cat.id ? '#eab308' : 'white',
                color: selectedCategory === cat.id ? 'black' : '#666',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {loadingListings ? (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#666' }}>
            Loading listings...
          </div>
        ) : listings.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#666' }}>
            No listings yet. Check back soon!
          </div>
        ) : selectedCategory === 'all' ? (
          <>
            {CATEGORIES.filter(c => c.id !== 'all' && listingsByCategory[c.id]?.length > 0).map(category => (
              <div key={category.id} style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {category.icon} {category.label}
                  <span style={{ fontSize: '14px', color: '#666', fontWeight: '400' }}>
                    ({listingsByCategory[category.id]?.length || 0})
                  </span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                  {listingsByCategory[category.id]?.map(listing => (
                    <ListingCard key={listing.id} listing={listing} getCategoryColor={getCategoryColor} getCategoryInfo={getCategoryInfo} />
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {filteredListings.length === 0 ? (
              <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#666' }}>
                No listings in this category yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {filteredListings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} getCategoryColor={getCategoryColor} getCategoryInfo={getCategoryInfo} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function ListingCard({ listing, getCategoryColor, getCategoryInfo }: { 
  listing: Listing, 
  getCategoryColor: (cat: string) => string,
  getCategoryInfo: (cat: string) => { id: string, label: string, icon: string }
}) {
  const categoryInfo = getCategoryInfo(listing.category)
  
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '12px', 
      padding: '20px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: listing.featured ? '2px solid #eab308' : '1px solid #e5e7eb',
      position: 'relative'
    }}>
      {listing.featured && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          right: '12px',
          backgroundColor: '#eab308',
          color: 'black',
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '600'
        }}>
          ⭐ Featured
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          borderRadius: '8px', 
          backgroundColor: getCategoryColor(listing.category), 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '24px' 
        }}>
          {categoryInfo.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{listing.title}</h3>
          <span style={{ fontSize: '12px', color: '#666' }}>{categoryInfo.label}</span>
        </div>
      </div>
      
      <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#444', lineHeight: '1.5' }}>
        {listing.description}
      </p>
      
      {listing.price && (
        <div style={{ 
          backgroundColor: '#f0fdf4', 
          padding: '8px 12px', 
          borderRadius: '6px', 
          marginBottom: '12px',
          display: 'inline-block'
        }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#16a34a' }}>
            💰 {listing.price}
          </span>
        </div>
      )}
      
      {listing.region && listing.region !== 'National 🇬🇧' && (
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
          📍 {listing.region}
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {listing.website_url && (
          <a 
            href={listing.website_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              padding: '8px 12px', 
              backgroundColor: '#eab308', 
              color: 'black', 
              textDecoration: 'none', 
              borderRadius: '6px', 
              fontSize: '13px', 
              fontWeight: '500' 
            }}
          >
            🌐 Website
          </a>
        )}
        {listing.contact_info && (
          <span style={{ 
            padding: '8px 12px', 
            backgroundColor: '#f3f4f6', 
            color: '#333', 
            borderRadius: '6px', 
            fontSize: '13px'
          }}>
            📞 {listing.contact_info}
          </span>
        )}
      </div>
    </div>
  )
}
