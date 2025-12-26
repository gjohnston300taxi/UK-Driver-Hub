import { ComingNext } from "@/components/coming-next"

export default function ResourcesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2">Resources</h1>
      <p className="text-muted-foreground mb-8">Tools and guides for drivers</p>

      <ComingNext
        items={[
          "Driver handbook and training materials",
          "Vehicle maintenance guides",
          "Insurance information and support",
          "Tax and accounting resources",
          "Safety protocols and emergency procedures",
          "Customer service best practices",
          "FAQ section and video tutorials",
          "Downloadable forms and checklists"
        ]}
      />
    </div>
  )
}
