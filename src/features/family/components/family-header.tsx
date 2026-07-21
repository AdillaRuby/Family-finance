"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Edit2, Loader2, Users } from "lucide-react"
import { updateFamilyNameAction } from "../actions"
import type { Family } from "@prisma/client"

interface FamilyHeaderProps {
  family: Family
  stats: {
    total: number
    active: number
    inactive: number
    admins: number
    parents: number
    children: number
  }
  isAdmin: boolean
}

export function FamilyHeader({ family, stats, isAdmin }: FamilyHeaderProps) {
  const router = useRouter()
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(family.name)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const result = await updateFamilyNameAction({ name })

    if (result.success) {
      setShowEditDialog(false)
      router.refresh()
    } else {
      setError(result.error || "Terjadi kesalahan")
    }

    setIsSubmitting(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{family.name}</CardTitle>
              <CardDescription>
                {stats.total} anggota · {stats.active} aktif
              </CardDescription>
            </div>
          </div>
          {isAdmin && (
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Nama
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Nama Keluarga</DialogTitle>
                  <DialogDescription>
                    Ubah nama keluarga Anda di sini
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Keluarga</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Keluarga Smith"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEditDialog(false)}
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
                      ) : (
                        "Simpan"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center sm:grid-cols-5">
          <div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-xs text-muted-foreground">Aktif</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-500">{stats.inactive}</div>
            <div className="text-xs text-muted-foreground">Nonaktif</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{stats.admins}</div>
            <div className="text-xs text-muted-foreground">Admin</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {stats.parents + stats.children}
            </div>
            <div className="text-xs text-muted-foreground">Anggota</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
