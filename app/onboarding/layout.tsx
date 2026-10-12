import type { Metadata } from 'next'

// Title and description that Google shows for this page.
export const metadata: Metadata = {
  title: 'Set Up Your Profile',
  description: 'Set up your UK Driver Hub profile.',
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
