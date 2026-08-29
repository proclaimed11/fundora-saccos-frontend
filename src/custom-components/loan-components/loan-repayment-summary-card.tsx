import { CalendarCheckIcon } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Separator } from "../../components/ui/separator"
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

export type PaymentSummaryData = {
  totalAmount: string
  amountPaid: string
  amountOutstanding: string
  paymentsMade: number
  totalPayments: number
}

export type LoanOption = {
  label: string
  value: string
}

type PaymentSummaryCardProps = {
  data: PaymentSummaryData
  pendingLoans: LoanOption[]
  completedLoans: LoanOption[]
  discardedLoans: LoanOption[]
  selectedLoan?: string | null
  onSelectedLoanChange?: (value: string | null) => void
  onViewFullSchedule?: () => void
}

type SummaryWidget = {
  key: string
  label: string
  value: string
}

const PaymentSummaryCard = ({
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

  const SUMMARY_WIDGETS: SummaryWidget[] = [
    {
      key: "totalAmount",
      label: "Total Amount",
      value: data.totalAmount,
    },
    {
      key: "amountPaid",
      label: "Amount Paid",
      value: data.amountPaid,
    },
    {
      key: "amountOutstanding",
      label: "Amount Outstanding",
      value: data.amountOutstanding,
    },
    {
      key: "paymentsMade",
      label: "Payments Made",
      value: `${data.paymentsMade} / ${data.totalPayments}`,
    },
  ]

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Payment Summary</h2>
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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
          {SUMMARY_WIDGETS.map(({ key, label, value }, index) => (
            <div key={key} className="flex flex-1 items-stretch gap-4">
              <div className="flex flex-1 flex-col gap-1">
                <p className="text-xs text-muted-foreground">{label}</p>
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

export default PaymentSummaryCard