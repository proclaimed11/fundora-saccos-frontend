import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import FlatSummaryWidgets, { type FlatSummaryWidget } from "./flat-summary-card"

type SummaryStatusCardProps = {
  title: string
  widgets: FlatSummaryWidget[]
  headerAction?: ReactNode
  isLoading?: boolean
}

const SummaryStatusCard = ({ title, widgets, headerAction, isLoading = false }: SummaryStatusCardProps) => {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{title}</h2>
          {headerAction && <div className="flex items-center gap-2">{headerAction}</div>}
        </div>

        <FlatSummaryWidgets widgets={widgets} isLoading={isLoading} />
      </CardContent>
    </Card>
  )
}

export default SummaryStatusCard