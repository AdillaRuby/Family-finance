"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react"
import type { Role } from "@prisma/client"
import Link from "next/link"

interface UserMenuProps {
  name?: string | null
  email?: string | null
  image?: string | null
  role?: Role
  familyName?: string
}

const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  PARENT: "Orang Tua",
  CHILD: "Anak",
}

export function UserMenu({ name, email, image, role, familyName }: UserMenuProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  function handleLogout() {
    startTransition(async () => {
      await signOut({ redirect: false })
      router.push("/login")
      router.refresh()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-lg p-1 hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Menu pengguna"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={image ?? undefined} alt={name ?? "User"} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
            {name}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="font-medium text-sm leading-none">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
            {familyName && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs text-muted-foreground">{familyName}</span>
                {role && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {roleLabels[role]}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profil
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Pengaturan
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isPending}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isPending ? "Keluar..." : "Keluar"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
