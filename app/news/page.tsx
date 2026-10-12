import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase/public'

// Built on the server so Google can read the headlines.
// Refreshes at most every 10 minutes so new stories show up.
export const revalidate = 600

export const metadata: Metadata = {
  title: 'UK Taxi & Private Hire Industry News',
  description:
    'The latest news for UK taxi, private hire and rideshare drivers: licensing, council and TfL updates, Uber and Bolt, fares, insurance and regulation.',
  alternates: { canonical: '/news' },
  openGraph: { url: '/news', title: 'UK Taxi & Private Hire Industry News' },
}

interface NewsItem {
  id: string
  title: string
  summary: string | null
  source: string | null
  source_url: string | null
  category: string | null
  created_at: string
}

async function getNews(): Promise<NewsItem[]> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('news')
      .select('id, title, summary, source, source_url, category, created_at')
      .order('created_at', { ascending: false })
    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

// Fixed dates (e.g. "3 Oct 2026") so the page is the same for Google and visitors
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const getPreview = (text: string | null, maxLength: number = 150) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

export default async function NewsPage() {
  const news = await getNews()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Industry News</h1>

        {news.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '40px 20px', textAlign: 'center', color: '#666', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            No news articles yet. Check back soon!
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {news.map((item) => (
              <a
                key={item.id}
                href={`/news/${item.id}`}
                style={{ display: 'block', backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textDecoration: 'none', color: 'inherit', border: '1px solid #e5e7eb' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ padding: '4px 10px', backgroundColor: '#eab308', color: 'black', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                    {item.category || 'News'}
                  </span>
                  <time dateTime={item.created_at} style={{ fontSize: '13px', color: '#999' }}>{formatDate(item.created_at)}</time>
                </div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', lineHeight: '1.3', color: '#111' }}>
                  {item.title}
                </h2>
                {item.source && (
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#888' }}>
                    {item.source}
                  </p>
                )}
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                  {getPreview(item.summary)}
                </p>
                <span style={{ fontSize: '14px', color: '#eab308', fontWeight: '500' }}>
                  Read more
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
