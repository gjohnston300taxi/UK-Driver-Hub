'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profile, setProfile] = useState<{ name: string } | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('name').eq('id', user.id).single()
      if (data) setProfile(data)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/signin'
  }

  // Don't show header on auth pages
  if (pathname === '/signin' || pathname === '/signup' || pathname === '/onboarding') {
    return null
  }

  const navLinks = [
    { href: '/feed', label: 'Feed', emoji: '📰' },
    { href: '/news', label: 'News', emoji: '📢' },
    { href: '/blog', label: 'Blog', emoji: '📝' },
    { href: '/marketplace', label: 'Marketplace', emoji: '🏪' },
    { href: '/finance', label: 'Finance', emoji: '💰' },
    { href: '/resources', label: 'Resources', emoji: '📚' },
    { href: '/assistant', label: 'Assistant', emoji: '🤖' },
    { href: '/profile', label: 'Profile', emoji: '👤' },
  ]

  return (
    <header style={{
      backgroundColor: '#96a2a4',
      padding: '12px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left side - Logo and Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Logo */}
          <Link href="/feed" style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/logo.png"
              alt="UK Driver Hub"
              style={{ 
                height: '50px',
                width: 'auto'
              }}
            />
          </Link>

          {/* Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: '2px solid white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '24px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Right side - Profile Icon */}
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
          title={profile?.name || 'Profile'}
        >
          {profile?.name?.charAt(0).toUpperCase() || '?'}
        </Link>
      </div>

      {/* Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: '#96a2a4',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 49
        }}>
          <nav style={{ 
            display: 'flex', 
            flexDirection: 'column',
            padding: '8px 0'
          }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '14px 24px',
                  color: pathname === link.href ? '#eab308' : 'white',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: pathname === link.href ? '600' : '400',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span>{link.emoji}</span> {link.label}
              </Link>
            ))}
            {/* Sign Out Button */}
            <button
              onClick={() => { setMobileMenuOpen(false); handleSignOut() }}
              style={{
                padding: '14px 24px',
                color: '#fca5a5',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '16px',
                fontWeight: '400',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span>🚪</span> Sign Out
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
