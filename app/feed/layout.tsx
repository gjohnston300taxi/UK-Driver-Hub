import type { Metadata } from 'next'

// Title and description that Google shows for this page.
export const metadata: Metadata = {
  title: 'Driver Community Feed for UK Taxi & Private Hire Drivers',
  description: 'Join the conversation with taxi, private hire and rideshare drivers across the UK. Share tips, ask questions and see what is happening in your region.',
  alternates: { canonical: '/feed' },
  openGraph: { url: '/feed', title: 'Driver Community Feed for UK Taxi & Private Hire Drivers', description: 'Join the conversation with taxi, private hire and rideshare drivers across the UK. Share tips, ask questions and see what is happening in your region.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
