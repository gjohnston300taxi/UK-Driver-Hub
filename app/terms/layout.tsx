import type { Metadata } from 'next'

// Title and description that Google shows for this page.
export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'The terms and conditions for using UK Driver Hub.',
  alternates: { canonical: '/terms' },
  openGraph: { url: '/terms', title: 'Terms & Conditions', description: 'The terms and conditions for using UK Driver Hub.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
