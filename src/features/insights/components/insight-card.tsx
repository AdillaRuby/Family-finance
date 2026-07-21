import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Info, Lightbulb, TrendingUp, TrendingDown, PiggyBank, Wallet } from "lucide-react"
import type { Insight } from "../services"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface InsightCardProps {
  insight: Insight
}

export function InsightCard({ insight }: InsightCardProps) {
  const getIcon = () => {
    if (insight.category === "spending") {
      return <TrendingDown className="h-5 w-5" />
    } else if (insight.category === "saving") {
      return <PiggyBank className="h-5 w-5" />
    } else if (insight.category === "budget") {
      return <Wallet className="h-5 w-5" />
    } else if (insight.category === "income") {
      return <TrendingUp className="h-5 w-5" />
    }
    return <Info className="h-5 w-5" />
  }

  const getTypeConfig = () => {
    switch (insight.type) {
      case "warning":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          color: "text-orange-600 dark:text-orange-500",
          bgColor: "bg-orange-50 dark:bg-orange-950/20",
          borderColor: "border-orange-200 dark:border-orange-900",
          badge: "warning" as const,
        }
      case "success":
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          color: "text-green-600 dark:text-green-500",
          bgColor: "bg-green-50 dark:bg-green-950/20",
          borderColor: "border-green-200 dark:border-green-900",
          badge: "secondary" as const,
        }
      case "tip":
        return {
          icon: <Lightbulb className="h-4 w-4" />,
          color: "text-blue-600 dark:text-blue-500",
          bgColor: "bg-blue-50 dark:bg-blue-950/20",
          borderColor: "border-blue-200 dark:border-blue-900",
          badge: "secondary" as const,
        }
      default:
        return {
          icon: <Info className="h-4 w-4" />,
          color: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-50 dark:bg-gray-950/20",
          borderColor: "border-gray-200 dark:border-gray-800",
          badge: "outline" as const,
        }
    }
  }

  const typeConfig = getTypeConfig()

  const getActionLink = () => {
    if (insight.category === "budget") return "/budgets"
    if (insight.category === "saving") return "/savings"
    if (insight.category === "spending") return "/expenses"
    return "/transactions/new"
  }

  return (
    <Card className={cn("transition-all hover:shadow-md", typeConfig.bgColor, typeConfig.borderColor)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className={cn("mt-0.5", typeConfig.color)}>
              {getIcon()}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base">{insight.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={typeConfig.badge} className="gap-1">
                  {typeConfig.icon}
                  {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription className="text-sm">{insight.description}</CardDescription>

        {insight.action && (
          <div className="flex items-center gap-2 pt-2">
            <Button asChild size="sm" variant="outline">
              <Link href={getActionLink()}>
                {insight.action}
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
