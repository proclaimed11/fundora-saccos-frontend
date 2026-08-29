import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export type SummaryWidget = {
  key: string
  label: string
  value: string
  icon: LucideIcon
  iconClassName: string
}

type SummaryCardsProps = {
  widgets: SummaryWidget[]
}

const SummaryCards = ({ widgets }: SummaryCardsProps) => {
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${widgets.length}, minmax(0, 1fr))` }}
    >
      {widgets.map(({ key, label, value, icon: Icon, iconClassName }) => (
        <Card key={key}>
          <CardContent className="flex items-center gap-3">
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
              <Icon className="size-4" />
            </span>
            <div className="flex min-w-0 flex-col">
              <p className="truncate text-xs text-muted-foreground">{label}</p>
              <p className="text-base font-semibold">{value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default SummaryCards