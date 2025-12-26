"use client"

import { Car, Newspaper, BookOpen, Wallet, ShoppingBag, User, Shield } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface AppNavProps {
  userRole?: string
}

const navItems = [
  { href: "/feed", label: "Feed", icon: Car },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/resources", label: "Resources", icon: BookOpen },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/profile", label: "Profile", icon: User },
]

export function AppNav({ userRole }: AppNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-taxi-yellow text-black"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        )
      })}

      {userRole === "admin" && (
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
            pathname === "/admin"
              ? "bg-taxi-yellow text-black"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <Shield className="h-4 w-4" />
          <span className="hidden md:inline">Admin</span>
        </Link>
      )}
    </nav>
  )
}
