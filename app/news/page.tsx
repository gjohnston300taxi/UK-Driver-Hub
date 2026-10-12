import type { Metadata } from 'next'
import Link from 'next/link'
import { createPublicClient } from '@/lib/supabase/public'
import { NEWS_CATEGORIES, NEWS_PAGE_SIZE, NEWS_FONT, formatNewsDate, type NewsItem } from '@/lib/news'

// Built on the server so Google can read the headlines.
export const revalidate = 600

type SearchParams = { page?: string; category?: string }

function readParams(searchParams: SearchParams) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1)
  const category = NEWS_CATEGORIES.includes(searchParams.category || '') ? searchParams.category! : null
  return { page, category }
}

function newsHref(page: number, category: string | null) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `/news?${qs}` : '/news'
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { page, category } = readParams(searchParams)
  const base = category ? `${category}: UK Taxi & Private Hire News` : 'UK Taxi & Private Hire Industry News'
  const title = page > 1 ? `${base} (page ${page})` : base
  return {
    title,
    description:
      'The latest news for UK taxi, private hire and rideshare drivers: licensing, council and TfL updates, Uber and Bolt, fares, tax and regulation, with what it means for drivers.',
    alternates: { canonical: newsHref(page, category) },
    openGraph: { url: newsHref(page, category), title },
  }
}

async function getNews(page: number, category: string | null) {
  try {
    const supabase = createPublicClient()
    const from = (page - 1) * NEWS_PAGE_SIZE
    let query = supabase
      .from('news')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + NEWS_PAGE_SIZE - 1)
    if (category) query = query.eq('category', category)
    const { data, count, error } = await query

    // Count stories in each category for the filter buttons
    const { data: cats } = await supabase.from('news').select('category')
    const counts: Record<string, number> = {}
    for (const row of cats || []) {
      const c = row.category || 'Industry News'
      counts[c] = (counts[c] || 0) + 1
    }

    if (error) return { items: [] as NewsItem[], total: 0, counts }
    return { items: (data || []) as NewsItem[], total: count || 0, counts }
  } catch {
    return { items: [] as NewsItem[], total: 0, counts: {} as Record<string, number> }
  }
}

const preview = (text: string | null, max = 220) => {
  if (!text) return ''
  return text.length <= max ? text : text.slice(0, max).replace(/\s+\S*$/, '') + '…'
}

function NewsCard({ item, featured = false }: { item: NewsItem; featured?: boolean }) {
  return (
    <a href={`/news/${item.id}`} className={`news-card${featured ? ' news-card--featured' : ''}`}>
      <div className="news-meta">
        <span className="news-pill">{item.category || 'Industry News'}</span>
        <time dateTime={item.created_at}>{formatNewsDate(item.created_at)}</time>
      </div>
      <h2 className="news-title">{item.title}</h2>
      {item.source && <p className="news-source">{item.source}</p>}
      <p className="news-summary">{preview(item.summary, featured ? 360 : 200)}</p>
      {item.takeaway && (
        <div className="news-takeaway">
          <strong>What it means for drivers:</strong> {item.takeaway}
        </div>
      )}
      <span className="news-more">Read more →</span>
    </a>
  )
}

