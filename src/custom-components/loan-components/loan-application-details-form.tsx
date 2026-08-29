import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Switch } from "../../components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

const loanOfficerOptions = [
  { label: "Amina Mohamed", value: "amina-mohamed" },
  { label: "John Mushi", value: "john-mushi" },
  { label: "Grace Kileo", value: "grace-kileo" },
]

const interestMethodOptions = [
  { label: "Flat", value: "flat" },
  { label: "Reducing Balance", value: "reducing_balance" },
]

const tenureOptions = [
  { label: "6 Months", value: "6" },
  { label: "12 Months", value: "12" },
  { label: "18 Months", value: "18" },
  { label: "24 Months", value: "24" },
  { label: "36 Months", value: "36" },
]

export type LoanDetailsFormValues = {
  loanOfficerId: string
  requestedAmount: string
  interestRate: string
  interestMethod: string
  tenure: string
  penaltyRate: string
  graceDays: string
  guarantorRequired: boolean
  collateralRequired: boolean
  creditAssessmentRequired: boolean
}

const LoanApplicationDetails = () => {
  const [guarantorRequired, setGuarantorRequired] = useState(true)
  const [collateralRequired, setCollateralRequired] = useState(true)
  const [creditAssessmentRequired, setCreditAssessmentRequired] = useState(true)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Loan Details</CardTitle>
        <p className="text-sm text-muted-foreground">Enter the loan parameters and terms</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="loanOfficerId">
              Loan Officer <span className="text-destructive">*</span>
            </Label>
            <Select>
              <SelectTrigger id="loanOfficerId" className="w-full">
                <SelectValue placeholder="Select loan officer" />
              </SelectTrigger>
              <SelectContent>
                {loanOfficerOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="requestedAmount">
              Loan Amount (TZS) <span className="text-destructive">*</span>
            </Label>
            <Input id="requestedAmount" type="number" placeholder="25,000,000" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="interestRate">
              Interest Rate (%) <span className="text-destructive">*</span>
            </Label>
            <Input id="interestRate" type="number" step="0.01" placeholder="12.00" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="interestMethod">
              Interest Method <span className="text-destructive">*</span>
            </Label>
            <Select>
              <SelectTrigger id="interestMethod" className="w-full">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {interestMethodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tenure">
              Tenure (Months) <span className="text-destructive">*</span>
            </Label>
            <Select>
              <SelectTrigger id="tenure" className="w-full">
                <SelectValue placeholder="Select tenure" />
              </SelectTrigger>
              <SelectContent>
                {tenureOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="penaltyRate">
              Penalty Rate (%) <span className="text-destructive">*</span>
            </Label>
            <Input id="penaltyRate" type="number" step="0.01" placeholder="2.00" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="graceDays">Grace Period (Days)</Label>
            <Input id="graceDays" type="number" placeholder="7" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Require Guarantor(s)</p>
              <p className="text-sm text-muted-foreground">Toggle if this loan requires guarantor(s)</p>
            </div>
            <Switch checked={guarantorRequired} onCheckedChange={setGuarantorRequired} />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Require Collateral</p>
              <p className="text-sm text-muted-foreground">Toggle if this loan requires collateral</p>
            </div>
            <Switch checked={collateralRequired} onCheckedChange={setCollateralRequired} />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Require Credit Assessment</p>
              <p className="text-sm text-muted-foreground">Toggle if this loan requires credit assessment</p>
            </div>
            <Switch checked={creditAssessmentRequired} onCheckedChange={setCreditAssessmentRequired} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoanApplicationDetails