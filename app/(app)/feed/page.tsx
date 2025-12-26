import { ComingNext } from "@/components/coming-next"

export default function FeedPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2">Feed</h1>
      <p className="text-muted-foreground mb-8">Your personalized driver hub</p>

      <ComingNext
        items={[
          "Activity feed showing recent bookings and updates",
          "Quick stats dashboard (earnings today, rides completed)",
          "Upcoming scheduled rides",
          "Important notifications and alerts",
          "Weather and traffic conditions",
          "Promotional opportunities and bonuses",
          "Driver performance metrics"
        ]}
      />
    </div>
  )
}
