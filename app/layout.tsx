import './globals.css'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieConsent from '@/components/CookieConsent'
import SessionGuard from '@/components/SessionGuard'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'UK Driver Hub | Community for Taxi & Private Hire Drivers',
    // Other pages fill in the %s, e.g. "Blog | UK Driver Hub"
    template: '%s | UK Driver Hub',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'taxi drivers UK',
    'private hire drivers',
    'PHV drivers',
    'rideshare drivers UK',
    'Uber drivers UK',
    'cab drivers community',
    'taxi licence',
    'taxi insurance',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'UK Driver Hub | Community for Taxi & Private Hire Drivers',
    description: SITE_DESCRIPTION,
    images: [{ url: '/logo.png', alt: 'UK Driver Hub logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UK Driver Hub | Community for Taxi & Private Hire Drivers',
    description: SITE_DESCRIPTION,
    images: ['/logo.png'],
  },
  robots: { index: true, follow: true },
  // After you add the site to Google Search Console, you can paste the
  // verification code here, e.g. verification: { google: 'abc123' },
}

// Hidden labels that tell Google who you are (shown as "structured data").
const organisationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      email: 'info@ukdriverhub.org',
      areaServed: 'GB',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: 'en-GB',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#fbbf24" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Driver Hub" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJsonLd) }}
        />
      </head>
      <body style={{
        margin: 0,
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Header />
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
        <CookieConsent />
        <SessionGuard />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered:', registration);
                    })
                    .catch(function(error) {
                      console.log('SW registration failed:', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
