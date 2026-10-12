import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/public'
import { SITE_URL, SITE_NAME } from '@/lib/site'
import { NEWS_FONT, formatNewsDate, type NewsItem } from '@/lib/news'

// News articles are free to read for everyone (no sign-in),
// and built on the server so Google can read them.
export const revalidate = 600

async function getArticle(id: string): Promise<NewsItem | null> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase.from('news').select('*').eq('id', id).single()
    if (error || !data) return null
    return data as NewsItem
  } catch {
    return null
  }
}

async function getRelated(article: NewsItem): Promise<NewsItem[]> {
  try {
    const supabase = createPublicClient()
    let query = supabase
      .from('news')
      .select('id, title, category, created_at, source')
      .neq('id', article.id)
      .order('created_at', { ascending: false })
      .limit(4)
    if (article.category) query = query.eq('category', article.category)
    const { data } = await query
    return (data || []) as NewsItem[]
  } catch {
    return []
  }
}

function makeDescription(article: NewsItem) {
  const plain = (article.takeaway || article.summary || article.title).replace(/\s+/g, ' ').trim()
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

const formatLongDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export default async function NewsArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id)
  if (!article) notFound()
  const related = await getRelated(article)

  const pageUrl = `${SITE_URL}/news/${article.id}`
  // Share buttons share YOUR page, so visitors come back to UK Driver Hub
  const shareText = encodeURIComponent(article.title)
  const shareUrl = encodeURIComponent(pageUrl)
  const category = article.category || 'Industry News'

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

  return (
    <div className="article-page">
      <style dangerouslySetInnerHTML={{ __html: `
        .article-page { font-family: ${NEWS_FONT}; background: #f3f4f6; min-height: 100vh; color: #111827; }
        .article-wrap { max-width: 720px; margin: 0 auto; padding: 20px 16px 48px; }
        .article-back { display: inline-block; color: #4b5563; text-decoration: none; font-size: 14px; font-weight: 600; margin-bottom: 14px; }
        .article-back:hover { color: #b45309; }
        .article-card { background: #fff; border-radius: 16px; padding: clamp(20px, 4vw, 36px); border: 1px solid #e5e7eb; }
        .article-meta { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; font-size: 14px; color: #6b7280; }
        .article-pill { background: #fef3c7; color: #92400e; padding: 5px 12px; border-radius: 999px; font-size: 13px; font-weight: 700; text-decoration: none; }
        .article-card h1 { margin: 0 0 12px; font-size: clamp(24px, 4vw, 32px); line-height: 1.25; font-weight: 800; letter-spacing: -0.02em; }
        .article-source { margin: 0 0 20px; font-size: 14px; color: #6b7280; }
        .article-text { font-size: 17px; line-height: 1.75; color: #374151; white-space: pre-wrap; margin: 0; }
        .article-takeaway { margin: 24px 0 0; padding: 16px 18px; background: #fffbeb; border: 1px solid #fde68a; border-left: 5px solid #eab308; border-radius: 10px; }
        .article-takeaway h2 { margin: 0 0 6px; font-size: 15px; font-weight: 800; color: #92400e; text-transform: uppercase; letter-spacing: 0.03em; }
        .article-takeaway p { margin: 0; font-size: 16px; line-height: 1.6; color: #374151; }
        .article-btn { display: inline-block; margin-top: 24px; padding: 12px 20px; background: #eab308; color: #111827; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; }
        .article-share { margin-top: 28px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        .article-share p { margin: 0 0 10px; font-size: 14px; color: #6b7280; }
        .article-share div { display: flex; gap: 8px; flex-wrap: wrap; }
        .article-share a { padding: 8px 14px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; color: #fff; }
        .article-related { margin-top: 28px; }
        .article-related h2 { font-size: 18px; margin: 0 0 12px; }
        .article-related a { display: block; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; text-decoration: none; color: #111827; }
        .article-related a:hover { border-color: #eab308; }
        .article-related strong { display: block; font-size: 16px; line-height: 1.35; margin-bottom: 4px; }
        .article-related span { font-size: 13px; color: #6b7280; }
        .article-join { margin-top: 28px; background: #1f2937; color: #fff; border-radius: 16px; padding: 24px; text-align: center; }
        .article-join p { margin: 0 0 14px; color: #d1d5db; }
      ` }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <div className="article-wrap">
        <Link href="/news" className="article-back">← All news</Link>

        <article className="article-card">
          <div className="article-meta">
            <Link href={`/news?category=${encodeURIComponent(category)}`} className="article-pill">{category}</Link>
            <time dateTime={article.created_at}>{formatLongDate(article.created_at)}</time>
          </div>

          <h1>{article.title}</h1>
          {article.source && <p className="article-source">Source: <strong>{article.source}</strong></p>}

          <p className="article-text">{article.summary}</p>

          {article.takeaway && (
            <div className="article-takeaway">
              <h2>What it means for drivers</h2>
              <p>{article.takeaway}</p>
            </div>
          )}

          {article.source_url && (
            <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="article-btn">
              Read the full story on {article.source || 'the original site'} ↗
            </a>
          )}

          <div className="article-share">
            <p>Share this story with other drivers:</p>
            <div>
              <a href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + pageUrl)}`} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#25D366' }}>WhatsApp</a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#4267B2' }}>Facebook</a>
              <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#111827' }}>X / Twitter</a>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="article-related">
            <h2>Related stories</h2>
            {related.map((r) => (
              <Link key={r.id} href={`/news/${r.id}`}>
                <strong>{r.title}</strong>
                <span>{formatNewsDate(r.created_at)}{r.source ? ` · ${r.source}` : ''}</span>
              </Link>
            ))}
          </section>
        )}

        <div className="article-join">
          <p>Talk about this story with drivers across the UK.</p>
          <Link href="/feed" className="article-btn" style={{ marginTop: 0 }}>Join the conversation</Link>
        </div>
      </div>
    </div>
  )
}
