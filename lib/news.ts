// Shared settings for the news pages and the admin News tab.

export const NEWS_CATEGORIES = [
  'Industry News',
  'Regulation Update',
  'Local News',
  'Safety',
  'Technology',
  'Business Tips',
  'Events',
  'Announcements',
]

export const NEWS_PAGE_SIZE = 20

export interface NewsItem {
  id: string
  title: string
  summary: string | null
  takeaway?: string | null
  source: string | null
  source_url: string | null
  category: string | null
  created_at: string
  image_url?: string | null
}

// Turns a picture address into a full web address (needed for social media previews)
export const absoluteImageUrl = (url: string | null | undefined, siteUrl: string) =>
  !url ? null : url.startsWith('http') ? url : `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`

export const formatNewsDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

// Modern font used on the news pages
export const NEWS_FONT =
  'system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif'
