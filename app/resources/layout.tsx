import type { Metadata } from 'next'

// Title and description that Google shows for this page.
export const metadata: Metadata = {
  title: 'Resources & Guides for UK Taxi and Private Hire Drivers',
  description: 'Plain-English guides for UK taxi and PHV drivers on licensing, Making Tax Digital, vehicle rules, insurance and running your driving business.',
  alternates: { canonical: '/resources' },
  openGraph: { url: '/resources', title: 'Resources & Guides for UK Taxi and Private Hire Drivers', description: 'Plain-English guides for UK taxi and PHV drivers on licensing, Making Tax Digital, vehicle rules, insurance and running your driving business.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
