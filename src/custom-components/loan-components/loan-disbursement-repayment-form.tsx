import { useState } from "react"
import { CalendarIcon, BanknoteIcon } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Dummy chart-of-accounts entries — swap for GET /api/chart-of-accounts
const cashPaidToAccounts = [
  { label: "CASH — Cash on Hand", value: "CASH" },
  { label: "LOAN_RECEIVABLE — Loan Receivable", value: "LOAN_RECEIVABLE" },
  { label: "INTEREST_INCOME — Interest Income", value: "INTEREST_INCOME" },
  { label: "PENALTY_INCOME — Penalty Income", value: "PENALTY_INCOME" },
]

const paymentLocationAccounts = [
  { label: "Head Office", value: "head_office" },
  { label: "Branch #1 — Mikocheni", value: "branch_1" },
  { label: "Branch #2 — Kariakoo", value: "branch_2" },
  { label: "Mobile Agent — Field Disbursement", value: "mobile_agent" },
]

const disbursementMethods = [
  { label: "Cash", value: "cash" },
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Mobile Money", value: "mobile_money" },
]

type DisbursementSummaryData = {
  loanApplicationNo: string
  applicant: string
  approvedAmount: string
  disbursementAmount: string
  disbursementMethod: string
  disbursementDate: string
  reference: string
  availableToDisburse: string
}

const DisbursementSummaryCard = ({ data }: { data: DisbursementSummaryData }) => {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold">Disbursement Summary</h2>

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Loan Application No.</span>
            <span className="font-medium">{data.loanApplicationNo}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Applicant</span>
            <span className="font-medium">{data.applicant}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Approved Amount</span>
            <span className="font-medium">{data.approvedAmount}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Disbursement Amount</span>
            <span className="font-medium">{data.disbursementAmount}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Disbursement Method</span>
            <span className="font-medium">{data.disbursementMethod}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Disbursement Date</span>
            <span className="font-medium">{data.disbursementDate}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Reference</span>
            <span className="font-medium">{data.reference}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 rounded-lg border border-l-4 border-l-primary bg-card p-4">
          <p className="text-xs text-muted-foreground">Available to Disburse</p>
          <p className="text-lg font-semibold">{data.availableToDisburse}</p>
        </div>
      </CardContent>
    </Card>
  )
}

const LoanDisbursementRepayment = () => {
  const [disbursementDate, setDisbursementDate] = useState<Date | undefined>(new Date())
  const [amount, setAmount] = useState("25,000,000")
  const [method, setMethod] = useState("cash")
  const [referenceNarration, setReferenceNarration] = useState("Disbursement - LA-0000241")

  const [cashPaidTo, setCashPaidTo] = useState("")
  const [cashPaidToDescription, setCashPaidToDescription] = useState("")
  const [paymentLocation, setPaymentLocation] = useState("")
  const [paymentLocationDescription, setPaymentLocationDescription] = useState("")

  const handleSubmit = () => {
    // POST /api/disbursement/loans/{loanId}/disburse
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="flex flex-col gap-6">
            <h1 className="text-sm font-semibold">Disbursement Details</h1>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label>
                  Disbursement Date <span className="text-destructive">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button variant="outline" className="justify-start gap-2 font-normal">
                        <CalendarIcon className="size-4 text-muted-foreground" />
                        {disbursementDate ? format(disbursementDate, "MMM d, yyyy") : "Select date"}
                      </Button>
                    }
                  />
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar mode="single" selected={disbursementDate} onSelect={setDisbursementDate} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>
                  Disbursement Amount (TZS) <span className="text-destructive">*</span>
                </Label>
                <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
                <p className="text-xs text-muted-foreground">Balance to Disburse: TZS {amount}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>
                  Disbursement Method <span className="text-destructive">*</span>
                </Label>
                <Select value={method} onValueChange={(value) => setMethod(value ?? method)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {disbursementMethods.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>
                Reference / Narration <span className="text-destructive">*</span>
              </Label>
              <Input value={referenceNarration} onChange={(e) => setReferenceNarration(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>
                  Cash Paid To <span className="text-destructive">*</span>
                </Label>
                <Select value={cashPaidTo} onValueChange={(value) => setCashPaidTo(value ?? cashPaidTo)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {cashPaidToAccounts.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>
                  Description <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={cashPaidToDescription}
                  onChange={(e) => setCashPaidToDescription(e.target.value)}
                  placeholder="Debit entry description"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>
                  Payment Location <span className="text-destructive">*</span>
                </Label>
                <Select value={paymentLocation} onValueChange={(value) => setPaymentLocation(value ?? paymentLocation)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentLocationAccounts.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>
                  Description <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={paymentLocationDescription}
                  onChange={(e) => setPaymentLocationDescription(e.target.value)}
                  placeholder="Credit entry description"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSubmit}>
                <BanknoteIcon className="size-4" />
                Submit Disbursement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <DisbursementSummaryCard
          data={{
            loanApplicationNo: "LA-0000241",
            applicant: "Juma Ali Said",
            approvedAmount: "TZS 25,000,000",
            disbursementAmount: "TZS 25,000,000",
            disbursementMethod: "Cash",
            disbursementDate: "May 14, 2024",
            reference: "Disbursement - LA-0000241",
            availableToDisburse: "TZS 25,000,000",
          }}
        />
      </div>
    </div>
  )
}

export default LoanDisbursementRepayment