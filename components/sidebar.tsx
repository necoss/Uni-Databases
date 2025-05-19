"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Clock, FolderKanban, CheckSquare, BarChart, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Employees",
    icon: Users,
    href: "/employees",
    color: "text-violet-500",
  },
  {
    label: "Attendances",
    icon: Clock,
    href: "/attendances",
    color: "text-pink-700",
  },
  {
    label: "Projects",
    icon: FolderKanban,
    href: "/projects",
    color: "text-orange-500",
  },
  {
    label: "Tasks",
    icon: CheckSquare,
    href: "/tasks",
    color: "text-emerald-500",
  },
  {
    label: "Reports",
    icon: BarChart,
    href: "/reports",
    color: "text-blue-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-gray-500",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-muted/40">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-10">
          <h1 className="text-2xl font-bold">DB Manager</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                pathname === route.href ? "text-primary bg-primary/10" : "text-muted-foreground",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
        <ModeToggle />
      </div>
    </div>
  )
}
