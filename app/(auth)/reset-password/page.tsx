import { ComingNext } from "@/components/coming-next"

export default function ResetPasswordPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Reset Password</h1>
      <p className="text-muted-foreground mb-8">Recover your account</p>

      <ComingNext
        items={[
          "Email input form",
          "Send reset link functionality",
          "Password reset confirmation page",
          "New password input form",
          "Password match validation",
          "Success message and redirect to sign in",
          "Rate limiting for security"
        ]}
      />
    </div>
  )
}
