"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { createBillAction, updateBillAction } from "../actions"
import type { Bill } from "@prisma/client"

// =============================================================================
// SCHEMA
// =============================================================================

const formSchema = z.object({
  name: z.string().min(1, "Nama tagihan harus diisi").max(100, "Nama terlalu panjang"),
  amount: z
    .number()
    .positive("Jumlah harus lebih dari 0")
    .max(999999999999, "Jumlah terlalu besar"),
  dueDate: z.date(),
  reminderDays: z
    .number()
    .int("Harus berupa bilangan bulat")
    .min(0, "Minimal 0 hari")
    .max(30, "Maksimal 30 hari"),
  isRecurring: z.boolean(),
  recurrenceFrequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
  recurrenceInterval: z.number().int().positive().optional(),
})

type FormData = z.infer<typeof formSchema>

// =============================================================================
// COMPONENT
// =============================================================================

interface BillFormProps {
  bill?: Bill
}

export function BillForm({ bill }: BillFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Parse recurrence rule if editing
  let defaultRecurrenceFrequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" = "MONTHLY"
  let defaultRecurrenceInterval = 1

  if (bill?.recurrenceRule) {
    try {
      const rule = JSON.parse(bill.recurrenceRule)
      defaultRecurrenceFrequency = rule.frequency || "MONTHLY"
      defaultRecurrenceInterval = rule.interval || 1
    } catch (error) {
      console.error("Failed to parse recurrence rule:", error)
    }
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: bill?.name || "",
      amount: bill ? Number(bill.amount) : undefined,
      dueDate: bill?.dueDate ? new Date(bill.dueDate) : undefined,
      reminderDays: bill?.reminderDays ?? 3,
      isRecurring: bill?.isRecurring || false,
      recurrenceFrequency: defaultRecurrenceFrequency,
      recurrenceInterval: defaultRecurrenceInterval,
    },
  })

  const dueDate = watch("dueDate")
  const isRecurring = watch("isRecurring")

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Build recurrence rule if recurring
      let recurrenceRule = null
      if (data.isRecurring && data.recurrenceFrequency) {
        recurrenceRule = JSON.stringify({
          frequency: data.recurrenceFrequency,
          interval: data.recurrenceInterval || 1,
        })
      }

      // Convert to number and prepare data
      const submitData = {
        name: data.name,
        amount: Number(data.amount),
        dueDate: data.dueDate,
        reminderDays: Number(data.reminderDays),
        isRecurring: data.isRecurring,
        recurrenceRule,
      }

      const result = bill
        ? await updateBillAction(bill.id, submitData)
        : await createBillAction(submitData)

      if (result.success) {
        router.push("/bills")
        router.refresh()
      } else {
        setError(result.error || "Terjadi kesalahan")
      }
    } catch (err) {
      setError("Terjadi kesalahan")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{bill ? "Edit Tagihan" : "Tagihan Baru"}</CardTitle>
        <CardDescription>
          {bill ? "Ubah detail tagihan Anda" : "Buat tagihan baru untuk pelacakan pembayaran"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nama Tagihan</Label>
            <Input
              id="name"
              placeholder="cth: Listrik PLN, Internet, Asuransi"
              {...register("name")}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0"
              {...register("amount", { valueAsNumber: true })}
              disabled={isSubmitting}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Tanggal Jatuh Tempo</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                  type="button"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP", { locale: id }) : "Pilih tanggal"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate || undefined}
                  onSelect={(date) => setValue("dueDate", date || new Date())}
                />
              </PopoverContent>
            </Popover>
            {errors.dueDate && (
              <p className="text-sm text-destructive">{errors.dueDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminderDays">Pengingat (Hari Sebelum Jatuh Tempo)</Label>
            <Input
              id="reminderDays"
              type="number"
              min="0"
              max="30"
              {...register("reminderDays", { valueAsNumber: true })}
              disabled={isSubmitting}
            />
            {errors.reminderDays && (
              <p className="text-sm text-destructive">{errors.reminderDays.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isRecurring">Tagihan Berulang</Label>
                <p className="text-sm text-muted-foreground">
                  Buat tagihan baru otomatis setelah dibayar
                </p>
              </div>
              <Switch
                id="isRecurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setValue("isRecurring", checked)}
                disabled={isSubmitting}
              />
            </div>

            {isRecurring && (
              <div className="grid gap-4 rounded-lg border p-4">
                <div className="space-y-2">
                  <Label htmlFor="recurrenceFrequency">Frekuensi</Label>
                  <Select
                    value={watch("recurrenceFrequency")}
                    onValueChange={(value) =>
                      setValue("recurrenceFrequency", value as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY")
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih frekuensi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Harian</SelectItem>
                      <SelectItem value="WEEKLY">Mingguan</SelectItem>
                      <SelectItem value="MONTHLY">Bulanan</SelectItem>
                      <SelectItem value="YEARLY">Tahunan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurrenceInterval">Interval</Label>
                  <Input
                    id="recurrenceInterval"
                    type="number"
                    min="1"
                    placeholder="1"
                    {...register("recurrenceInterval", { valueAsNumber: true })}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Contoh: 1 = setiap bulan, 2 = setiap 2 bulan
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="flex-1"
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : bill ? (
                "Simpan Perubahan"
              ) : (
                "Buat Tagihan"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
