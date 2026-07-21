import { requireAuth } from "@/features/auth/utils"
import { SavingsGoalForm } from "@/features/savings/components/savings-goal-form"

export default async function NewSavingsGoalPage() {
  await requireAuth()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tujuan Tabungan Baru</h1>
        <p className="text-muted-foreground">Buat tujuan tabungan untuk mencapai impian Anda</p>
      </div>

      <SavingsGoalForm />
    </div>
  )
}
