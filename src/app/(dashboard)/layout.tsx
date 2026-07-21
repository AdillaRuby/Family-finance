import { redirect } from "next/navigation"
import { getCurrentUser } from "@/features/auth/utils"
import { getNotifications, getUnreadCount } from "@/features/notifications/services"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Load notifications for bell
  const [notifications, unreadCount] = await Promise.all([
    getNotifications(user.id, 5), // Load latest 5 for bell
    getUnreadCount(user.id),
  ])

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main content — offset by sidebar width on desktop */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            familyName: user.familyName,
          }}
          notifications={notifications}
          unreadCount={unreadCount}
        />
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
