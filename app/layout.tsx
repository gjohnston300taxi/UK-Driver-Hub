import './globals.css'
import Header from '@/components/Header'

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
      <body style={{ margin: 0, minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <Header />
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
