import type { Metadata } from 'next'
import Link from 'next/link'
import SignedInRedirect from '@/components/SignedInRedirect'
import { createPublicClient } from '@/lib/supabase/public'
import { SITE_DESCRIPTION } from '@/lib/site'

// Rebuild this page at most every 10 minutes so new blog posts appear.
export const revalidate = 600

export const metadata: Metadata = {
  title: { absolute: 'UK Driver Hub | Free Community for Taxi, Private Hire & Rideshare Drivers' },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
}

const features = [
  {
    href: '/feed',
    emoji: '🚕',
    title: 'Driver community feed',
    text: 'Chat with taxi, private hire and rideshare drivers across the UK, or just your region. Share tips, questions and news from the rank.',
  },
  {
    href: '/news',
    emoji: '📢',
    title: 'Taxi & private hire news',
    text: 'The latest UK industry news on licensing, councils, TfL, Uber, Bolt, fares and regulation, all in one place.',
  },
  {
    href: '/resources',
    emoji: '📚',
    title: 'Guides & resources',
    text: 'Plain-English help with taxi and PHV licensing, Making Tax Digital, vehicle rules and running your driving business.',
  },
  {
    href: '/insurance',
    emoji: '🛡️',
    title: 'Taxi insurance quotes',
    text: 'Request quotes for taxi, private hire and public hire insurance from UK specialist providers.',
  },
  {
    href: '/marketplace',
    emoji: '🏪',
    title: 'Driver marketplace',
    text: 'Find deals, services and suppliers made for UK cab drivers.',
  },
  {
    href: '/finance',
    emoji: '💰',
    title: 'Earnings & expenses tracker',
    text: 'Log your takings and costs, keep receipts and get ready for HMRC. Free account needed to save your records.',
  },
  {
    href: '/assistant',
    emoji: '⚖️',
    title: 'Legal & industry assistant',
    text: 'Ask questions about licensing, insurance, tax and driver rights. Free account needed.',
  },
]

const faqs = [
  {
    q: 'Is UK Driver Hub free?',
    a: 'Yes. Reading the feed, news, blog, guides and marketplace is free with no sign-up. A free account is only needed to post, save your earnings and expenses, and use the legal and industry assistant.',
  },
  {
    q: 'Who is UK Driver Hub for?',
    a: 'Licensed taxi (hackney carriage) drivers, private hire (PHV) drivers and rideshare drivers working with apps like Uber and Bolt anywhere in the UK.',
  },
  {
    q: 'Can I use it on my phone?',
    a: 'Yes. UK Driver Hub works in any mobile browser, and you can add it to your home screen like an app.',
  },
]

async function getLatestPosts() {
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('title, slug, excerpt, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3)
    return data || []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const posts = await getLatestPosts()

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div style={{ backgroundColor: '#f3f4f6' }}>
      <SignedInRedirect />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section style={{ backgroundColor: '#1f2937', color: 'white', padding: '64px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, margin: '0 auto 16px', maxWidth: '820px', lineHeight: 1.2 }}>
          The free community for UK taxi, private hire &amp; rideshare drivers
        </h1>
        <p style={{ fontSize: '18px', color: '#d1d5db', maxWidth: '640px', margin: '0 auto 28px', lineHeight: 1.6 }}>
          News, licensing and insurance help, a driver marketplace and a place to talk to drivers who get it.
          Keeping you on the right road.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/feed" style={{ padding: '14px 28px', backgroundColor: '#eab308', color: 'black', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '16px' }}>
            Browse the driver feed
          </Link>
          <Link href="/signup" style={{ padding: '14px 28px', backgroundColor: 'transparent', color: 'white', border: '2px solid #eab308', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '16px' }}>
            Join free
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 16px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', margin: '0 0 32px', color: '#1f2937' }}>
          Everything a UK driver needs, in one place
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {features.map((f) => (
            <Link key={f.href} href={f.href} style={{ display: 'block', backgroundColor: 'white', borderRadius: '12px', padding: '24px', textDecoration: 'none', color: 'inherit', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }} aria-hidden="true">{f.emoji}</div>
              <h3 style={{ fontSize: '19px', fontWeight: 700, margin: '0 0 8px', color: '#1f2937' }}>{f.title}</h3>
              <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.6, margin: 0 }}>{f.text}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest blog posts */}
      {posts.length > 0 && (
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px 48px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 24px', color: '#1f2937' }}>Latest from the blog</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {posts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} style={{ display: 'block', backgroundColor: 'white', borderRadius: '12px', padding: '24px', textDecoration: 'none', color: 'inherit', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: '#1f2937', lineHeight: 1.3 }}>{p.title}</h3>
                {p.excerpt && <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.6, margin: '0 0 12px' }}>{p.excerpt}</p>}
                <span style={{ color: '#b45309', fontWeight: 600, fontSize: '15px' }}>Read more →</span>
              </Link>
            ))}
          </div>
          <p style={{ marginTop: '20px' }}>
            <Link href="/blog" style={{ color: '#b45309', fontWeight: 600 }}>See all blog posts →</Link>
          </p>
        </section>
      )}

      {/* FAQ */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px 64px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 24px', color: '#1f2937' }}>Questions drivers ask</h2>
        {faqs.map((f) => (
          <div key={f.q} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px 24px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 8px', color: '#1f2937' }}>{f.q}</h3>
            <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.6, margin: 0 }}>{f.a}</p>
          </div>
        ))}
      </section>
    </div>
  )
}

