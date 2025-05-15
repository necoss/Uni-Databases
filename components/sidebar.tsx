"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Users, Briefcase, ListTodo, CalendarDays, BarChart, Settings, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMobile } from "@/hooks/use-mobile"

const navItems = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/employees", label: "Сотрудники", icon: Users },
  { href: "/projects", label: "Проекты", icon: Briefcase },
  { href: "/tasks", label: "Задачи", icon: ListTodo },
  { href: "/attendances", label: "Посещаемость", icon: CalendarDays },
  { href: "/reports", label: "Отчеты", icon: BarChart },
  { href: "/settings", label: "Настройки", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [open, setOpen] = useState(false)

  const NavLinks = () => (
    <>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Система управления</h2>
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
                )}
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            )
          })}
        </div>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-40">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] sm:w-[300px]">
          <NavLinks />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="pb-12 w-64 border-r">
      <div className="space-y-4 py-4">
        <NavLinks />
      </div>
    </div>
  )
}
