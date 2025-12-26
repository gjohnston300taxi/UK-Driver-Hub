import { ComingNext } from "@/components/coming-next"

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2">Profile</h1>
      <p className="text-muted-foreground mb-8">Manage your account settings</p>

      <ComingNext
        items={[
          "Personal information (name, email, phone)",
          "Profile photo upload and cropping",
          "Driver license details and verification",
          "Vehicle information and documents",
          "Notification preferences",
          "Privacy settings",
          "Language and region settings",
          "Account security (password, 2FA)",
          "Sign out functionality"
        ]}
      />
    </div>
  )
}
