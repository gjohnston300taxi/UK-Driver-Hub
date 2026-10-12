import type { Metadata } from 'next'

// Title and description that Google shows for this page.
export const metadata: Metadata = {
  title: 'Taxi & Private Hire Insurance Quotes',
  description: 'Request taxi, private hire and public hire insurance quotes from UK specialist insurers. Simple form, built for UK cab drivers.',
  alternates: { canonical: '/insurance' },
  openGraph: { url: '/insurance', title: 'Taxi & Private Hire Insurance Quotes', description: 'Request taxi, private hire and public hire insurance quotes from UK specialist insurers. Simple form, built for UK cab drivers.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
