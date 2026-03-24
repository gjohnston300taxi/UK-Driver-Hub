import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieConsent from '@/components/CookieConsent'
import SessionGuard from '@/components/SessionGuard'

export const metadata = {
  title: 'UK Driver Hub',
  description: 'Keeping you on the right road',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#fbbf24" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Driver Hub" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
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
