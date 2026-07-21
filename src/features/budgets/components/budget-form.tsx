"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { createBudgetAction, updateBudgetAction } from "../actions"
import type { BudgetPeriod } from "@prisma/client"

interface Category {
  id: string
  name: string
  icon: string | null
  color: string | null
}

interface BudgetFormProps {
  categories: Category[]
  initialData?: {
    id: string
    categoryId: string
    amount: number
    period: BudgetPeriod
  }
  onSuccess?: () => void
}

export function BudgetForm({ categories, initialData, onSuccess }: BudgetFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  async function handleSubmit(formData: FormData) {
    setError(null)
    setFieldErrors({})

    if (initialData) {
      formData.set("id", initialData.id)
    }

    startTransition(async () => {
      const result = initialData
        ? await updateBudgetAction(formData)
        : await createBudgetAction(formData)

      if (!result.success) {
        setError(result.error)
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        }
      } else {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/budgets")
          router.refresh()
        }
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="categoryId">Kategori Pengeluaran</Label>
        <Select name="categoryId" defaultValue={initialData?.categoryId} disabled={isPending}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  {category.color && (
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                  <span>{category.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.categoryId && (
          <p className="text-sm text-destructive">{fieldErrors.categoryId[0]}</p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Jumlah Budget (Rp)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          placeholder="0"
          defaultValue={initialData?.amount}
          disabled={isPending}
          min="0"
          step="1000"
        />
        {fieldErrors.amount && (
          <p className="text-sm text-destructive">{fieldErrors.amount[0]}</p>
        )}
      </div>

      {/* Period */}
      <div className="space-y-2">
        <Label>Periode</Label>
        <Select name="period" defaultValue={initialData?.period || "MONTHLY"} disabled={isPending}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MONTHLY">Bulanan</SelectItem>
            <SelectItem value="YEARLY">Tahunan</SelectItem>
          </SelectContent>
        </Select>
        {fieldErrors.period && (
          <p className="text-sm text-destructive">{fieldErrors.period[0]}</p>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : initialData ? (
            "Update Budget"
          ) : (
            "Buat Budget"
          )}
        </Button>
        {onSuccess && (
          <Button type="button" variant="outline" onClick={onSuccess} disabled={isPending}>
            Batal
          </Button>
        )}
      </div>
    </form>
  )
}
