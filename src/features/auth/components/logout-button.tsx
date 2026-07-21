"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { signOut } from "next-auth/react"

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline"
  className?: string
  showIcon?: boolean
}

export function LogoutButton({ variant = "ghost", className, showIcon = true }: LogoutButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleLogout() {
    startTransition(async () => {
      await signOut({ redirect: false })
      router.push("/login")
      router.refresh()
    })
  }

  return (
    <Button variant={variant} className={className} onClick={handleLogout} disabled={isPending}>
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Keluar...
        </>
      ) : (
        <>
          {showIcon && <LogOut className="mr-2 h-4 w-4" />}
          Keluar
        </>
      )}
    </Button>
  )
}
