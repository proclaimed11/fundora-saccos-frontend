import { InfoIcon } from "lucide-react"
import { Card, CardContent } from "../../components/ui/card"
import { Separator } from "../../components/ui/separator"

export type AccountSummaryData = {
  openingBalance: string
  totalDebits: string
  totalCredits: string
  closingBalance: string
  availableBalance: string
}

type AccountSummaryCardProps = {
  data: AccountSummaryData
}

type SummaryWidget = {
  key: string
  label: string
  value: string
  hasInfo?: boolean
}

const AccountSummaryCard = ({ data }: AccountSummaryCardProps) => {
  const SUMMARY_WIDGETS: SummaryWidget[] = [
    {
      key: "openingBalance",
      label: "Opening Balance",
      value: data.openingBalance,
    },
    {
      key: "totalDebits",
      label: "Total Debits",
      value: data.totalDebits,
    },
    {
      key: "totalCredits",
      label: "Total Credits",
      value: data.totalCredits,
    },
    {
      key: "closingBalance",
      label: "Closing Balance",
      value: data.closingBalance,
    },
    {
      key: "availableBalance",
      label: "Available Balance",
      value: data.availableBalance,
      hasInfo: true,
    },
  ]

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold">Account Summary</h2>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
          {SUMMARY_WIDGETS.map(({ key, label, value, hasInfo }, index) => (
            <div key={key} className="flex flex-1 items-stretch gap-4">
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  {hasInfo && <InfoIcon className="size-3.5 text-muted-foreground" />}
                </div>
                <p className="text-base font-semibold text-foreground">{value}</p>
              </div>

              {index < SUMMARY_WIDGETS.length - 1 && (
                <Separator orientation="vertical" className="hidden self-center !h-10 sm:block" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default AccountSummaryCard