import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { requireAuth } from "@/features/auth/utils"
import {
  getFinancialSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getBudgetPerformance,
  getSavingsProgress,
  getDateRangeFromPeriod,
  type ReportPeriod,
} from "@/features/reports/services"
import { FinancialSummaryCard } from "@/features/reports/components/financial-summary-card"
import { CategoryBreakdownChart } from "@/features/reports/components/category-breakdown-chart"
import { MonthlyTrendsChart } from "@/features/reports/components/monthly-trends-chart"
import { BudgetPerformanceChart } from "@/features/reports/components/budget-performance-chart"
import { PeriodSelector } from "@/features/reports/components/period-selector"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/utils/format"

// =============================================================================
// PAGE COMPONENT
// =============================================================================

interface PageProps {
  searchParams: Promise<{
    period?: string
    startDate?: string
    endDate?: string
  }>
}

export default async function ReportsPage(props: PageProps) {
  const user = await requireAuth()
  const searchParams = await props.searchParams

  if (!user.familyId) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Keluarga Tidak Ditemukan</CardTitle>
            <CardDescription>
              Anda harus bergabung dengan keluarga untuk menggunakan fitur ini.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const period = (searchParams.period as ReportPeriod) || "thisMonth"
  const customRange =
    searchParams.startDate && searchParams.endDate
      ? {
          startDate: new Date(searchParams.startDate),
          endDate: new Date(searchParams.endDate),
        }
      : undefined

  const dateRange = getDateRangeFromPeriod(period, customRange)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Laporan Keuangan</h1>
        <p className="text-muted-foreground">
          Analisis menyeluruh tentang keuangan keluarga Anda
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PeriodSelector />
      </div>

      <Suspense fallback={<FinancialSummarySkeleton />}>
        <FinancialSummarySection familyId={user.familyId} dateRange={dateRange} />
      </Suspense>

      <Suspense fallback={<TrendsChartSkeleton />}>
        <MonthlyTrendsSection familyId={user.familyId} />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<CategoryBreakdownSkeleton />}>
          <CategoryBreakdownSection familyId={user.familyId} dateRange={dateRange} />
        </Suspense>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<BudgetPerformanceSkeleton />}>
          <BudgetPerformanceSection familyId={user.familyId} dateRange={dateRange} />
        </Suspense>

        <Suspense fallback={<SavingsProgressSkeleton />}>
          <SavingsProgressSection familyId={user.familyId} />
        </Suspense>
      </div>
    </div>
  )
}

// =============================================================================
// SECTIONS
// =============================================================================

async function FinancialSummarySection({
  familyId,
  dateRange,
}: {
  familyId: string
  dateRange: { startDate: Date; endDate: Date }
}) {
  const summary = await getFinancialSummary(familyId, dateRange)
  return <FinancialSummaryCard summary={summary} />
}

async function MonthlyTrendsSection({ familyId }: { familyId: string }) {
  const trends = await getMonthlyTrends(familyId, 6)
  return <MonthlyTrendsChart trends={trends} />
}

async function CategoryBreakdownSection({
  familyId,
  dateRange,
}: {
  familyId: string
  dateRange: { startDate: Date; endDate: Date }
}) {
  const breakdown = await getCategoryBreakdown(familyId, dateRange)

  return (
    <>
      <CategoryBreakdownChart categories={breakdown.income} type="INCOME" />
      <CategoryBreakdownChart categories={breakdown.expense} type="EXPENSE" />
    </>
  )
}

async function BudgetPerformanceSection({
  familyId,
  dateRange,
}: {
  familyId: string
  dateRange: { startDate: Date; endDate: Date }
}) {
  const performance = await getBudgetPerformance(familyId, dateRange)
  return <BudgetPerformanceChart performance={performance} />
}

async function SavingsProgressSection({ familyId }: { familyId: string }) {
  const progress = await getSavingsProgress(familyId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Tabungan</CardTitle>
        <CardDescription>Status pencapaian tujuan tabungan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {progress.summary.total === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Belum ada tujuan tabungan
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress Keseluruhan</span>
                <span className="font-semibold">
                  {progress.summary.overallProgress.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={progress.summary.overallProgress}
                indicatorClassName="bg-blue-500"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(progress.summary.totalSaved)}</span>
                <span>{formatCurrency(progress.summary.totalTarget)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{progress.summary.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {progress.summary.active}
                </div>
                <div className="text-xs text-muted-foreground">Aktif</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {progress.summary.completed}
                </div>
                <div className="text-xs text-muted-foreground">Selesai</div>
              </div>
            </div>

            {progress.goals.length > 0 && (
              <div className="space-y-3 border-t pt-4">
                <div className="text-sm font-medium">Top 5 Tujuan</div>
                {progress.goals.slice(0, 5).map((goal) => (
                  <div key={goal.goalId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{goal.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {goal.progress.toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={goal.progress}
                      indicatorClassName={
                        goal.isCompleted
                          ? "bg-green-500"
                          : goal.progress >= 75
                            ? "bg-blue-500"
                            : goal.progress >= 50
                              ? "bg-yellow-500"
                              : "bg-orange-500"
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================================================
// SKELETONS
// =============================================================================

function FinancialSummarySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="mt-1 h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TrendsChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[350px] w-full" />
      </CardContent>
    </Card>
  )
}

function CategoryBreakdownSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function BudgetPerformanceSkeleton() {
  return <CategoryBreakdownSkeleton />
}

function SavingsProgressSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
