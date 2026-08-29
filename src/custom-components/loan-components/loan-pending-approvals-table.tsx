import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { DateRange } from "react-day-picker"
import { isWithinInterval, parse, startOfDay, endOfDay } from "date-fns"
import { ChevronLeftIcon, ChevronRightIcon} from "lucide-react"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Checkbox } from "../../components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import TableFilterBar from "../table-filter-bar"
import TableEmptyState from "../table-empty-state"

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

export type PendingApproval = {
  id: string
  applicationId: string
  applicantName: string
  loanType: string
  loanTypeValue: string
  requestedAmount: string
  applicationDate: string
  isoApplicationDate: string
  loanOfficerName: string
  approvalStepLabel: string
  approvalStepNumber: number
  approvalStepTotal: number
  statusValue: LoanApplicationStatus
}

type PendingApprovalsTableProps = {
  approvals: PendingApproval[]
  onReview?: (approval: PendingApproval) => void
  onBulkApprove?: (ids: string[]) => void
  onBulkReject?: (ids: string[]) => void
  searchPlaceholder?: string
}

const loanTypeOptions = [
  { label: "All", value: "all" },
  { label: "Personal Loan", value: "personal_loan" },
  { label: "Business Loan", value: "business_loan" },
  { label: "Emergency Loan", value: "emergency_loan" },
]

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

const statusOptions = [
  { label: "All", value: "all" },
  ...(Object.keys(statusLabels) as LoanApplicationStatus[]).map((status) => ({
    label: statusLabels[status],
    value: status,
  })),
]

const parseApplicationDate = (value: string) => parse(value, "MMM d, yyyy h:mm a", new Date())

const PAGE_SIZE = 8

const PendingApprovalsTable = ({
  approvals,
  onReview,
  onBulkApprove,
  onBulkReject,
  searchPlaceholder,
}: PendingApprovalsTableProps) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [loanType, setLoanType] = useState("all")
  const [loanOfficer, setLoanOfficer] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)

  const loanOfficerOptions = useMemo(() => {
    const names = Array.from(new Set(approvals.map((a) => a.loanOfficerName))).sort()
    return [{ label: "All", value: "all" }, ...names.map((name) => ({ label: name, value: name }))]
  }, [approvals])

  const filtered = approvals.filter((a) => {
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch =
      query === "" ||
      a.applicationId.toLowerCase().includes(query) ||
      a.applicantName.toLowerCase().includes(query)

    const matchesStatus = status === "all" || a.statusValue === status
    const matchesLoanType = loanType === "all" || a.loanTypeValue === loanType
    const matchesLoanOfficer = loanOfficer === "all" || a.loanOfficerName === loanOfficer

    const matchesDateRange = (() => {
      if (!dateRange?.from) return true
      const applicationDate = parseApplicationDate(a.applicationDate)
      const rangeStart = startOfDay(dateRange.from)
      const rangeEnd = endOfDay(dateRange.to ?? dateRange.from)
      return isWithinInterval(applicationDate, { start: rangeStart, end: rangeEnd })
    })()

    return matchesSearch && matchesStatus && matchesLoanType && matchesLoanOfficer && matchesDateRange
  })

  const totalEntries = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const endIndex = Math.min(currentPage * PAGE_SIZE, totalEntries)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const allOnPageSelected = pageItems.length > 0 && pageItems.every((a) => selectedIds.has(a.id))

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      pageItems.forEach((a) => (checked ? next.add(a.id) : next.delete(a.id)))
      return next
    })
  }

  const toggleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
  }

  const handleReview = (approval: PendingApproval) => {
    if (onReview) {
      onReview(approval)
    } else {
      navigate(`/loans/${approval.applicationId}/approvals-status`)
    }
  }

  const handleBulkApprove = () => {
    onBulkApprove?.(Array.from(selectedIds))
  }

  const handleBulkReject = () => {
    onBulkReject?.(Array.from(selectedIds))
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <TableFilterBar
          bare
          searchQuery={searchQuery}
          onSearchQueryChange={(value) => {
            setSearchQuery(value)
            setPage(1)
          }}
          searchPlaceholder={searchPlaceholder ?? "Search by applicant name, application ID..."}
          filters={[
            {
              key: "status",
              label: "Application Status",
              value: status,
              onChange: (v) => {
                setStatus(v)
                setPage(1)
              },
              options: statusOptions,
              widthClassName: "w-48",
            },
            {
              key: "loanType",
              label: "Loan Type",
              value: loanType,
              onChange: (v) => {
                setLoanType(v)
                setPage(1)
              },
              options: loanTypeOptions,
              widthClassName: "w-36",
            },
            {
              key: "loanOfficer",
              label: "Loan Officer",
              value: loanOfficer,
              onChange: (v) => {
                setLoanOfficer(v)
                setPage(1)
              },
              options: loanOfficerOptions,
              widthClassName: "w-40",
            },
          ]}
          showDateRange
          dateRange={dateRange}
          onDateRangeChange={(range) => {
            setDateRange(range)
            setPage(1)
          }}
        />

        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
            <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600"
                onClick={handleBulkReject}
              >
                Bulk Reject
              </Button>
              <Button size="sm" onClick={handleBulkApprove}>
                Bulk Approve
              </Button>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allOnPageSelected}
                  onCheckedChange={(checked) => toggleSelectAll(checked === true)}
                />
              </TableHead>
              <TableHead>Application ID</TableHead>
              <TableHead>Applicant Name</TableHead>
              <TableHead>Loan Type</TableHead>
              <TableHead>Requested Amount (TZS)</TableHead>
              <TableHead>Application Date</TableHead>
              <TableHead>Loan Officer</TableHead>
              <TableHead>Current Approval Step</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 ? (
                <TableEmptyState colSpan={9} message="No pending approvals available" />
            ) : (
              pageItems.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(a.id)}
                      onCheckedChange={(checked) => toggleSelectRow(a.id, checked === true)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{a.applicationId}</TableCell>
                  <TableCell>{a.applicantName}</TableCell>
                  <TableCell className="text-muted-foreground">{a.loanType}</TableCell>
                  <TableCell>{a.requestedAmount}</TableCell>
                  <TableCell className="text-muted-foreground">{a.applicationDate}</TableCell>
                  <TableCell className="text-muted-foreground">{a.loanOfficerName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{a.approvalStepLabel}</span>
                      <span className="text-xs text-muted-foreground">
                        {a.approvalStepNumber} of {a.approvalStepTotal}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusStyles[a.statusValue]} variant="secondary">
                      {statusLabels[a.statusValue]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/5 hover:text-primary"
                      onClick={() => handleReview(a)}
                    >
                      Review
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
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PendingApprovalsTable