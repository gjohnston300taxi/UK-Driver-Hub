import type { Metadata } from 'next'

// Title and description that Google shows for this page.
export const metadata: Metadata = {
  title: 'Earnings & Expenses Tracker for Taxi Drivers',
  description: 'A free earnings and expenses tracker for UK taxi and private hire drivers. Log takings and costs, keep receipts and get ready for HMRC and Making Tax Digital.',
  alternates: { canonical: '/finance' },
  openGraph: { url: '/finance', title: 'Earnings & Expenses Tracker for Taxi Drivers', description: 'A free earnings and expenses tracker for UK taxi and private hire drivers. Log takings and costs, keep receipts and get ready for HMRC and Making Tax Digital.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
