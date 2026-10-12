import type { Metadata } from 'next'

// Title and description that Google shows for this page.
export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How UK Driver Hub collects, uses and protects your personal information.',
  alternates: { canonical: '/privacy' },
  openGraph: { url: '/privacy', title: 'Privacy Policy', description: 'How UK Driver Hub collects, uses and protects your personal information.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
