import type { Metadata } from 'next'

// Title and description that Google shows for this page.
export const metadata: Metadata = {
  title: 'Join Free',
  description: 'Create your free UK Driver Hub account.',
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
