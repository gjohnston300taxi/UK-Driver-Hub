import { Car } from "lucide-react"
import Link from "next/link"
import { AppNav } from "@/components/app-nav"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // In the future, fetch user role from database
  // For now, we'll use a placeholder
  const userRole = user?.user_metadata?.role

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/feed" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center">
                <Car className="h-6 w-6 text-taxi-yellow" />
              </div>
              <span className="text-xl font-bold hidden sm:inline">UK Driver Hub</span>
            </Link>

            <AppNav userRole={userRole} />

            <form action="/auth/signout" method="post">
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="hover:text-taxi-yellow"
              >
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
