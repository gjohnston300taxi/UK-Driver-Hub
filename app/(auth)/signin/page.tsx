import { ComingNext } from "@/components/coming-next"

export default function SignInPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Sign In</h1>
      <p className="text-muted-foreground mb-8">Access your account</p>

      <ComingNext
        items={[
          "Email and password authentication form",
          "OAuth providers (Google, Apple)",
          "Remember me functionality",
          "Password visibility toggle",
          "Form validation and error handling",
          "Redirect to onboarding for new users",
          "Redirect to feed for existing users"
        ]}
      />
    </div>
  )
}
