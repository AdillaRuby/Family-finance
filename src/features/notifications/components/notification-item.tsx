"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Trash2, Check, AlertCircle, PiggyBank, Receipt } from "lucide-react"
import { markNotificationAsReadAction, deleteNotificationAction } from "../actions"
import type { Notification, NotificationType } from "@prisma/client"
import { cn } from "@/lib/utils"
import { formatDate } from "@/utils/format"

interface NotificationItemProps {
  notification: Notification
  showActions?: boolean
  onMarkAsRead?: (id: string) => void
  onDelete?: (id: string) => void
}

export function NotificationItem({ 
  notification, 
  showActions = true,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleMarkAsRead = async () => {
    if (notification.isRead) return

    setIsProcessing(true)
    
    if (onMarkAsRead) {
      onMarkAsRead(notification.id)
    } else {
      await markNotificationAsReadAction(notification.id)
      router.refresh()
    }
    
    setIsProcessing(false)
  }

  const handleDelete = async () => {
    setIsProcessing(true)
    
    if (onDelete) {
      onDelete(notification.id)
    } else {
      await deleteNotificationAction(notification.id)
      router.refresh()
    }
    
    setIsProcessing(false)
  }

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "BUDGET_WARNING":
      case "BUDGET_EXCEEDED":
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case "BILL_REMINDER":
      case "BILL_OVERDUE":
        return <Receipt className="h-5 w-5 text-blue-500" />
      case "SAVINGS_MILESTONE":
      case "SAVINGS_COMPLETED":
        return <PiggyBank className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case "BUDGET_WARNING":
        return "Peringatan Budget"
      case "BUDGET_EXCEEDED":
        return "Budget Terlampaui"
      case "BILL_REMINDER":
        return "Pengingat Tagihan"
      case "BILL_OVERDUE":
        return "Tagihan Terlambat"
      case "SAVINGS_MILESTONE":
        return "Pencapaian Tabungan"
      case "SAVINGS_COMPLETED":
        return "Tabungan Selesai"
      default:
        return "Notifikasi"
    }
  }

  return (
    <div className={cn(
      "p-3 hover:bg-muted/50 cursor-pointer transition-colors",
      !notification.isRead && "bg-primary/5"
    )} onClick={handleMarkAsRead}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon(notification.type)}</div>

        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm truncate">{notification.title}</h4>
                {!notification.isRead && (
                  <Badge variant="default" className="h-4 text-[10px] px-1.5 flex-shrink-0">
                    Baru
                  </Badge>
                )}
              </div>
            </div>

            {showActions && (
              <div className="flex gap-1 flex-shrink-0">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMarkAsRead()
                    }}
                    disabled={isProcessing}
                    className="h-7 w-7"
                    title="Tandai sudah dibaca"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                  }}
                  disabled={isProcessing}
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  title="Hapus"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>

          <p className="text-[10px] text-muted-foreground">
            {formatDate(new Date(notification.createdAt))}
          </p>
        </div>
      </div>
    </div>
  )
}