export default async function NewsPage({ searchParams }: { searchParams: SearchParams }) {
  const { page, category } = readParams(searchParams)
  const { items, total, counts } = await getNews(page, category)
  const totalPages = Math.max(1, Math.ceil(total / NEWS_PAGE_SIZE))
  const allCount = Object.values(counts).reduce((a, b) => a + b, 0)
  const showFeatured = page === 1 && !category && items.length > 0
  const featured = showFeatured ? items[0] : null
  const rest = showFeatured ? items.slice(1) : items
  const latest = items[0]?.created_at

  return (
    <div className="news-page">
      <style dangerouslySetInnerHTML={{ __html: `
        .news-page { font-family: ${NEWS_FONT}; background: #f3f4f6; min-height: 100vh; color: #111827; }
        .news-hero { background: #1f2937; color: #fff; padding: 36px 16px 28px; }
        .news-hero-inner, .news-body { max-width: 1040px; margin: 0 auto; }
        .news-hero h1 { margin: 0 0 8px; font-size: clamp(26px, 4vw, 36px); font-weight: 800; letter-spacing: -0.02em; }
        .news-hero p { margin: 0; color: #d1d5db; font-size: 16px; line-height: 1.5; max-width: 640px; }
        .news-hero small { display: block; margin-top: 10px; color: #9ca3af; font-size: 13px; }
        .news-body { padding: 20px 16px 48px; }
        .news-filters { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 20px; scrollbar-width: thin; }
        .news-chip { flex: 0 0 auto; padding: 8px 14px; border-radius: 999px; border: 1px solid #d1d5db; background: #fff; color: #374151; text-decoration: none; font-size: 14px; font-weight: 600; white-space: nowrap; }
        .news-chip:hover { border-color: #eab308; }
        .news-chip--active { background: #eab308; border-color: #eab308; color: #111827; }
        .news-chip span { font-weight: 400; color: inherit; opacity: 0.7; margin-left: 4px; }
        .news-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 760px) { .news-grid { grid-template-columns: 1fr 1fr; } }
        .news-card { display: flex; flex-direction: column; background: #fff; border-radius: 14px; padding: 20px; text-decoration: none; color: inherit; border: 1px solid #e5e7eb; box-shadow: 0 1px 2px rgba(0,0,0,0.04); transition: box-shadow .15s, transform .15s, border-color .15s; }
        .news-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); transform: translateY(-2px); border-color: #eab308; }
        .news-card--featured { margin-bottom: 16px; padding: 28px; border-left: 6px solid #eab308; }
        .news-card--featured .news-title { font-size: clamp(22px, 3vw, 28px); }
        .news-meta { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 13px; color: #6b7280; }
        .news-pill { background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
        .news-title { margin: 0 0 6px; font-size: 19px; line-height: 1.3; font-weight: 700; color: #111827; letter-spacing: -0.01em; }
        .news-source { margin: 0 0 10px; font-size: 13px; color: #6b7280; font-weight: 600; }
        .news-summary { margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: #4b5563; }
        .news-takeaway { margin: 0 0 12px; padding: 10px 12px; background: #f9fafb; border-left: 3px solid #eab308; border-radius: 6px; font-size: 14px; line-height: 1.5; color: #374151; }
        .news-more { margin-top: auto; font-size: 14px; font-weight: 700; color: #b45309; }
        .news-empty { background: #fff; border-radius: 14px; padding: 40px 20px; text-align: center; color: #6b7280; }
        .news-pager { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 28px; font-size: 14px; color: #4b5563; }
        .news-pager a { padding: 10px 16px; background: #fff; border: 1px solid #d1d5db; border-radius: 10px; text-decoration: none; color: #111827; font-weight: 600; }
        .news-pager a:hover { border-color: #eab308; }
        .news-pager .disabled { visibility: hidden; }
      ` }} />

      <section className="news-hero">
        <div className="news-hero-inner">
          <h1>{category ? category : 'Taxi & Private Hire News'}</h1>
          <p>The latest UK news for taxi, private hire and rideshare drivers, and what it means for you.</p>
          {latest && <small>Last updated {formatNewsDate(latest)} · {allCount} stories</small>}
        </div>
      </section>

      <div className="news-body">
        <nav className="news-filters" aria-label="Filter news by category">
          <Link href="/news" className={`news-chip${!category ? ' news-chip--active' : ''}`}>
            All<span>{allCount}</span>
          </Link>
          {NEWS_CATEGORIES.filter((c) => counts[c]).map((c) => (
            <Link key={c} href={newsHref(1, c)} className={`news-chip${category === c ? ' news-chip--active' : ''}`}>
              {c}<span>{counts[c]}</span>
            </Link>
          ))}
        </nav>

        {items.length === 0 ? (
          <div className="news-empty">No news stories here yet. Check back soon!</div>
        ) : (
          <>
            {featured && <NewsCard item={featured} featured />}
            <div className="news-grid">
              {rest.map((item) => <NewsCard key={item.id} item={item} />)}
            </div>
          </>
        )}

        {totalPages > 1 && (
          <nav className="news-pager" aria-label="News pages">
            <Link href={newsHref(page - 1, category)} className={page <= 1 ? 'disabled' : ''} aria-disabled={page <= 1}>
              ← Newer
            </Link>
            <span>Page {page} of {totalPages}</span>
            <Link href={newsHref(page + 1, category)} className={page >= totalPages ? 'disabled' : ''} aria-disabled={page >= totalPages}>
              Older →
            </Link>
          </nav>
        )}
      </div>
    </div>
  )
}
