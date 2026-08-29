import { useState } from "react"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import TableFilterBar from "../table-filter-bar"
import { exportToCsv } from "../../lib/export-csv"
import { Button } from "@/components/ui/button"
import { BanknoteIcon } from "lucide-react"
import TableEmptyState from "../table-empty-state"

export type RepaymentTransaction = {
  id: string
  date: string
  isoDate: string
  type: string
  typeValue: string
  amount: string
  principal: string
  interest: string
  balance: string
  status: "Received" | "Pending" | "Failed"
  reference: string
}

type RepaymentTransactionsTableProps = {
  transactions: RepaymentTransaction[]
}

const transactionTypeOptions = [
  { label: "All Transactions", value: "all" },
  { label: "Mobile Payment", value: "mobile_payment" },
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Cash", value: "cash" },
]

const dateRangeOptions = [
  { label: "Last 3 Months", value: "3m" },
  { label: "Last 6 Months", value: "6m" },
  { label: "Last 12 Months", value: "12m" },
  { label: "All Time", value: "all" },
]

const monthsForRange: Record<string, number | null> = {
  "3m": 3,
  "6m": 6,
  "12m": 12,
  all: null,
}

const statusBadgeStyles: Record<RepaymentTransaction["status"], string> = {
  Received: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Failed: "bg-red-100 text-red-700 hover:bg-red-100",
}

const LoanRepaymentTransactionsTable = ({ transactions }: RepaymentTransactionsTableProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [transactionType, setTransactionType] = useState("all")
  const [dateRange, setDateRange] = useState("all")

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      txn.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.type.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = transactionType === "all" || txn.typeValue === transactionType

    const monthsBack = monthsForRange[dateRange]
    let matchesDate = true
    if (monthsBack !== null) {
      const cutoff = new Date()
      cutoff.setMonth(cutoff.getMonth() - monthsBack)
      matchesDate = new Date(txn.isoDate) >= cutoff
    }

    return matchesSearch && matchesType && matchesDate
  })

  const handleExport = () => {
    exportToCsv(
      filteredTransactions,
      [
        { header: "Date", accessor: (row) => row.date },
        { header: "Type", accessor: (row) => row.type },
        { header: "Amount", accessor: (row) => row.amount },
        { header: "Principal", accessor: (row) => row.principal },
        { header: "Interest", accessor: (row) => row.interest },
        { header: "Balance", accessor: (row) => row.balance },
        { header: "Status", accessor: (row) => row.status },
        { header: "Reference", accessor: (row) => row.reference },
      ],
      "repayment-transactions.csv",
    )
  }


  const handlePaymentProcess=()=>{

  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <TableFilterBar
          bare
          title="Repayment Transactions"
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchPlaceholder="Search by reference or type..."
          filters={[
            {
              key: "transactionType",
              label: "Type",
              value: transactionType,
              onChange: setTransactionType,
              options: transactionTypeOptions,
              widthClassName: "w-44",
            },
            {
              key: "dateRange",
              label: "Period",
              value: dateRange,
              onChange: setDateRange,
              options: dateRangeOptions,
              widthClassName: "w-40",
            },
          ]}
          onExport={handleExport}
           endSlot={
            handlePaymentProcess && (
              <Button onClick={handlePaymentProcess}>
                <BanknoteIcon className="size-4" />
                Process Payment
              </Button>
            )
          }
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Principal</TableHead>
              <TableHead>Interest</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
                <TableEmptyState colSpan={9} message="No transactions available" />
            ) : (
              filteredTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="text-muted-foreground">{txn.date}</TableCell>
                  <TableCell>{txn.type}</TableCell>
                  <TableCell>{txn.amount}</TableCell>
                  <TableCell>{txn.principal}</TableCell>
                  <TableCell>{txn.interest}</TableCell>
                  <TableCell>{txn.balance}</TableCell>
                  <TableCell>
                    <Badge className={statusBadgeStyles[txn.status]} variant="secondary">
                      {txn.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{txn.reference}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default LoanRepaymentTransactionsTable