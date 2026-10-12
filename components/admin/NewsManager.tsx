'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { NEWS_CATEGORIES, type NewsItem } from '@/lib/news'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PAGE_SIZE = 25

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const todayInput = () => new Date().toISOString().slice(0, 10)

// Simple text tidy for comparing titles
const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()

const input: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', boxSizing: 'border-box', fontFamily: 'inherit' }
const label: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }
const help: React.CSSProperties = { margin: '6px 0 0', fontSize: '12px', color: '#6b7280' }
const btn = (bg: string, color = '#111827'): React.CSSProperties => ({ padding: '10px 16px', backgroundColor: bg, color, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px' })

export default function NewsManager() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('All')
  const [shown, setShown] = useState(PAGE_SIZE)
  const [editing, setEditing] = useState<NewsItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')

  const load = async () => {
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false })
    setNews((data || []) as NewsItem[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const flash = (text: string) => {
    setMessage(text)
    setTimeout(() => setMessage(''), 3000)
  }

  const sources = useMemo(
    () => Array.from(new Set(news.map((n) => (n.source || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [news]
  )

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    news.forEach((n) => { const k = n.category || 'Industry News'; c[k] = (c[k] || 0) + 1 })
    return c
  }, [news])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return news.filter((n) => {
      if (filter === 'Missing takeaway' && n.takeaway) return false
      if (filter !== 'All' && filter !== 'Missing takeaway' && (n.category || 'Industry News') !== filter) return false
      if (!q) return true
      return [n.title, n.source, n.summary].some((v) => (v || '').toLowerCase().includes(q))
    })
  }, [news, search, filter])

  const changeCategory = async (item: NewsItem, category: string) => {
    setNews((prev) => prev.map((n) => (n.id === item.id ? { ...n, category } : n)))
    const { error } = await supabase.from('news').update({ category }).eq('id', item.id)
    if (error) { alert('Could not change the category. Please try again.'); load() } else flash('Category updated')
  }

  const remove = async (item: NewsItem) => {
    if (!confirm(`Delete this story?\n\n"${item.title}"\n\nThis cannot be undone.`)) return
    const { error } = await supabase.from('news').delete().eq('id', item.id)
    if (error) alert('Could not delete. Please try again.')
    else { setNews((prev) => prev.filter((n) => n.id !== item.id)); flash('Story deleted') }
  }

  const lastAdded = news[0]?.created_at
  const daysSince = lastAdded ? Math.floor((Date.now() - new Date(lastAdded).getTime()) / 86400000) : null

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', margin: 0 }}>News ({news.length})</h2>
          {daysSince !== null && (
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: daysSince > 14 ? '#b91c1c' : '#6b7280' }}>
              Last story added {daysSince === 0 ? 'today' : `${daysSince} day${daysSince === 1 ? '' : 's'} ago`}
              {daysSince > 14 ? ' - time for a fresh story!' : ''}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a href="/news" target="_blank" rel="noopener noreferrer" style={{ ...btn('#f3f4f6'), textDecoration: 'none' }}>View news page ↗</a>
          <button onClick={() => { setEditing(null); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }} style={btn('#eab308')}>+ Add story</button>
        </div>
      </div>

      {message && <div style={{ background: '#dcfce7', color: '#166534', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '14px' }}>{message}</div>}

      {showForm && (
        <NewsForm
          item={editing}
          existing={news}
          sources={sources}
          onSaved={(text) => { setShowForm(false); setEditing(null); load(); flash(text) }}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {/* Search and filter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '8px 0 12px' }}>
        <input
          type="search"
          placeholder="Search titles, sources or text..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setShown(PAGE_SIZE) }}
          style={{ ...input, flex: '1 1 240px', width: 'auto' }}
        />
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setShown(PAGE_SIZE) }} style={{ ...input, flex: '0 1 240px', width: 'auto' }}>
          <option value="All">All categories ({news.length})</option>
          {NEWS_CATEGORIES.map((c) => <option key={c} value={c}>{c} ({counts[c] || 0})</option>)}
          <option value="Missing takeaway">Missing "what it means" ({news.filter((n) => !n.takeaway).length})</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No stories match.</p>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {filtered.slice(0, shown).map((item) => (
            <div key={item.id} style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 300px', minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <select
                      value={item.category || 'Industry News'}
                      onChange={(e) => changeCategory(item, e.target.value)}
                      title="Change category"
                      style={{ fontSize: '12px', fontWeight: 700, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', borderRadius: '999px', padding: '3px 8px', cursor: 'pointer' }}
                    >
                      {NEWS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {!item.takeaway && <span style={{ fontSize: '11px', color: '#9ca3af' }}>no "what it means"</span>}
                  </div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '15px', lineHeight: 1.35 }}>{item.title}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{item.source || 'No source'} • {formatDate(item.created_at)}</p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <a href={`/news/${item.id}`} target="_blank" rel="noopener noreferrer" style={{ ...btn('#e5e7eb'), padding: '6px 10px', fontSize: '12px', textDecoration: 'none' }}>View</a>
                  <button onClick={() => { setEditing(item); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }} style={{ ...btn('#3b82f6', '#fff'), padding: '6px 10px', fontSize: '12px' }}>Edit</button>
                  <button onClick={() => remove(item)} style={{ ...btn('#ef4444', '#fff'), padding: '6px 10px', fontSize: '12px' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length > shown && (
            <button onClick={() => setShown((s) => s + PAGE_SIZE)} style={{ ...btn('#f3f4f6'), justifySelf: 'center' }}>
              Show more ({filtered.length - shown} left)
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Add / edit form
// ---------------------------------------------------------------------------
function NewsForm({
  item, existing, sources, onSaved, onCancel,
}: {
  item: NewsItem | null
  existing: NewsItem[]
  sources: string[]
  onSaved: (message: string) => void
  onCancel: () => void
}) {
  const [sourceUrl, setSourceUrl] = useState(item?.source_url || '')
  const [title, setTitle] = useState(item?.title || '')
  const [summary, setSummary] = useState(item?.summary || '')
  const [takeaway, setTakeaway] = useState(item?.takeaway || '')
  const [source, setSource] = useState(item?.source || '')
  const [category, setCategory] = useState(item?.category || NEWS_CATEGORIES[0])
  const [date, setDate] = useState(item ? item.created_at.slice(0, 10) : todayInput())
  const [fetching, setFetching] = useState(false)
  const [fetchNote, setFetchNote] = useState('')
  const [saving, setSaving] = useState(false)

  // Warn if this link or headline is already on the site
  const duplicate = useMemo(() => {
    const url = sourceUrl.trim().replace(/\/$/, '')
    const t = normalise(title)
    return existing.find((n) => n.id !== item?.id && (
      (url && (n.source_url || '').trim().replace(/\/$/, '') === url) ||
      (t.length > 15 && normalise(n.title) === t)
    ))
  }, [sourceUrl, title, existing, item])

  const fetchDetails = async () => {
    if (!sourceUrl.trim()) { setFetchNote('Paste the link to the story first.'); return }
    setFetching(true)
    setFetchNote('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/link-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify({ url: sourceUrl.trim() }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { setFetchNote(json.error || 'Could not read that page. Please fill in the details by hand.'); return }
      if (json.title && !title) setTitle(json.title)
      if (json.description && !summary) setSummary(json.description)
      if (json.source && !source) setSource(json.source)
      if (json.published && /^\d{4}-\d{2}-\d{2}/.test(json.published)) setDate(json.published.slice(0, 10))
      setFetchNote('Details filled in. Please check them, and rewrite the summary in your own words.')
    } catch {
      setFetchNote('Could not read that page. Please fill in the details by hand.')
    } finally {
      setFetching(false)
    }
  }

  const save = async () => {
    if (!title.trim() || !summary.trim()) { alert('Please add a headline and a summary.'); return }
    if (duplicate && !confirm(`This looks like a story you already have:\n\n"${duplicate.title}"\n\nSave anyway?`)) return
    setSaving(true)

    // Keep the original time of day when editing; new stories use the current time
    const time = item && item.created_at.slice(0, 10) === date ? item.created_at : new Date(`${date}T${new Date().toTimeString().slice(0, 8)}`).toISOString()

    const data = {
      title: title.trim(),
      summary: summary.trim(),
      takeaway: takeaway.trim() || null,
      source: source.trim(),
      source_url: sourceUrl.trim(),
      category,
      created_at: time,
    }

    const { error } = item
      ? await supabase.from('news').update(data).eq('id', item.id)
      : await supabase.from('news').insert([data])

    setSaving(false)
    if (error) { alert('Could not save the story. Please try again.\n\n' + error.message); return }
    onSaved(item ? 'Story updated' : 'Story added')
  }

  return (
    <div style={{ padding: '16px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', marginBottom: '16px' }}>
      <h3 style={{ margin: '0 0 14px', fontSize: '17px' }}>{item ? 'Edit story' : 'Add a news story'}</h3>
      <div style={{ display: 'grid', gap: '14px' }}>
        {/* Step 1: link */}
        <div>
          <label style={label}>1. Link to the original story</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input type="url" placeholder="https://..." value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} style={{ ...input, flex: '1 1 260px', width: 'auto' }} />
            <button type="button" onClick={fetchDetails} disabled={fetching} style={btn('#1f2937', '#fff')}>{fetching ? 'Reading...' : 'Fill in from link'}</button>
          </div>
          <p style={help}>Paste the link, then click "Fill in from link" to fill in the headline, summary and source automatically.</p>
          {fetchNote && <p style={{ ...help, color: '#92400e', fontWeight: 600 }}>{fetchNote}</p>}
        </div>

        {duplicate && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 12px', borderRadius: '8px', fontSize: '14px' }}>
            ⚠️ You may already have this story: "{duplicate.title}" ({formatDate(duplicate.created_at)})
          </div>
        )}

        <div>
          <label style={label}>2. Headline</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={input} />
        </div>

        <div>
          <label style={label}>3. Summary <span style={{ fontWeight: 400, color: '#6b7280' }}>({summary.length} characters)</span></label>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} style={{ ...input, minHeight: '110px' }} />
          <p style={help}>2–4 sentences in your own words. Don't copy whole paragraphs from the original article.</p>
        </div>

        <div>
          <label style={label}>4. What it means for drivers <span style={{ fontWeight: 400, color: '#6b7280' }}>(recommended)</span></label>
          <textarea value={takeaway} onChange={(e) => setTakeaway(e.target.value)} placeholder="e.g. London drivers: clear any unpaid TfL charges before you renew." style={{ ...input, minHeight: '60px' }} />
          <p style={help}>One or two sentences of your own advice. This makes the story yours, and Google values it.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div>
            <label style={label}>Source</label>
            <input type="text" list="news-sources" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. BBC News" style={input} />
            <datalist id="news-sources">{sources.map((s) => <option key={s} value={s} />)}</datalist>
          </div>
          <div>
            <label style={label}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={input}>
              {NEWS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayInput()} style={input} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={save} disabled={saving} style={btn('#eab308')}>{saving ? 'Saving...' : item ? 'Save changes' : 'Publish story'}</button>
          <button onClick={onCancel} style={btn('#e5e7eb')}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
