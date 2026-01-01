'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Company {
  id: string
  name: string
  category: string
  description: string
  website: string | null
  phone: string | null
  email: string | null
  logo: string | null
  discount_code: string | null
  discount_description: string | null
}

// Hardcoded Car Parts data
const carPartsData = {
  newParts: [
    { name: "Car Parts 4 Less", url: "https://www.carparts4less.co.uk/", description: "Discount car parts and accessories for all makes and models" },
    { name: "Autodoc", url: "https://www.autodoc.co.uk/", description: "Wide range of car parts with fast delivery across the UK" },
    { name: "Euro Car Parts", url: "https://www.eurocarparts.com/", description: "UK's leading car parts retailer with nationwide stores" }
  ],
  secondHandParts: [
    { name: "Breaker Link", url: "https://www.breakerlink.com/", description: "Search breakers yards for used car parts across the UK" },
    { name: "Used Car Parts UK", url: "https://www.usedcarpartsuk.co.uk/", description: "Quality second-hand car parts at affordable prices" },
    { name: "1st Choice", url: "https://www.1stchoice.co.uk/", description: "Network of breakers yards for recycled car parts" }
  ]
}

export default function MarketplacePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const categories = ['All', 'insurance', 'cars', 'Car Parts']

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) loadCompanies()
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

  const loadCompanies = async () => {
    const { data } = await supabase
      .from('marketplace_companies')
      .select('*')
      .in('category', ['insurance', 'cars'])
      .order('name', { ascending: true })
    setCompanies(data || [])
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
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0' }}>🏪 Marketplace</h2>
        <p style={{ color: '#666', margin: '0 0 20px 0' }}>Exclusive deals and services for taxi drivers</p>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 14px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                backgroundColor: selectedCategory === cat ? '#eab308' : 'white',
                color: selectedCategory === cat ? 'black' : '#666',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              {cat === 'cars' ? '🚗 Car Sales' : cat === 'insurance' ? '🛡️ Insurance' : cat === 'Car Parts' ? '🔧 Car Parts' : cat}
            </button>
          ))}
        </div>

        {/* Car Parts Section - Show when All or Car Parts selected */}
        {(selectedCategory === 'All' || selectedCategory === 'Car Parts') && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔧 Car Parts
            </h3>
            
            {/* New Parts */}
            <h4 style={{ fontSize: '15px', fontWeight: '500', color: '#666', margin: '0 0 12px 0' }}>New Parts</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {carPartsData.newParts.map((part, index) => (
                <div key={index} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '8px', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                      🔧
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{part.name}</h3>
                      <span style={{ fontSize: '12px', color: '#666' }}>New Parts</span>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#444', lineHeight: '1.4' }}>{part.description}</p>
                  <a href={part.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '8px 12px', backgroundColor: '#eab308', color: 'black', textDecoration: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>🌐 Visit Website</a>
                </div>
              ))}
            </div>

            {/* Second-hand Parts */}
            <h4 style={{ fontSize: '15px', fontWeight: '500', color: '#666', margin: '0 0 12px 0' }}>Second-hand Parts</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {carPartsData.secondHandParts.map((part, index) => (
                <div key={index} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '8px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                      ♻️
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{part.name}</h3>
                      <span style={{ fontSize: '12px', color: '#666' }}>Second-hand Parts</span>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#444', lineHeight: '1.4' }}>{part.description}</p>
                  <a href={part.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '8px 12px', backgroundColor: '#eab308', color: 'black', textDecoration: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>🌐 Visit Website</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insurance Section - Show when All or insurance selected */}
        {(selectedCategory === 'All' || selectedCategory === 'insurance') && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🛡️ Insurance
            </h3>
            {companies.filter(c => c.category === 'insurance').length === 0 ? (
              <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', textAlign: 'center', color: '#666', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                No insurance companies added yet. Add them via the Admin portal.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {companies.filter(c => c.category === 'insurance').map((company) => (
                  <div key={company.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '8px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                        🛡️
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{company.name}</h3>
                        <span style={{ fontSize: '12px', color: '#666' }}>{company.category}</span>
                      </div>
                    </div>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#444', lineHeight: '1.4' }}>{company.description}</p>
                    {company.discount_code && (
                      <div style={{ backgroundColor: '#fef3c7', padding: '10px', borderRadius: '8px', marginBottom: '12px' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#92400e', fontWeight: '600' }}>🎁 DRIVER DISCOUNT</p>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#78350f' }}>{company.discount_code}</p>
                        {company.discount_description && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#92400e' }}>{company.discount_description}</p>}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {company.website && (
                        <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 12px', backgroundColor: '#eab308', color: 'black', textDecoration: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>🌐 Website</a>
                      )}
                      {company.phone && (
                        <a href={`tel:${company.phone}`} style={{ padding: '8px 12px', backgroundColor: '#10b981', color: 'white', textDecoration: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>📞 Call</a>
                      )}
                      {company.email && (
                        <a href={`mailto:${company.email}`} style={{ padding: '8px 12px', backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>✉️ Email</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Car Sales Section - Show when All or cars selected */}
        {(selectedCategory === 'All' || selectedCategory === 'cars') && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🚗 Car Sales
            </h3>
            {companies.filter(c => c.category === 'cars').length === 0 ? (
              <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', textAlign: 'center', color: '#666', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                No car sales companies added yet. Add them via the Admin portal.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {companies.filter(c => c.category === 'cars').map((company) => (
                  <div key={company.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '8px', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                        🚗
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{company.name}</h3>
                        <span style={{ fontSize: '12px', color: '#666' }}>Car Sales</span>
                      </div>
                    </div>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#444', lineHeight: '1.4' }}>{company.description}</p>
                    {company.discount_code && (
                      <div style={{ backgroundColor: '#fef3c7', padding: '10px', borderRadius: '8px', marginBottom: '12px' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#92400e', fontWeight: '600' }}>🎁 DRIVER DISCOUNT</p>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#78350f' }}>{company.discount_code}</p>
                        {company.discount_description && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#92400e' }}>{company.discount_description}</p>}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {company.website && (
                        <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 12px', backgroundColor: '#eab308', color: 'black', textDecoration: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>🌐 Website</a>
                      )}
                      {company.phone && (
                        <a href={`tel:${company.phone}`} style={{ padding: '8px 12px', backgroundColor: '#10b981', color: 'white', textDecoration: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>📞 Call</a>
                      )}
                      {company.email && (
                        <a href={`mailto:${company.email}`} style={{ padding: '8px 12px', backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>✉️ Email</a>
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
