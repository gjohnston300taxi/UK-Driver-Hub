import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/public'
import { SITE_URL, SITE_NAME } from '@/lib/site'

// News articles are now free to read for everyone (no sign-in),
// and built on the server so Google can read them.
export const revalidate = 600

interface NewsItem {
  id: string
  title: string
  summary: string | null
  source: string | null
  source_url: string | null
  category: string | null
  created_at: string
}

async function getArticle(id: string): Promise<NewsItem | null> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('news')
      .select('id, title, summary, source, source_url, category, created_at')
      .eq('id', id)
      .single()
    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

function makeDescription(article: NewsItem) {
  const plain = (article.summary || article.title).replace(/\s+/g, ' ').trim()
  return plain.length > 155 ? plain.slice(0, 152).trim() + '...' : plain
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = await getArticle(params.id)
  if (!article) return { title: 'Article not found', robots: { index: false } }
  const description = makeDescription(article)
  const url = `/news/${article.id}`
  return {
    title: article.title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'article', url, title: article.title, description, publishedTime: article.created_at },
    twitter: { card: 'summary', title: article.title, description },
  }
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export default async function NewsArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id)
  if (!article) notFound()

  const pageUrl = `${SITE_URL}/news/${article.id}`
  // Share buttons now share YOUR page, so visitors come back to UK Driver Hub
  const shareText = encodeURIComponent(article.title)
  const shareUrl = encodeURIComponent(pageUrl)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: makeDescription(article),
    datePublished: article.created_at,
    image: [`${SITE_URL}/logo.png`],
    publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` } },
    mainEntityOfPage: pageUrl,
    ...(article.source_url ? { isBasedOn: article.source_url } : {}),
  }

  const backLink = (
    <a href="/news" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#666', textDecoration: 'none', marginBottom: '16px', fontSize: '14px' }}>
      ← Back to News
    </a>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>
        {backLink}

        <article style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {/* Category & Date */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            {article.category && (
              <span style={{ padding: '6px 12px', backgroundColor: '#eab308', color: 'black', borderRadius: '16px', fontSize: '13px', fontWeight: '500' }}>
                {article.category}
              </span>
            )}
            <time dateTime={article.created_at} style={{ fontSize: '14px', color: '#999' }}>
              {formatDate(article.created_at)}
            </time>
          </div>

          <h1 style={{ margin: '0 0 20px 0', fontSize: '28px', fontWeight: '700', lineHeight: '1.3', color: '#111' }}>
            {article.title}
          </h1>

          {article.source && (
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📰 Source: <strong>{article.source}</strong></span>
            </div>
          )}

          <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '20px 0' }} />

          <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', whiteSpace: 'pre-wrap' }}>
            {article.summary}
          </div>

          {article.source_url && (
            <div style={{ marginTop: '24px' }}>
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#eab308', color: 'black', borderRadius: '8px', textDecoration: 'none', fontSize: '15px', fontWeight: '600' }}
              >
                📖 Read Full Article on {article.source || 'the original site'}
              </a>
            </div>
          )}

          {/* Share Section */}
          <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
              Share this article:
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer"
                style={{ padding: '8px 16px', backgroundColor: '#1DA1F2', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>
                Twitter
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer"
                style={{ padding: '8px 16px', backgroundColor: '#4267B2', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>
                Facebook
              </a>
              <a href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + pageUrl)}`} target="_blank" rel="noopener noreferrer"
                style={{ padding: '8px 16px', backgroundColor: '#25D366', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>
                WhatsApp
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
