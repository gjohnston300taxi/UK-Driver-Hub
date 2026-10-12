import type { Metadata } from 'next'

// Title and description that Google shows for this page.
export const metadata: Metadata = {
  title: 'Legal & Industry Assistant for UK Taxi Drivers',
  description: 'Ask questions about taxi and private hire licensing, insurance, tax and driver rights in the UK. Free for UK Driver Hub members.',
  alternates: { canonical: '/assistant' },
  openGraph: { url: '/assistant', title: 'Legal & Industry Assistant for UK Taxi Drivers', description: 'Ask questions about taxi and private hire licensing, insurance, tax and driver rights in the UK. Free for UK Driver Hub members.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
