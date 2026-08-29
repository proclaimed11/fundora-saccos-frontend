import { BookTextIcon } from "lucide-react"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"

export type AccountProfileHeaderData = {
  accountCode: string
  accountName: string
  accountType: string
  status: "Active" | "Inactive"
  currency: string
}

type AccountProfileHeaderProps = {
  data: AccountProfileHeaderData
}

const statusBadgeStyles: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Inactive: "bg-slate-100 text-slate-700 hover:bg-slate-100",
}

const accountTypeBadgeStyles: Record<string, string> = {
  Asset: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  "Contra Asset": "bg-violet-100 text-violet-700 hover:bg-violet-100",
  Liability: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Equity: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  Income: "bg-teal-100 text-teal-700 hover:bg-teal-100",
  Expense: "bg-red-100 text-red-700 hover:bg-red-100",
}

const SummaryField = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-semibold">{value}</p>
  </div>
)

const AccountProfileHeader = ({ data }: AccountProfileHeaderProps) => {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 divide-y divide-border md:flex-row md:items-center md:divide-x md:divide-y-0">
          <div className="flex items-start gap-3 pb-4 md:pb-0 md:pr-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
              <BookTextIcon className="size-6 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-lg font-semibold leading-none">{data.accountCode}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{data.accountName}</p>
              </div>
              <Badge
                className={accountTypeBadgeStyles[data.accountType]}
                variant="secondary"
              >
                {data.accountType}
              </Badge>
            </div>
          </div>

          <div className="pt-4 md:px-6 md:pt-0">
            <SummaryField label="Currency" value={data.currency} />
          </div>

          <div className="pt-4 md:px-6 md:pt-0">
            <SummaryField label="Account Type" value={data.accountType} />
          </div>

          <div className="pt-4 md:pl-6 md:pt-0">
            <SummaryField label="Status" value={<Badge className={statusBadgeStyles[data.status]} variant="secondary">{data.status}</Badge>} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AccountProfileHeader