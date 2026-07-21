"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { createSavingsGoalAction, updateSavingsGoalAction } from "../actions"
import type { SavingsGoal } from "@prisma/client"

// =============================================================================
// SCHEMA
// =============================================================================

// Simple validation without transformation
const formSchema = z.object({
  name: z.string().min(1, "Nama tujuan harus diisi").max(100, "Nama terlalu panjang"),
  targetAmount: z.string().min(1, "Jumlah target harus diisi"),
  deadline: z.date().optional().nullable(),
  imageUrl: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

// =============================================================================
// COMPONENT
// =============================================================================

interface SavingsGoalFormProps {
  goal?: SavingsGoal
}

export function SavingsGoalForm({ goal }: SavingsGoalFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: goal?.name || "",
      targetAmount: goal ? String(goal.targetAmount) : "",
      deadline: goal?.deadline ? new Date(goal.deadline) : undefined,
      imageUrl: goal?.imageUrl || "",
    },
  })

  const deadline = watch("deadline")

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate and transform targetAmount
      const targetAmount = Number(data.targetAmount)
      if (isNaN(targetAmount)) {
        setError("Jumlah target harus berupa angka")
        return
      }
      if (targetAmount <= 0) {
        setError("Jumlah target harus lebih dari 0")
        return
      }
      if (targetAmount > 999999999999) {
        setError("Jumlah terlalu besar")
        return
      }

      // Validate and transform imageUrl
      const imageUrl = data.imageUrl && data.imageUrl.trim() !== "" ? data.imageUrl : null
      if (imageUrl && !z.string().url().safeParse(imageUrl).success) {
        setError("URL gambar tidak valid")
        return
      }

      // Prepare submit data
      const submitData = {
        name: data.name,
        targetAmount,
        deadline: data.deadline || null,
        imageUrl,
      }

      const result = goal
        ? await updateSavingsGoalAction(goal.id, submitData)
        : await createSavingsGoalAction(submitData)

      if (result.success) {
        router.push("/savings")
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
        <CardTitle>{goal ? "Edit Tujuan Tabungan" : "Tujuan Tabungan Baru"}</CardTitle>
        <CardDescription>
          {goal
            ? "Ubah detail tujuan tabungan Anda"
            : "Buat tujuan tabungan baru untuk mencapai impian Anda"}
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
            <Label htmlFor="name">Nama Tujuan</Label>
            <Input
              id="name"
              placeholder="cth: Liburan ke Bali, Dana Darurat, Beli Mobil"
              {...register("name")}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Jumlah Target</Label>
            <Controller
              name="targetAmount"
              control={control}
              render={({ field }) => (
                <Input
                  id="targetAmount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.targetAmount && (
              <p className="text-sm text-destructive">{errors.targetAmount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Batas Waktu (Opsional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deadline && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                  type="button"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP", { locale: id }) : "Pilih tanggal"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline || undefined}
                  onSelect={(date) => setValue("deadline", date || null)}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
            {errors.deadline && (
              <p className="text-sm text-destructive">{errors.deadline.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL Gambar (Opsional)</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              {...register("imageUrl")}
              disabled={isSubmitting}
            />
            {errors.imageUrl && (
              <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
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
              ) : goal ? (
                "Simpan Perubahan"
              ) : (
                "Buat Tujuan"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
