'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()

  // Don't show footer on auth pages
  if (pathname === '/signin' || pathname === '/signup' || pathname === '/onboarding') {
    return null
  }

  return (
    <footer style={{
      backgroundColor: '#96a2a4',
      color: 'white',
      padding: '40px 24px 24px',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Main Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
          marginBottom: '32px'
        }}>
          {/* About Section */}
          <div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: '#eab308'
            }}>
              UK Driver Hub
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: 'white',
              lineHeight: '1.6'
            }}>
              Keeping you on the right road. The community platform for UK taxi and private hire drivers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: '#eab308'
            }}>
              Quick Links
            </h3>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link href="/feed" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                Feed
              </Link>
              <Link href="/news" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                News
              </Link>
              <Link href="/marketplace" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                Marketplace
              </Link>
              <Link href="/resources" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                Resources
              </Link>
            </nav>
          </div>

          {/* Legal Links */}
          <div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: '#eab308'
            }}>
              Legal
            </h3>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link href="/terms" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                Terms & Conditions
              </Link>
              <Link href="/privacy" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* Contact Section */}
          <div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: '#eab308'
            }}>
              Contact Us
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a 
                href="mailto:info@ukdriverhub.org" 
                style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}
              >
                📧 info@ukdriverhub.org
              </a>
              <p style={{ color: 'white', fontSize: '14px', margin: 0 }}>
                📍 United Kingdom
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Link */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <Link 
            href="/feedback" 
            style={{ 
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#eab308',
              color: 'black',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '15px'
            }}
          >
            📝 Give Your Feedback Here
          </Link>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.3)',
          paddingTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}>
          <p style={{ 
            fontSize: '14px', 
            color: 'white',
            margin: 0
          }}>
            © {new Date().getFullYear()} UK Driver Hub. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="/terms" style={{ color: 'white', textDecoration: 'none', fontSize: '13px' }}>
              Terms
            </Link>
            <Link href="/privacy" style={{ color: 'white', textDecoration: 'none', fontSize: '13px' }}>
              Privacy
            </Link>
            <Link href="/contact" style={{ color: 'white', textDecoration: 'none', fontSize: '13px' }}>
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
