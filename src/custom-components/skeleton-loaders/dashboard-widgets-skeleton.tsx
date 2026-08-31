import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type StatCardSkeletonItem = {
  label: string
  icon: LucideIcon
  iconClassName: string
}

type DashboardStatsWidgetsSkeletonProps = {
  stats: StatCardSkeletonItem[]
}

const DashboardStatsWidgetsSkeleton = ({ stats }: DashboardStatsWidgetsSkeletonProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((card) => (
        <Card key={card.label} className="gap-0 py-0">
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", card.iconClassName)}>
              <card.icon className="size-4" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-xs text-muted-foreground">{card.label}</p>
              <Skeleton className="h-5 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default DashboardStatsWidgetsSkeleton