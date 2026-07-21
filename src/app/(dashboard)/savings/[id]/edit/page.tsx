import { requireAuth } from "@/features/auth/utils"
import { getSavingsGoalById } from "@/features/savings/services"
import { SavingsGoalForm } from "@/features/savings/components/savings-goal-form"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditSavingsGoalPage(props: PageProps) {
  const user = await requireAuth()
  const params = await props.params

  if (!user.familyId) {
    notFound()
  }

  const goal = await getSavingsGoalById(params.id, user.familyId)

  if (!goal) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Tujuan Tabungan</h1>
        <p className="text-muted-foreground">Ubah detail tujuan tabungan Anda</p>
      </div>

      <SavingsGoalForm goal={goal} />
    </div>
  )
}
