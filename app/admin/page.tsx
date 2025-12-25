import Nav from '@/components/nav'
import { Shield, Users, Activity, AlertCircle, TrendingUp } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-taxi-yellow" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            System overview and management tools
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="h-6 w-6" />}
            title="Total Users"
            value="1,247"
            change="+12%"
            positive={true}
          />
          <StatCard
            icon={<Activity className="h-6 w-6" />}
            title="Active Drivers"
            value="342"
            change="+8%"
            positive={true}
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="Trips Today"
            value="892"
            change="+15%"
            positive={true}
          />
          <StatCard
            icon={<AlertCircle className="h-6 w-6" />}
            title="Pending Issues"
            value="7"
            change="-3"
            positive={true}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-xl font-semibold mb-6">Recent User Activity</h2>
            <div className="space-y-4">
              <UserActivityItem
                name="John Smith"
                action="Completed onboarding"
                time="5 minutes ago"
                type="driver"
              />
              <UserActivityItem
                name="Sarah Johnson"
                action="New registration"
                time="12 minutes ago"
                type="passenger"
              />
              <UserActivityItem
                name="Mike Wilson"
                action="Updated profile"
                time="23 minutes ago"
                type="driver"
              />
              <UserActivityItem
                name="Emma Brown"
                action="Completed training"
                time="1 hour ago"
                type="driver"
              />
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-xl font-semibold mb-6">System Status</h2>
            <div className="space-y-4">
              <StatusItem
                label="API Services"
                status="operational"
                uptime="99.9%"
              />
              <StatusItem
                label="Database"
                status="operational"
                uptime="100%"
              />
              <StatusItem
                label="Payment Gateway"
                status="operational"
                uptime="99.8%"
              />
              <StatusItem
                label="Notification Service"
                status="degraded"
                uptime="97.2%"
              />
            </div>
          </div>

          {/* Admin Actions */}
          <div className="lg:col-span-2 bg-white rounded-xl border p-6">
            <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <ActionButton title="Manage Users" description="View and edit user accounts" />
              <ActionButton title="Review Reports" description="Check submitted issues" />
              <ActionButton title="System Settings" description="Configure platform" />
              <ActionButton title="Analytics" description="View detailed reports" />
              <ActionButton title="Notifications" description="Send announcements" />
              <ActionButton title="Audit Logs" description="Review system activity" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({
  icon,
  title,
  value,
  change,
  positive,
}: {
  icon: React.ReactNode
  title: string
  value: string
  change: string
  positive: boolean
}) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="h-12 w-12 rounded-lg bg-taxi-yellow/10 flex items-center justify-center text-taxi-yellow">
          {icon}
        </div>
        <span
          className={`text-sm font-medium ${
            positive ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {change}
        </span>
      </div>
      <div className="text-sm text-muted-foreground mb-1">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function UserActivityItem({
  name,
  action,
  time,
  type,
}: {
  name: string
  action: string
  time: string
  type: string
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-taxi-yellow/10 flex items-center justify-center">
          <Users className="h-5 w-5 text-taxi-yellow" />
        </div>
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-sm text-muted-foreground">{action}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-muted-foreground">{time}</div>
        <div className="text-xs px-2 py-0.5 rounded-full bg-slate-100">
          {type}
        </div>
      </div>
    </div>
  )
}

function StatusItem({
  label,
  status,
  uptime,
}: {
  label: string
  status: string
  uptime: string
}) {
  const statusColors = {
    operational: 'bg-green-100 text-green-700',
    degraded: 'bg-yellow-100 text-yellow-700',
    down: 'bg-red-100 text-red-700',
  }

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="font-medium">{label}</div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{uptime}</span>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            statusColors[status as keyof typeof statusColors]
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  )
}

function ActionButton({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <button className="p-4 border-2 rounded-lg text-left hover:border-taxi-yellow hover:bg-taxi-yellow/5 transition-all group">
      <div className="font-semibold mb-1 group-hover:text-taxi-yellow transition-colors">
        {title}
      </div>
      <div className="text-sm text-muted-foreground">{description}</div>
    </button>
  )
}
