"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createTransactionAction, updateTransactionAction } from "../actions"
import type { TransactionType } from "@prisma/client"

interface Category {
  id: string
  name: string
  icon: string | null
  color: string | null
  type: TransactionType
}

interface TransactionFormProps {
  categories: Category[]
  initialData?: {
    id: string
    type: TransactionType
    categoryId: string
    amount: number
    description: string
    date: Date
  }
  onSuccess?: () => void
}

export function TransactionForm({ categories, initialData, onSuccess }: TransactionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const [type, setType] = useState<TransactionType>(initialData?.type || "EXPENSE")
  const [date, setDate] = useState<Date>(initialData?.date || new Date())

  // Filter categories by type
  const filteredCategories = categories.filter((cat) => cat.type === type)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setFieldErrors({})

    // Add type and date to formData
    formData.set("type", type)
    formData.set("date", date.toISOString())

    if (initialData) {
      formData.set("id", initialData.id)
    }

    startTransition(async () => {
      const result = initialData
        ? await updateTransactionAction(formData)
        : await createTransactionAction(formData)

      if (!result.success) {
        setError(result.error)
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        }
      } else {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/transactions")
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

      {/* Type */}
      <div className="space-y-2">
        <Label>Tipe Transaksi</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={type === "INCOME" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setType("INCOME")}
            disabled={isPending}
          >
            Pemasukan
          </Button>
          <Button
            type="button"
            variant={type === "EXPENSE" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setType("EXPENSE")}
            disabled={isPending}
          >
            Pengeluaran
          </Button>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="categoryId">Kategori</Label>
        <Select name="categoryId" defaultValue={initialData?.categoryId} disabled={isPending}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
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
        <Label htmlFor="amount">Jumlah (Rp)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          placeholder="0"
          defaultValue={initialData?.amount}
          disabled={isPending}
          min="0"
          step="1"
        />
        {fieldErrors.amount && (
          <p className="text-sm text-destructive">{fieldErrors.amount[0]}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Contoh: Belanja bulanan di supermarket"
          defaultValue={initialData?.description || ""}
          disabled={isPending}
          rows={3}
        />
        {fieldErrors.description && (
          <p className="text-sm text-destructive">{fieldErrors.description[0]}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label>Tanggal</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
              disabled={isPending}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: localeId }) : "Pilih tanggal"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
          </PopoverContent>
        </Popover>
        {fieldErrors.date && <p className="text-sm text-destructive">{fieldErrors.date[0]}</p>}
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
            "Update Transaksi"
          ) : (
            "Tambah Transaksi"
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
