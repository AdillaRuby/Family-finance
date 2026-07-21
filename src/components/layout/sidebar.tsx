"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { navGroups } from "./nav-items"
import { Wallet2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col border-r bg-card fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Wallet2 className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-lg tracking-tight">Family Finance</span>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-3 py-4">
        <SidebarNav pathname={pathname} />
      </ScrollArea>
    </aside>
  )
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-50 h-screen w-64 flex flex-col border-r bg-card lg:hidden"
          >
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-6 border-b">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Wallet2 className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-lg tracking-tight">Family Finance</span>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Tutup menu">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Nav */}
            <ScrollArea className="flex-1 px-3 py-4">
              <SidebarNav pathname={pathname} onItemClick={onClose} />
            </ScrollArea>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Shared Nav Content ───────────────────────────────────────────────────────

interface SidebarNavProps {
  pathname: string
  onItemClick?: () => void
}

function SidebarNav({ pathname, onItemClick }: SidebarNavProps) {
  return (
    <nav className="space-y-6">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {group.label}
          </p>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href)

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onItemClick}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto text-xs bg-primary/20 text-primary rounded-full px-1.5 py-0.5">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
