import { getCurrentUser } from "@/features/auth/utils"
import { redirect } from "next/navigation"
import { getCategoriesForFamily } from "@/features/transactions/services"
import { BudgetForm } from "@/features/budgets/components/budget-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function NewBudgetPage() {
  const user = await getCurrentUser()
  if (!user || !user.familyId) redirect("/login")

  // Only get expense categories
  const categories = await getCategoriesForFamily(user.familyId, "EXPENSE")

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/budgets">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Anggaran
        </Link>
      </Button>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Buat Budget Baru</CardTitle>
          <CardDescription>
            Tetapkan batas pengeluaran untuk kategori tertentu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  )
}
