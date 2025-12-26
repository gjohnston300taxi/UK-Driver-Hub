import { ComingNext } from "@/components/coming-next"

export default function FinancePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2">Finance</h1>
      <p className="text-muted-foreground mb-8">Manage your earnings and expenses</p>

      <ComingNext
        items={[
          "Earnings dashboard with weekly/monthly views",
          "Transaction history and detailed breakdown",
          "Payment method management",
          "Instant payout options",
          "Expense tracking and categorization",
          "Tax summary and downloadable reports",
          "Charts showing earnings trends",
          "Export data to CSV or PDF"
        ]}
      />
    </div>
  )
}
