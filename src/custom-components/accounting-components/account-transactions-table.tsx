import { useState } from "react"
import { MoreVerticalIcon } from "lucide-react"
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
import TableEmptyState from "../table-empty-state"

export type RepaymentTransaction = {
  id: string
  date: string
  isoDate: string
  referenceNo: string
  description: string
  type: "Debit" | "Credit"
  debit: string
  credit: string
  balance: string
}

type RepaymentTransactionsTableProps = {
  transactions: RepaymentTransaction[]
}

const transactionTypeOptions = [
  { label: "All Transactions", value: "all" },
  { label: "Debit", value: "Debit" },
  { label: "Credit", value: "Credit" },
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

const typeBadgeStyles: Record<RepaymentTransaction["type"], string> = {
  Debit: "bg-red-100 text-red-700 hover:bg-red-100",
  Credit: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
}

const AccountTransactionsTable = ({ transactions }: RepaymentTransactionsTableProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [transactionType, setTransactionType] = useState("all")
  const [dateRange, setDateRange] = useState("all")

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      txn.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = transactionType === "all" || txn.type === transactionType

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
        { header: "Reference No.", accessor: (row) => row.referenceNo },
        { header: "Description", accessor: (row) => row.description },
        { header: "Type", accessor: (row) => row.type },
        { header: "Debit (TZS)", accessor: (row) => row.debit },
        { header: "Credit (TZS)", accessor: (row) => row.credit },
        { header: "Balance (TZS)", accessor: (row) => row.balance },
      ],
      "account-transactions.csv",
    )
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <TableFilterBar
          bare
          title="Account Transactions"
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchPlaceholder="Search by reference or description..."
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
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Reference No.</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Debit (TZS)</TableHead>
              <TableHead>Credit (TZS)</TableHead>
              <TableHead>Balance (TZS)</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableEmptyState colSpan={8} message="No transactions available" />
            ) : (
              filteredTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="text-muted-foreground">{txn.date}</TableCell>
                  <TableCell className="font-medium">{txn.referenceNo}</TableCell>
                  <TableCell>{txn.description}</TableCell>
                  <TableCell>
                    <Badge className={typeBadgeStyles[txn.type]} variant="secondary">
                      {txn.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{txn.debit}</TableCell>
                  <TableCell>{txn.credit}</TableCell>
                  <TableCell>{txn.balance}</TableCell>
                  <TableCell>
                    <button className="flex size-8 items-center justify-center rounded-md hover:bg-accent">
                      <MoreVerticalIcon className="size-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default AccountTransactionsTable