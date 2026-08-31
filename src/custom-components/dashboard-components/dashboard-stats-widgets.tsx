import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type StatCardProps = {
  label: string
  value: string
  icon: LucideIcon
  iconClassName: string
}

const StatCard = ({ label, value, icon: Icon, iconClassName }: StatCardProps) => {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex items-center gap-3 px-4 py-3">
        <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", iconClassName)}>
          <Icon className="size-4" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-lg font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

type DashboardStatsWidgetsProps = {
  stats: StatCardProps[]
}

const DashboardStatsWidgets = ({ stats }: DashboardStatsWidgetsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  )
}

export default DashboardStatsWidgets