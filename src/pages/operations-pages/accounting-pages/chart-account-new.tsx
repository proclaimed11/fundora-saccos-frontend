import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeftIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const accountTypeOptions = [
  { label: "Asset", value: "Asset" },
  { label: "Contra Asset", value: "Contra Asset" },
  { label: "Liability", value: "Liability" },
  { label: "Equity", value: "Equity" },
  { label: "Income", value: "Income" },
  { label: "Expense", value: "Expense" },
]

const statusOptions = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
]

export type NewAccountFormValues = {
  accountCode: string
  accountName: string
  accountType: string
  startingBalance: string
  status: string
}

const emptyValues: NewAccountFormValues = {
  accountCode: "",
  accountName: "",
  accountType: "",
  startingBalance: "0",
  status: "Active",
}

const NewAccountPage = () => {
  const navigate = useNavigate()
  const [values, setValues] = useState<NewAccountFormValues>(emptyValues)

  const updateField = <K extends keyof NewAccountFormValues>(field: K, value: NewAccountFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: wire up to POST /api/chart-of-accounts
    navigate("/accounts")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate("/accounts")}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">New Account</h1>
          <p className="text-sm text-muted-foreground">Add a new general ledger account to the chart of accounts</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="accountCode">
                  Account Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="accountCode"
                  placeholder="1000-00"
                  value={values.accountCode}
                  onChange={(e) => updateField("accountCode", e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="accountName">
                  Account Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="accountName"
                  placeholder="Cash in Hand"
                  value={values.accountName}
                  onChange={(e) => updateField("accountName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="accountType">
                  Account Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={values.accountType}
                  onValueChange={(value) => updateField("accountType", value ?? "")}
                >
                  <SelectTrigger id="accountType" className="w-full">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="status">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select value={values.status} onValueChange={(value) => updateField("status", value ?? "Active")}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="startingBalance">Starting Balance (TZS)</Label>
                <Input
                  id="startingBalance"
                  type="number"
                  placeholder="0"
                  value={values.startingBalance}
                  onChange={(e) => updateField("startingBalance", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/accounts")}>
                Cancel
              </Button>
              <Button type="submit">Create Account</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default NewAccountPage