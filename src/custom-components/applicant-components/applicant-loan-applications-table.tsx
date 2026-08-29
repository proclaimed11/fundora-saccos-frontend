import { useState } from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  FilePlus2Icon,
} from "lucide-react"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
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
import { useNavigate, useParams } from "react-router-dom"
import TableEmptyState from "../table-empty-state"

export type LoanApplication = {
  id: string
  loanId: string
  loanType: string
  loanTypeValue: string
  amount: string
  status: "Active" | "Approved" | "Pending" | "Rejected"
  appliedOn: string
  isoAppliedOn: string
  decisionDate: string
  disbursedAmount: string
}

type LoanApplicationsTableProps = {
  applications: LoanApplication[]
  onSendMessage?: () => void
  onViewDetails?: (application: LoanApplication) => void
  onViewRepaymentHistory?: (application: LoanApplication) => void
  onViewDocuments?: (application: LoanApplication) => void
  onEditApplication?: (application: LoanApplication) => void
  onDisburseLoan?: (application: LoanApplication) => void
  onRecordRepayment?: (application: LoanApplication) => void
  onRestructureLoan?: (application: LoanApplication) => void
  onWithdrawApplication?: (application: LoanApplication) => void
}

const typeOptions = [
  { label: "All Types", value: "all" },
  { label: "Personal Loan", value: "personal_loan" },
  { label: "Business Loan", value: "business_loan" },
  { label: "Emergency Loan", value: "emergency_loan" },
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

const statusBadgeStyles: Record<LoanApplication["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  Approved: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Rejected: "bg-red-100 text-red-700 hover:bg-red-100",
}

const statusDotStyles: Record<LoanApplication["status"], string> = {
  Active: "bg-emerald-500",
  Approved: "bg-emerald-600",
  Pending: "bg-amber-500",
  Rejected: "bg-red-500",
}

const PAGE_SIZE = 5

const LoanApplicationsTable = ({
  applications,
}: LoanApplicationsTableProps) => {
  const navigate = useNavigate()
  const { applicantId } = useParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [type, setType] = useState("all")
  const [dateRange, setDateRange] = useState("all")
  const [page, setPage] = useState(1)

  const filteredApplications = applications.filter((loan) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      loan.loanId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.loanType.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = type === "all" || loan.loanTypeValue === type

    const monthsBack = monthsForRange[dateRange]
    let matchesDate = true
    if (monthsBack !== null) {
      const cutoff = new Date()
      cutoff.setMonth(cutoff.getMonth() - monthsBack)
      matchesDate = new Date(loan.isoAppliedOn) >= cutoff
    }

    return matchesSearch && matchesType && matchesDate
  })

  const totalEntries = filteredApplications.length
  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const endIndex = Math.min(currentPage * PAGE_SIZE, totalEntries)
  const paginatedApplications = filteredApplications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleExport = () => {
    exportToCsv(
      filteredApplications,
      [
        { header: "Loan ID", accessor: (row) => row.loanId },
        { header: "Amount", accessor: (row) => row.amount },
        { header: "Status", accessor: (row) => row.status },
        { header: "Applied On", accessor: (row) => row.appliedOn },
        { header: "Decision Date", accessor: (row) => row.decisionDate },
        { header: "Disbursed Amount", accessor: (row) => row.disbursedAmount },
      ],
      "loan-applications.csv",
    )
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <TableFilterBar
          bare
          title="Loan Applications"
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchPlaceholder="Search"
          filters={[
            {
              key: "type",
              label: "Type",
              value: type,
              onChange: setType,
              options: typeOptions,
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
            <Button onClick={() => navigate("/loans/new-application")}>
              <FilePlus2Icon className="size-4" />
              New Application
            </Button>
          }
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loan ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied On</TableHead>
              <TableHead>Decision Date</TableHead>
              <TableHead>Disbursed Amount</TableHead>
              <TableHead className="w-10 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedApplications.length === 0 ? (
               <TableEmptyState colSpan={9} message="No loan applications records available" />
            ) : (
              paginatedApplications.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">{loan.loanId}</TableCell>
                  <TableCell>{loan.amount}</TableCell>
                  <TableCell>
                    <Badge className={statusBadgeStyles[loan.status]} variant="secondary">
                      <span className={`mr-1.5 size-1.5 rounded-full ${statusDotStyles[loan.status]}`} />
                      {loan.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{loan.appliedOn}</TableCell>
                  <TableCell className="text-muted-foreground">{loan.decisionDate || "-"}</TableCell>
                  <TableCell>{loan.disbursedAmount}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label={`View ${loan.loanId}`}
                      onClick={() => navigate(`/applicants/${applicantId}/loan-applications/${loan.loanId}`)}
                    >
                      <EyeIcon className="size-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {totalEntries === 0
              ? "Showing 0 entries"
              : `Showing ${startIndex} to ${endIndex} of ${totalEntries} entries`}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button variant="outline" size="sm" className="size-8 px-0">
              {currentPage}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoanApplicationsTable