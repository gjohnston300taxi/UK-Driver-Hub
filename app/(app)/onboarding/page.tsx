import { ComingNext } from "@/components/coming-next"

export default function OnboardingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2">Welcome!</h1>
      <p className="text-muted-foreground mb-8">Let's get you started</p>

      <ComingNext
        items={[
          "Multi-step onboarding wizard",
          "Personal information collection",
          "Driver license upload and verification",
          "Vehicle details and registration",
          "Background check initiation",
          "Bank account setup for payments",
          "Training video completion tracking",
          "Terms acceptance and digital signature",
          "Progress indicator showing completion status"
        ]}
      />
    </div>
  )
}
