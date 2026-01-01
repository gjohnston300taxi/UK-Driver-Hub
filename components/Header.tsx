'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Don't show header on auth pages
  if (pathname === '/signin' || pathname === '/signup' || pathname === '/onboarding') {
    return null
  }

  const navLinks = [
    { href: '/feed', label: 'Feed', emoji: '📰' },
    { href: '/news', label: 'News', emoji: '📢' },
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
        {/* Logo */}
        <Link href="/feed" style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/logo.png"
            alt="UK Driver Hub"
            width={220}
            height={60}
            style={{ height: 'auto' }}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }} className="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none',
                color: pathname === link.href ? '#000000' : '#ffffff',
                backgroundColor: pathname === link.href ? '#eab308' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            padding: '8px 12px',
            backgroundColor: 'transparent',
            border: '2px solid white',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '24px',
            color: 'white'
          }}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#96a2a4',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 49
          }}
        >
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
          </nav>
        </div>
      )}

      {/* CSS for responsive behavior */}
      <style jsx global>{`
        @media (max-width: 900px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
        @media (min-width: 901px) {
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </header>
  )
}
