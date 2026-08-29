import { useState } from "react"
import {
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
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
import TableEmptyState from "../table-empty-state"

export type KycStatus = "Verified" | "Pending" | "Rejected"
export type RegistrationStatus = "Completed" | "Continue Registration"

export type Applicant = {
  id: string
  fullName: string
  phone: string
  email: string
  kycStatus: KycStatus
  registrationStatus: RegistrationStatus
  registeredOn: string
}

const kycStatusStyles: Record<KycStatus, string> = {
  Verified: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Rejected: "bg-red-100 text-red-700 hover:bg-red-100",
}

const registrationStatusStyles: Record<RegistrationStatus, string> = {
  Completed: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  "Continue Registration": "bg-amber-100 text-amber-700 hover:bg-amber-100",
}

const kycStatusOptions = [
  { label: "All KYC Statuses", value: "all" },
  { label: "Verified", value: "Verified" },
  { label: "Pending", value: "Pending" },
  { label: "Rejected", value: "Rejected" },
]

const registrationStatusOptions = [
  { label: "All Registrations", value: "all" },
  { label: "Completed", value: "Completed" },
  { label: "Continue Registration", value: "Continue Registration" },
]

// Matches "May 14, 2024 10:25 AM"
const parseRegisteredOn = (value: string) => parse(value, "MMM d, yyyy h:mm a", new Date())

type ApplicantsTableProps = {
  applicants: Applicant[]
  onViewProfile?: (applicant: Applicant) => void
  onViewRegistration?: (applicant: Applicant) => void
  onEdit?: (applicant: Applicant) => void
  onArchive?: (applicant: Applicant) => void
  /** Receives the currently filtered list, so export reflects active filters. */
  onExport?: (filteredApplicants: Applicant[]) => void
}

const ApplicantsTable = ({
  applicants,
  onViewProfile,
  onExport,
}: ApplicantsTableProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [kycStatus, setKycStatus] = useState("all")
  const [registrationStatus, setRegistrationStatus] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredApplicants = applicants.filter((applicant) => {
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch =
      query === "" ||
      applicant.fullName.toLowerCase().includes(query) ||
      applicant.id.toLowerCase().includes(query) ||
      applicant.phone.toLowerCase().includes(query) ||
      applicant.email.toLowerCase().includes(query)

    const matchesKyc = kycStatus === "all" || applicant.kycStatus === kycStatus
    const matchesRegistration =
      registrationStatus === "all" || applicant.registrationStatus === registrationStatus

    const matchesDateRange = (() => {
      if (!dateRange?.from) return true
      const registeredDate = parseRegisteredOn(applicant.registeredOn)
      const rangeStart = startOfDay(dateRange.from)
      const rangeEnd = endOfDay(dateRange.to ?? dateRange.from)
      return isWithinInterval(registeredDate, { start: rangeStart, end: rangeEnd })
    })()

    return matchesSearch && matchesKyc && matchesRegistration && matchesDateRange
  })

  const totalApplicants = filteredApplicants.length
  const totalPages = Math.max(Math.ceil(totalApplicants / pageSize), 1)
  const safePage = Math.min(currentPage, totalPages)

  const rangeStart = totalApplicants === 0 ? 0 : (safePage - 1) * pageSize + 1
  const rangeEnd = Math.min(safePage * pageSize, totalApplicants)

  const pageApplicants = filteredApplicants.slice((safePage - 1) * pageSize, safePage * pageSize)

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages))
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setCurrentPage(1)
  }

  // Show up to 3 page numbers around the current page, with a trailing "..." + last page when needed
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
          searchPlaceholder="Search"
          filters={[
            {
              key: "kycStatus",
              label: "KYC Status",
              value: kycStatus,
              onChange: (value) => {
                setKycStatus(value)
                setCurrentPage(1)
              },
              options: kycStatusOptions,
              widthClassName: "w-44",
            },
            {
              key: "registrationStatus",
              label: "Registration",
              value: registrationStatus,
              onChange: (value) => {
                setRegistrationStatus(value)
                setCurrentPage(1)
              },
              options: registrationStatusOptions,
              widthClassName: "w-48",
            },
          ]}
          showDateRange
          dateRange={dateRange}
          onDateRangeChange={(range) => {
            setDateRange(range)
            setCurrentPage(1)
          }}
          onExport={onExport ? () => onExport(filteredApplicants) : undefined}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Applicant ID</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead>KYC Status</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>Registered On</TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageApplicants.length === 0 ? (
              <TableEmptyState colSpan={9} message="No applicant records available" />
            ) : (
              pageApplicants.map((applicant, index) => (
                <TableRow key={applicant.id}>
                  <TableCell className="text-muted-foreground">{(safePage - 1) * pageSize + index + 1}</TableCell>
                  <TableCell className="font-medium">{applicant.id}</TableCell>
                  <TableCell>{applicant.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{applicant.phone}</TableCell>
                  <TableCell className="text-muted-foreground">{applicant.email}</TableCell>
                  <TableCell>
                    <Badge className={cn("font-medium", kycStatusStyles[applicant.kycStatus])} variant="secondary">
                      {applicant.kycStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn("font-medium", registrationStatusStyles[applicant.registrationStatus])}
                      variant="secondary"
                    >
                      {applicant.registrationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{applicant.registeredOn}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label={`View profile for ${applicant.fullName}`}
                      onClick={() => onViewProfile?.(applicant)}
                    >
                      <EyeIcon className="size-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {rangeStart} to {rangeEnd} of {totalApplicants} applicants
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

export default ApplicantsTable