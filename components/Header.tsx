'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  // Don't show header on auth pages
  if (pathname === '/signin' || pathname === '/signup' || pathname === '/onboarding') {
    return null
  }

  const navLinks = [
    { href: '/feed', label: 'Feed' },
    { href: '/news', label: 'News' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/finance', label: 'Finance' },
    { href: '/resources', label: 'Resources' },
    { href: '/assistant', label: 'Assistant' },
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
            width={180}
            height={50}
            style={{ height: 'auto' }}
            priority
          />
        </Link>

        {/* Navigation */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
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
          
          {/* Profile Link */}
          <Link
            href="/profile"
            style={{
              marginLeft: '16px',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              textDecoration: 'none',
              color: pathname === '/profile' ? '#000000' : '#ffffff',
              backgroundColor: pathname === '/profile' ? '#eab308' : 'transparent',
              transition: 'all 0.2s'
            }}
          >
            Profile
          </Link>
        </nav>
      </div>
    </header>
  )
}
