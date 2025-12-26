import { ComingNext } from "@/components/coming-next"

export default function SignUpPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Sign Up</h1>
      <p className="text-muted-foreground mb-8">Create your account</p>

      <ComingNext
        items={[
          "Registration form (email, password, name)",
          "Password strength indicator",
          "Terms and conditions checkbox",
          "OAuth registration options",
          "Email verification flow",
          "Auto-login after successful registration",
          "Redirect to onboarding flow"
        ]}
      />
    </div>
  )
}
