import { useEffect, useState } from "react"
import {
  AlertTriangleIcon,
  ClockIcon,
  BadgeAlertIcon,
  FileWarningIcon,
  BellIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import SectionCard from "../section-card"
import { Button } from "../../components/ui/button"
import { Skeleton } from "../../components/ui/skeleton"
import { cn } from "../../lib/utils"
import SectionCardSkeleton from "../skeleton-loaders/skeleton-summary-loader"

type AlertRow = {
  label: string
  count: number
  icon: LucideIcon
  iconClassName: string
}

const AlertsNotificationsCard = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [alertRows, setAlertRows] = useState<AlertRow[] | null>(null)

  useEffect(() => {
    setIsLoading(true)
    // Replace with your real fetch, e.g. fetch(`/api/dashboard`) or a dedicated alerts endpoint
    const timer = setTimeout(() => {
      setAlertRows([
        {
          label: "Loans overdue (30+ days)",
          count: 126,
          icon: AlertTriangleIcon,
          iconClassName: "bg-red-100 text-red-600",
        },
        {
          label: "Loans in grace period",
          count: 192,
          icon: ClockIcon,
          iconClassName: "bg-amber-100 text-amber-600",
        },
        {
          label: "KYC expiring in 30 days",
          count: 35,
          icon: BadgeAlertIcon,
          iconClassName: "bg-orange-100 text-orange-600",
        },
        {
          label: "Documents expiring soon",
          count: 18,
          icon: FileWarningIcon,
          iconClassName: "bg-yellow-100 text-yellow-600",
        },
      ])
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading || !alertRows) {
    return (
      <SectionCardSkeleton variant="custom" titleWidth="w-40" showHeaderAction>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <Skeleton className="h-3.5 flex-1" />
              <Skeleton className="h-3.5 w-6" />
            </div>
          ))}
        </div>
      </SectionCardSkeleton>
    )
  }

  return (
    <SectionCard
      icon={BellIcon}
      title="Alerts & Notifications"
      headerAction={
        <Button variant="link" size="sm" className="h-auto p-0 text-sm">
          View All
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {alertRows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", row.iconClassName)}>
              <row.icon className="size-4" />
            </div>
            <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{row.label}</p>
            <p className="text-sm font-semibold">{row.count}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

export default AlertsNotificationsCard