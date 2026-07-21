import { getCurrentUser } from "@/features/auth/utils"
import { redirect, notFound } from "next/navigation"
import { getCategoriesForFamily } from "@/features/transactions/services"
import { getBudgetById } from "@/features/budgets/services"
import { BudgetForm } from "@/features/budgets/components/budget-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface EditBudgetPageProps {
  params: Promise<{ id: string }>
}

export default async function EditBudgetPage({ params }: EditBudgetPageProps) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user || !user.familyId) redirect("/login")

  const [budget, categories] = await Promise.all([
    getBudgetById(user.familyId, id),
    getCategoriesForFamily(user.familyId, "EXPENSE"),
  ])

  if (!budget) {
    notFound()
  }

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
          <CardTitle>Edit Budget</CardTitle>
          <CardDescription>Perbarui batas pengeluaran</CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetForm
            categories={categories}
            initialData={{
              id: budget.id,
              categoryId: budget.category.id,
              amount: budget.amount,
              period: budget.period,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
