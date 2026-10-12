import type { Metadata } from 'next'

// Title and description that Google shows for this page.
export const metadata: Metadata = {
  title: 'Driver Marketplace: Deals & Services for UK Cab Drivers',
  description: 'Deals, services and suppliers for UK taxi, private hire and rideshare drivers, from vehicles and equipment to insurance and accounting.',
  alternates: { canonical: '/marketplace' },
  openGraph: { url: '/marketplace', title: 'Driver Marketplace: Deals & Services for UK Cab Drivers', description: 'Deals, services and suppliers for UK taxi, private hire and rideshare drivers, from vehicles and equipment to insurance and accounting.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
