import Nav from '@/components/nav'
import { Clock, TrendingUp, Users } from 'lucide-react'

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Feed</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest activity and insights
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Clock className="h-6 w-6" />}
            title="Recent Activity"
            value="12"
            description="Updates today"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="Trending"
            value="24"
            description="Hot topics"
          />
          <StatCard
            icon={<Users className="h-6 w-6" />}
            title="Community"
            value="1.2k"
            description="Active drivers"
          />
        </div>

        {/* Feed Items */}
        <div className="space-y-4">
          <FeedItem
            title="Welcome to TaxiApp!"
            description="Get started by exploring the features available in the navigation menu. Check out News for industry updates, Resources for helpful guides, and more."
            timestamp="Just now"
            category="Getting Started"
          />
          <FeedItem
            title="New Driver Training Available"
            description="Enhanced safety training modules are now available in the Resources section. Complete them to improve your ratings."
            timestamp="2 hours ago"
            category="Training"
          />
          <FeedItem
            title="Peak Hours Update"
            description="Higher demand expected this weekend. Check the Finance section for earning opportunities."
            timestamp="5 hours ago"
            category="Earnings"
          />
        </div>
      </main>
    </div>
  )
}

function StatCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode
  title: string
  value: string
  description: string
}) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-taxi-yellow/10 flex items-center justify-center text-taxi-yellow">
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
    </div>
  )
}

function FeedItem({
  title,
  description,
  timestamp,
  category,
}: {
  title: string
  description: string
  timestamp: string
  category: string
}) {
  return (
    <div className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-taxi-yellow/10 text-taxi-yellow">
            {category}
          </span>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
