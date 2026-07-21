"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { updateUserSettingsAction } from "../actions"

interface PreferencesFormProps {
  settings: {
    theme: string
    language: string
    currency: string
  }
}

export function PreferencesForm({ settings }: PreferencesFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [theme, setTheme] = useState(settings.theme)
  const [language, setLanguage] = useState(settings.language)
  const [currency, setCurrency] = useState(settings.currency)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    const result = await updateUserSettingsAction({
      theme,
      language,
      currency,
    })

    if (result.success) {
      setSuccess(true)
      router.refresh()
    } else {
      setError(result.error || "Terjadi kesalahan")
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      {success && (
        <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600">
          Preferensi berhasil diperbarui
        </div>
      )}

      <div className="space-y-2">
        <Label>Tema</Label>
        <Select value={theme} onValueChange={setTheme} disabled={isSubmitting}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Terang</SelectItem>
            <SelectItem value="dark">Gelap</SelectItem>
            <SelectItem value="system">Sistem</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Bahasa</Label>
        <Select value={language} onValueChange={setLanguage} disabled={isSubmitting}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="id">Indonesia</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Mata Uang</Label>
        <Select value={currency} onValueChange={setCurrency} disabled={isSubmitting}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IDR">IDR - Rupiah Indonesia</SelectItem>
            <SelectItem value="USD">USD - US Dollar</SelectItem>
            <SelectItem value="EUR">EUR - Euro</SelectItem>
            <SelectItem value="GBP">GBP - British Pound</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Menyimpan...
          </>
        ) : (
          "Simpan Preferensi"
        )}
      </Button>
    </form>
  )
}
