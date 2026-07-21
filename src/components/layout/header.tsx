"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Breadcrumb } from "./breadcrumb"
import { ThemeToggle } from "./theme-toggle"
import { UserMenu } from "./user-menu"
import { NotificationBell } from "./notification-bell"
import { MobileDrawer } from "./sidebar"
import type { Role, Notification } from "@prisma/client"

interface HeaderProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: Role
    familyName?: string
  }
  notifications: Notification[]
  unreadCount: number
}

export function Header({ user, notifications, unreadCount }: HeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9"
          onClick={() => setDrawerOpen(true)}
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumb */}
        <div className="flex-1 min-w-0">
          <Breadcrumb />
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          <NotificationBell 
            userId={user.id} 
            initialNotifications={notifications}
            initialUnreadCount={unreadCount}
          />
          <ThemeToggle />
          <UserMenu
            name={user.name}
            email={user.email}
            image={user.image}
            role={user.role}
            familyName={user.familyName}
          />
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
