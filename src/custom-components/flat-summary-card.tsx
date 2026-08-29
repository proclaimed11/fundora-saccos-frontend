import { Separator } from "@/components/ui/separator"

export type FlatSummaryWidget = {
  key: string
  label: string
  value: string
}

type FlatSummaryWidgetsProps = {
  widgets: FlatSummaryWidget[]
}

const FlatSummaryWidgets = ({ widgets }: FlatSummaryWidgetsProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
      {widgets.map(({ key, label, value }, index) => (
        <div key={key} className="flex flex-1 items-stretch gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-base font-semibold text-foreground">{value}</p>
          </div>

          {index < widgets.length - 1 && (
            <Separator orientation="vertical" className="hidden self-center !h-10 sm:block" />
          )}
        </div>
      ))}
    </div>
  )
}

export default FlatSummaryWidgets