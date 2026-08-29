import { CheckIcon, ShieldCheckIcon, XIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const LoanCreditAssesment = () => {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        {/* Financial Information */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold">Financial Information</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Monthly Income (TZS)</Label>
              <Input value="2,500,000" readOnly />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Monthly Expenses (TZS)</Label>
              <Input value="800,000" readOnly />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Existing Debt (TZS)</Label>
              <Input value="300,000" readOnly />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-l-4 border-l-primary bg-card p-4">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium">Available Cash Flow</p>
              <p className="text-xs text-muted-foreground">(Income - Expenses)</p>
            </div>
            <p className="text-lg font-semibold">TZS 1,700,000</p>
          </div>
        </div>

        {/* Repayment History */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold">Repayment History</h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Existing Loans</p>
              <p className="mt-1 text-lg font-semibold">2</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Repayment History</p>
              <p className="mt-1 text-lg font-semibold text-emerald-600">Good</p>
              <p className="text-xs text-muted-foreground">Consistent on-time</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Pending Payments</p>
              <p className="mt-1 text-lg font-semibold text-emerald-600">No</p>
              <p className="text-xs text-muted-foreground">No overdue or pending payments</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Last Payment Date</p>
              <p className="mt-1 text-lg font-semibold">May 14, 2024</p>
            </div>
          </div>
        </div>

        {/* Credit Assessment Result */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold">Credit Assessment Result</h2>

          <div className="flex flex-col items-center gap-3 rounded-lg bg-emerald-50 p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500 text-white">
              <ShieldCheckIcon className="size-6" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Assessment Decision</p>
              <p className="text-2xl font-bold text-emerald-600">APPROVED</p>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              Applicant passes the credit assessment based on income/cash flow, existing debts, repayment history
              and pending payment check.
            </p>
          </div>

          <div className="flex flex-row justify-center gap-2">
            <Button className="gap-1.5">
              <CheckIcon className="size-4" />
              Approve
            </Button>
            <Button variant="outline" className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50">
              <XIcon className="size-4" />
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoanCreditAssesment