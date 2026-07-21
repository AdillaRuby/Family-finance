"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { ReportPeriod } from "../services"

export function PeriodSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPeriod = (searchParams.get("period") as ReportPeriod) || "thisMonth"

  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined
  )

  const handlePeriodChange = (period: ReportPeriod) => {
    const params = new URLSearchParams(searchParams)
    params.set("period", period)

    if (period !== "custom") {
      params.delete("startDate")
      params.delete("endDate")
    }

    router.push(`/reports?${params.toString()}`)
  }

  const handleCustomDateApply = () => {
    if (startDate && endDate) {
      const params = new URLSearchParams(searchParams)
      params.set("period", "custom")
      params.set("startDate", startDate.toISOString())
      params.set("endDate", endDate.toISOString())
      router.push(`/reports?${params.toString()}`)
    }
  }

  const periods: { value: ReportPeriod; label: string }[] = [
    { value: "thisMonth", label: "Bulan Ini" },
    { value: "lastMonth", label: "Bulan Lalu" },
    { value: "thisYear", label: "Tahun Ini" },
    { value: "lastYear", label: "Tahun Lalu" },
    { value: "custom", label: "Custom" },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={currentPeriod === period.value ? "default" : "outline"}
          size="sm"
          onClick={() => handlePeriodChange(period.value)}
        >
          {period.label}
        </Button>
      ))}

      {currentPeriod === "custom" && (
        <div className="flex items-center gap-2 ml-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP", { locale: id }) : "Dari"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
              />
            </PopoverContent>
          </Popover>

          <span className="text-sm text-muted-foreground">-</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP", { locale: id }) : "Sampai"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
              />
            </PopoverContent>
          </Popover>

          <Button
            size="sm"
            onClick={handleCustomDateApply}
            disabled={!startDate || !endDate}
          >
            Terapkan
          </Button>
        </div>
      )}
    </div>
  )
}
