"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Shield, User as UserIcon, Baby, Loader2, MoreVertical, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updateMemberRoleAction, toggleMemberStatusAction, removeMemberAction } from "../actions"
import type { FamilyMember, User, Role } from "@prisma/client"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface MemberCardProps {
  member: FamilyMember & { user: Pick<User, "id" | "name" | "email" | "image"> }
  isCurrentUser: boolean
  isAdmin: boolean
  activityCount: number
}

export function MemberCard({ member, isCurrentUser, isAdmin, activityCount }: MemberCardProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleRoleChange = async (newRole: Role) => {
    setIsProcessing(true)
    const result = await updateMemberRoleAction({ memberId: member.id, role: newRole })

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }

    setIsProcessing(false)
  }

  const handleToggleStatus = async () => {
    setIsProcessing(true)
    const result = await toggleMemberStatusAction({ memberId: member.id })

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }

    setIsProcessing(false)
  }

  const handleRemove = async () => {
    setIsProcessing(true)
    const result = await removeMemberAction(member.id)

    if (result.success) {
      setShowDeleteDialog(false)
      router.refresh()
    } else {
      alert(result.error)
      setIsProcessing(false)
    }
  }

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4" />
      case "PARENT":
        return <UserIcon className="h-4 w-4" />
      case "CHILD":
        return <Baby className="h-4 w-4" />
    }
  }

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "default"
      case "PARENT":
        return "secondary"
      case "CHILD":
        return "outline"
    }
  }

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "Admin"
      case "PARENT":
        return "Orang Tua"
      case "CHILD":
        return "Anak"
    }
  }

  const initials = member.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?"

  return (
    <>
      <Card className={cn(!member.isActive && "opacity-60")}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.user.image || undefined} alt={member.user.name || ""} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    {member.user.name || "Tidak ada nama"}
                  </h3>
                  {isCurrentUser && (
                    <Badge variant="outline" className="text-xs">
                      Anda
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">{member.user.email}</p>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {isAdmin && !isCurrentUser ? (
                    <Select
                      value={member.role}
                      onValueChange={(value) => handleRoleChange(value as Role)}
                      disabled={isProcessing}
                    >
                      <SelectTrigger className="h-7 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3" />
                            Admin
                          </div>
                        </SelectItem>
                        <SelectItem value="PARENT">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-3 w-3" />
                            Orang Tua
                          </div>
                        </SelectItem>
                        <SelectItem value="CHILD">
                          <div className="flex items-center gap-2">
                            <Baby className="h-3 w-3" />
                            Anak
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={getRoleBadgeVariant(member.role)} className="gap-1">
                      {getRoleIcon(member.role)}
                      {getRoleLabel(member.role)}
                    </Badge>
                  )}

                  {!member.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Nonaktif
                    </Badge>
                  )}
                </div>

                <div className="pt-2 space-y-1 text-xs text-muted-foreground">
                  <div>Bergabung: {format(new Date(member.joinedAt), "PPP", { locale: id })}</div>
                  <div>{activityCount} transaksi</div>
                </div>
              </div>
            </div>

            {isAdmin && !isCurrentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={isProcessing}>
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoreVertical className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleToggleStatus}>
                    {member.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Anggota?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. {member.user.name} akan dihapus dari keluarga
              secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
