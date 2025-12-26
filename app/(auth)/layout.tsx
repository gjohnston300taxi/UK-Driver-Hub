import { Car } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center">
              <Car className="h-6 w-6 text-taxi-yellow" />
            </div>
            <span className="text-xl font-bold">UK Driver Hub</span>
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
