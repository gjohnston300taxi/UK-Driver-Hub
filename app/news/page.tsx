import Nav from '@/components/nav'
import { Newspaper, Clock } from 'lucide-react'

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Industry News</h1>
          <p className="text-muted-foreground">
            Stay informed with the latest taxi and rideshare industry updates
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NewsCard
            title="New Regulations for UK Taxi Drivers"
            excerpt="Transport authorities announce updated safety requirements for all licensed drivers..."
            date="Dec 24, 2025"
            category="Regulations"
          />
          <NewsCard
            title="Electric Vehicle Incentives Expanded"
            excerpt="Government increases grants for taxi drivers switching to electric vehicles..."
            date="Dec 23, 2025"
            category="Environment"
          />
          <NewsCard
            title="Peak Season Tips for Drivers"
            excerpt="Maximize your earnings during the holiday season with these expert strategies..."
            date="Dec 22, 2025"
            category="Tips"
          />
          <NewsCard
            title="Airport Routes Optimization"
            excerpt="New traffic patterns implemented at major airports to reduce wait times..."
            date="Dec 21, 2025"
            category="Routes"
          />
          <NewsCard
            title="Driver Safety Training Updates"
            excerpt="Enhanced safety protocols now available in the training portal..."
            date="Dec 20, 2025"
            category="Safety"
          />
          <NewsCard
            title="Customer Rating System Improved"
            excerpt="New features help drivers better understand and improve their service ratings..."
            date="Dec 19, 2025"
            category="Features"
          />
        </div>
      </main>
    </div>
  )
}

function NewsCard({
  title,
  excerpt,
  date,
  category,
}: {
  title: string
  excerpt: string
  date: string
  category: string
}) {
  return (
    <div className="bg-white rounded-xl border p-6 hover:shadow-lg transition-all cursor-pointer group">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-taxi-yellow/10 text-taxi-yellow">
          {category}
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {date}
        </span>
      </div>
      <h3 className="font-semibold text-lg mb-2 group-hover:text-taxi-yellow transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{excerpt}</p>
    </div>
  )
}
