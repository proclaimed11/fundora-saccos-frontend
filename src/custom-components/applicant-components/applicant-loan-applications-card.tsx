import {
  CalendarCheckIcon,
  LayoutGridIcon,
  HourglassIcon,
  CheckCircle2Icon,
  XCircleIcon,
  CircleSlashIcon,
  type LucideIcon,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

export type LoanApplicationStatusData = {
  allApplications: number
  pending: number
  approved: number
  rejected: number
  withdrawn: number
}

export type LoanOption = {
  label: string
  value: string
}

type PaymentSummaryCardProps = {
  data: LoanApplicationStatusData
  pendingLoans: LoanOption[]
  completedLoans: LoanOption[]
  discardedLoans: LoanOption[]
  selectedLoan?: string | null
  onSelectedLoanChange?: (value: string | null) => void
  onViewFullSchedule?: () => void
}

type StatusWidget = {
  key: keyof LoanApplicationStatusData
  label: string
  icon: LucideIcon
  iconClassName: string
}

const STATUS_WIDGETS: StatusWidget[] = [
  {
    key: "allApplications",
    label: "All Applications",
    icon: LayoutGridIcon,
    iconClassName: "bg-blue-50 text-blue-500",
  },
  {
    key: "pending",
    label: "Pending",
    icon: HourglassIcon,
    iconClassName: "bg-amber-50 text-amber-500",
  },
  {
    key: "approved",
    label: "Approved",
    icon: CheckCircle2Icon,
    iconClassName: "bg-emerald-50 text-emerald-500",
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: XCircleIcon,
    iconClassName: "bg-red-50 text-red-500",
  },
  {
    key: "withdrawn",
    label: "Withdrawn",
    icon: CircleSlashIcon,
    iconClassName: "bg-gray-100 text-gray-500",
  },
]

const LoanStatusCard = ({
  data,
  pendingLoans,
  completedLoans,
  discardedLoans,
  selectedLoan,
  onSelectedLoanChange,
  onViewFullSchedule,
}: PaymentSummaryCardProps) => {
  const allLoans = [
    { label: "Select a loan", value: null },
    ...completedLoans,
    ...pendingLoans,
    ...discardedLoans,
  ]

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Loan Applications</h2>
          <div className="flex items-center gap-2">
            <Select items={allLoans} value={selectedLoan} onValueChange={onSelectedLoanChange}>
              <SelectTrigger className="w-full max-w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Pending</SelectLabel>
                  {pendingLoans.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Completed</SelectLabel>
                  {completedLoans.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Discarded</SelectLabel>
                  {discardedLoans.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={onViewFullSchedule}>
              <CalendarCheckIcon className="size-4" />
              View Full Schedule
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {STATUS_WIDGETS.map(({ key, label, icon: Icon, iconClassName }) => (
            <Card key={key}>
            <CardContent className="flex items-center gap-3">
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
                <Icon className="size-4" />
                </span>
                <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-base font-semibold">{data[key]}</p>
                </div>
            </CardContent>
            </Card>
        ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default LoanStatusCard