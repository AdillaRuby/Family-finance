import { getCurrentUser } from "@/features/auth/utils"
import { redirect } from "next/navigation"
import { StatsCards } from "@/features/dashboard/components/stats-cards"
import { TrendsChart } from "@/features/dashboard/components/trends-chart"
import { RecentTransactions } from "@/features/dashboard/components/recent-transactions"
import {
  getDashboardStats,
  getMonthlyTrends,
  getRecentTransactions,
} from "@/features/dashboard/services"
import { generateInsights } from "@/features/insights/services"
import { InsightCard } from "@/features/insights/components/insight-card"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user || !user.familyId) redirect("/login")

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Selamat datang, {user.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Berikut ringkasan keuangan keluarga Anda bulan ini.
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCardsAsync familyId={user.familyId} userId={user.id} />
      </Suspense>

      {/* AI Insights */}
      <Suspense fallback={<InsightsSkeleton />}>
        <InsightsSection familyId={user.familyId} />
      </Suspense>

      {/* Chart & Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trends Chart */}
        <Suspense fallback={<ChartSkeleton />}>
          <TrendsChartAsync familyId={user.familyId} />
        </Suspense>

        {/* Recent Transactions */}
        <Suspense fallback={<TransactionsSkeleton />}>
          <RecentTransactionsAsync familyId={user.familyId} />
        </Suspense>
      </div>
    </div>
  )
}

// ============================================================================
// ASYNC COMPONENTS (Server Components with data fetching)
// ============================================================================

async function StatsCardsAsync({ familyId, userId }: { familyId: string; userId: string }) {
  const stats = await getDashboardStats(familyId, userId)
  return (
    <StatsCards
      totalIncome={stats.totalIncome}
      totalExpense={stats.totalExpense}
      balance={stats.balance}
      savingsProgress={stats.savingsProgress}
    />
  )
}

async function InsightsSection({ familyId }: { familyId: string }) {
  const insights = await generateInsights(familyId)

  if (insights.length === 0) {
    return null
  }

  // Show top 3 insights
  const topInsights = insights.slice(0, 3)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Insights untuk Anda</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {topInsights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  )
}

async function TrendsChartAsync({ familyId }: { familyId: string }) {
  const trends = await getMonthlyTrends(familyId)
  return <TrendsChart data={trends} />
}

async function RecentTransactionsAsync({ familyId }: { familyId: string }) {
  const transactions = await getRecentTransactions(familyId, 10)
  return <RecentTransactions transactions={transactions} />
}

// ============================================================================
// LOADING SKELETONS
// ============================================================================

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function InsightsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-20 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  )
}

function TransactionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-32 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-32 mt-2" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
