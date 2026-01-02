'use client'

import { useState, useEffect } from 'react'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem('cookieConsent', 'all')
    setShowBanner(false)
  }

  const acceptEssential = () => {
    localStorage.setItem('cookieConsent', 'essential')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '16px',
      zIndex: 1000,
      boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🍪</span>
          <div>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.5' }}>
              We use cookies to ensure the Platform functions correctly, analyse usage, and remember your preferences. 
              Essential cookies are required for the site to work. Analytics and preference cookies help us improve your experience.
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
              By clicking "Accept All", you consent to all cookies. You can also choose to accept only essential cookies.
              See our{' '}
              <a href="/privacy" style={{ color: '#eab308', textDecoration: 'underline' }}>Privacy Policy</a>
              {' '}for more information.
            </p>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={acceptEssential}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid #6b7280',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Essential Only
          </button>
          <button
            onClick={acceptAll}
            style={{
              padding: '10px 20px',
              backgroundColor: '#eab308',
              color: 'black',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}
