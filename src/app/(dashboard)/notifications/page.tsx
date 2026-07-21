import { getCurrentUser } from "@/features/auth/utils"
import { redirect } from "next/navigation"
import { getNotifications } from "@/features/notifications/services"
import { NotificationItem } from "@/features/notifications/components/notification-item"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell } from "lucide-react"

export default async function NotificationsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const notifications = await getNotifications(user.id, 50)

  const unreadNotifications = notifications.filter((n) => !n.isRead)
  const readNotifications = notifications.filter((n) => n.isRead)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifikasi</h1>
        <p className="text-muted-foreground mt-1">
          Lihat semua notifikasi dan pengingat Anda.
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            Semua ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Belum Dibaca ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="read">
            Sudah Dibaca ({readNotifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Semua Notifikasi</CardTitle>
              <CardDescription>
                Riwayat lengkap notifikasi Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Tidak ada notifikasi</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread">
          <Card>
            <CardHeader>
              <CardTitle>Belum Dibaca</CardTitle>
              <CardDescription>
                Notifikasi yang belum Anda baca
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unreadNotifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Semua notifikasi sudah dibaca</p>
                </div>
              ) : (
                <div className="divide-y">
                  {unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="read">
          <Card>
            <CardHeader>
              <CardTitle>Sudah Dibaca</CardTitle>
              <CardDescription>
                Notifikasi yang sudah Anda baca
              </CardDescription>
            </CardHeader>
            <CardContent>
              {readNotifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Tidak ada notifikasi yang sudah dibaca</p>
                </div>
              ) : (
                <div className="divide-y">
                  {readNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
