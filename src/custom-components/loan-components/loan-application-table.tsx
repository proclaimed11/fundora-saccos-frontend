import { useState } from "react"
import { EyeIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { DateRange } from "react-day-picker"
import { isWithinInterval, parse, startOfDay, endOfDay } from "date-fns"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { cn } from "../../lib/utils"
import TableFilterBar from "../table-filter-bar"

export type LoanApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "CREDIT_APPROVED"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "CONTRACT_GENERATED"
  | "CONTRACT_SIGNED"
  | "LOAN_CREATED"

export type LoanApplication = {
  id: string
  applicationNo: string
  applicantId: string
  applicantName: string
  loanOfficerName: string
  requestedAmount: string
  status: LoanApplicationStatus
  finalized: boolean
  submittedOn: string // "May 14, 2024 10:25 AM" or "-" if still a draft
}

const statusStyles: Record<LoanApplicationStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  SUBMITTED: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  CREDIT_APPROVED: "bg-teal-100 text-teal-700 hover:bg-teal-100",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  APPROVED: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  REJECTED: "bg-red-100 text-red-700 hover:bg-red-100",
  CONTRACT_GENERATED: "bg-indigo-100 text-indigo-700 hover:bg-indigo-100",
  CONTRACT_SIGNED: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  LOAN_CREATED: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
}

const statusLabels: Record<LoanApplicationStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  CREDIT_APPROVED: "Credit Approved",
  PENDING_APPROVAL: "Pending Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CONTRACT_GENERATED: "Contract Generated",
  CONTRACT_SIGNED: "Contract Signed",
  LOAN_CREATED: "Loan Created",
}

const statusOptions = [
  { label: "All Statuses", value: "all" },
  ...(Object.keys(statusLabels) as LoanApplicationStatus[]).map((status) => ({
    label: statusLabels[status],
    value: status,
  })),
]

// Matches "May 14, 2024 10:25 AM"
const parseSubmittedOn = (value: string) => parse(value, "MMM d, yyyy h:mm a", new Date())

type LoanApplicationTableProps = {
  applications: LoanApplication[]
  onContinue?: (application: LoanApplication) => void
  onExport?: (filteredApplications: LoanApplication[]) => void
  context?: "standalone" | "applicant" // NEW
}

const LoanApplicationTable = ({
  applications,
  onContinue,
  onExport,
  context = "standalone"
}: LoanApplicationTableProps) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredApplications = applications.filter((application) => {
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch =
      query === "" ||
      application.applicationNo.toLowerCase().includes(query) ||
      application.applicantName.toLowerCase().includes(query) ||
      application.loanOfficerName.toLowerCase().includes(query)

    const matchesStatus = status === "all" || application.status === status

    const matchesDateRange = (() => {
      if (!dateRange?.from) return true
      if (application.submittedOn === "-") return false
      const submittedDate = parseSubmittedOn(application.submittedOn)
      const rangeStart = startOfDay(dateRange.from)
      const rangeEnd = endOfDay(dateRange.to ?? dateRange.from)
      return isWithinInterval(submittedDate, { start: rangeStart, end: rangeEnd })
    })()

    return matchesSearch && matchesStatus && matchesDateRange
  })

  const totalApplications = filteredApplications.length
  const totalPages = Math.max(Math.ceil(totalApplications / pageSize), 1)
  const safePage = Math.min(currentPage, totalPages)

  const rangeStart = totalApplications === 0 ? 0 : (safePage - 1) * pageSize + 1
  const rangeEnd = Math.min(safePage * pageSize, totalApplications)

  const pageApplications = filteredApplications.slice((safePage - 1) * pageSize, safePage * pageSize)

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages))
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setCurrentPage(1)
  }

const handleView = (application: LoanApplication) => {
  if (context === "applicant") {
    navigate(`/applicants/${application.applicantId}/loan-applications/${application.applicationNo}`)
  } else {
    navigate(`/loans/${application.applicationNo}`)
  }
}

  const visiblePages = Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
    const start = Math.max(1, Math.min(safePage - 1, totalPages - 2))
    return start + i
  })
  const showTrailingEllipsis = totalPages > 3 && visiblePages[visiblePages.length - 1] < totalPages

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <TableFilterBar
          bare
          searchQuery={searchQuery}
          onSearchQueryChange={(value) => {
            setSearchQuery(value)
            setCurrentPage(1)
          }}
          searchPlaceholder="Search by application no, applicant, or officer..."
          filters={[
            {
              key: "status",
              label: "Status",
              value: status,
              onChange: (value) => {
                setStatus(value)
                setCurrentPage(1)
              },
              options: statusOptions,
              widthClassName: "w-48",
            },
          ]}
          showDateRange
          dateRange={dateRange}
          onDateRangeChange={(range) => {
            setDateRange(range)
            setCurrentPage(1)
          }}
          onExport={onExport ? () => onExport(filteredApplications) : undefined}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Application No.</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Loan Officer</TableHead>
              <TableHead>Requested Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted On</TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  No loan applications match your filters.
                </TableCell>
              </TableRow>
            ) : (
              pageApplications.map((application, index) => (
                <TableRow key={application.id}>
                  <TableCell className="text-muted-foreground">{(safePage - 1) * pageSize + index + 1}</TableCell>
                  <TableCell className="font-medium">{application.applicationNo}</TableCell>
                  <TableCell>{application.applicantName}</TableCell>
                  <TableCell className="text-muted-foreground">{application.loanOfficerName}</TableCell>
                  <TableCell>{application.requestedAmount}</TableCell>
                  <TableCell>
                    <Badge className={cn("font-medium", statusStyles[application.status])} variant="secondary">
                      {statusLabels[application.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{application.submittedOn}</TableCell>
                  <TableCell className="text-right">
                    {application.status === "DRAFT" && !application.finalized ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Continue application ${application.applicationNo}`}
                        onClick={() => onContinue?.(application)}
                      >
                        <PlayIcon className="size-4 text-muted-foreground" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`View application ${application.applicationNo}`}
                        onClick={() => handleView(application)}
                      >
                        <EyeIcon className="size-4 text-muted-foreground" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {rangeStart} to {rangeEnd} of {totalApplications} applications
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={safePage === 1}
                onClick={() => goToPage(safePage - 1)}
              >
                <ChevronLeftIcon className="size-4" />
              </Button>

              {visiblePages.map((page) => (
                <Button
                  key={page}
                  variant={page === safePage ? "default" : "outline"}
                  size="icon"
                  className="size-8"
                  onClick={() => goToPage(page)}
                >
                  {page}
                </Button>
              ))}

              {showTrailingEllipsis && (
                <>
                  <span className="px-1 text-sm text-muted-foreground">...</span>
                  <Button variant="outline" size="icon" className="size-8" onClick={() => goToPage(totalPages)}>
                    {totalPages}
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={safePage === totalPages}
                onClick={() => goToPage(safePage + 1)}
              >
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>

            <Select value={String(pageSize)} onValueChange={(value) => handlePageSizeChange(value ?? String(pageSize))}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="25">25 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoanApplicationTable