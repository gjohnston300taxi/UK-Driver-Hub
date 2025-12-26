import { ComingNext } from "@/components/coming-next"

export default function NewsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2">News</h1>
      <p className="text-muted-foreground mb-8">Stay updated with the latest</p>

      <ComingNext
        items={[
          "Company announcements and updates",
          "Industry news relevant to taxi drivers",
          "Regulatory changes and compliance updates",
          "New feature releases",
          "Driver success stories",
          "Seasonal tips and best practices",
          "Filter by category (company, industry, regulations)"
        ]}
      />
    </div>
  )
}
