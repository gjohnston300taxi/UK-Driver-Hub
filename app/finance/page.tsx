import Nav from '@/components/nav'
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react'

export default function FinancePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Finance</h1>
          <p className="text-muted-foreground">
            Track your earnings and manage your finances
          </p>
        </div>

        {/* Earnings Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <EarningsCard
            title="Today's Earnings"
            amount="£124.50"
            change="+12%"
            positive={true}
          />
          <EarningsCard
            title="This Week"
            amount="£892.30"
            change="+8%"
            positive={true}
          />
          <EarningsCard
            title="This Month"
            amount="£3,547.80"
            change="-3%"
            positive={false}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Transactions */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Transactions</h2>
              <button className="text-sm text-taxi-yellow hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-4">
              <Transaction
                type="Trip"
                description="Airport to City Centre"
                amount="£45.20"
                date="Today, 2:30 PM"
              />
              <Transaction
                type="Trip"
                description="Local Journey"
                amount="£18.50"
                date="Today, 1:15 PM"
              />
              <Transaction
                type="Payout"
                description="Weekly Transfer"
                amount="-£892.30"
                date="Yesterday"
              />
              <Transaction
                type="Trip"
                description="City to Suburb"
                amount="£32.80"
                date="Yesterday, 6:45 PM"
              />
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-xl font-semibold mb-6">Payout Settings</h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Bank Account</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                    Active
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  ****1234 - Lloyds Bank
                </p>
              </div>

              <div className="border rounded-lg p-4 bg-slate-50">
                <div className="font-medium mb-2">Payout Schedule</div>
                <p className="text-sm text-muted-foreground mb-3">
                  Weekly on Mondays
                </p>
                <button className="text-sm text-taxi-yellow hover:underline">
                  Change Schedule
                </button>
              </div>

              <div className="pt-4 border-t">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-taxi-yellow text-taxi-yellow rounded-lg hover:bg-taxi-yellow hover:text-black transition-colors font-medium">
                  <Download className="h-4 w-4" />
                  Download Tax Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function EarningsCard({
  title,
  amount,
  change,
  positive,
}: {
  title: string
  amount: string
  change: string
  positive: boolean
}) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="text-sm text-muted-foreground mb-1">{title}</div>
      <div className="text-3xl font-bold mb-2">{amount}</div>
      <div
        className={`text-sm flex items-center gap-1 ${
          positive ? 'text-green-600' : 'text-red-600'
        }`}
      >
        <TrendingUp className="h-4 w-4" />
        {change} from last period
      </div>
    </div>
  )
}

function Transaction({
  type,
  description,
  amount,
  date,
}: {
  type: string
  description: string
  amount: string
  date: string
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div>
        <div className="font-medium">{description}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {date}
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold">{amount}</div>
        <div className="text-xs text-muted-foreground">{type}</div>
      </div>
    </div>
  )
}
