import { ComingNext } from "@/components/coming-next"

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Manage platform operations</p>

      <ComingNext
        items={[
          "User management (drivers, riders, admins)",
          "System analytics and reporting",
          "Content moderation tools",
          "Feature flags and configuration",
          "Driver verification workflow",
          "Support ticket management",
          "Platform-wide announcements",
          "Audit logs and activity monitoring",
          "Role and permission management"
        ]}
      />
    </div>
  )
}
