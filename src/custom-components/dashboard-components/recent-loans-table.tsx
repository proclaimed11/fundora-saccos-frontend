import { MoreVerticalIcon, PrinterIcon, ListChecksIcon } from "lucide-react"
import SectionCard from "../section-card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { cn } from "../../lib/utils"

type ApplicationStatus = "Under Review" | "Approved" | "Rejected"

type LoanApplication = {
  id: string
  loanee: string
  amount: string
  purpose: string
  status: ApplicationStatus
  appliedOn: string
}

const statusStyles: Record<ApplicationStatus, string> = {
  "Under Review": "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Approved: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Rejected: "bg-red-100 text-red-700 hover:bg-red-100",
}

const applications: LoanApplication[] = [
  { id: "APP-2025-0148", loanee: "Juma Said", amount: "25,000,000", purpose: "Business", status: "Under Review", appliedOn: "May 14, 2025" },
  { id: "APP-2025-0147", loanee: "Fatuma Ali", amount: "15,000,000", purpose: "Education", status: "Under Review", appliedOn: "May 14, 2025" },
  { id: "APP-2025-0146", loanee: "Abdul Karim", amount: "30,000,000", purpose: "Business", status: "Approved", appliedOn: "May 13, 2025" },
  { id: "APP-2025-0145", loanee: "Asha Mwinyi", amount: "10,000,000", purpose: "Personal", status: "Under Review", appliedOn: "May 13, 2025" },
  { id: "APP-2025-0144", loanee: "Hassan M.", amount: "50,000,000", purpose: "Business", status: "Rejected", appliedOn: "May 12, 2025" },
]

const RecentLoanApplicationsTable = () => {
  return (
    <SectionCard
      icon={ListChecksIcon}
      title="Recent Loan Applications"
      headerAction={
        <div className="flex items-center gap-2">
        <Button variant="link" size="sm" className="h-auto p-0 text-sm">
          View All
        </Button>
        </div>
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Application ID</TableHead>
            <TableHead>Loanee</TableHead>
            <TableHead>Amount (TZS)</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied On</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => (
            <TableRow key={application.id}>
              <TableCell className="font-medium">{application.id}</TableCell>
              <TableCell>{application.loanee}</TableCell>
              <TableCell>{application.amount}</TableCell>
              <TableCell className="text-muted-foreground">{application.purpose}</TableCell>
              <TableCell>
                <Badge className={cn("font-medium", statusStyles[application.status])} variant="secondary">
                  {application.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{application.appliedOn}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-md hover:bg-accent">
                    <MoreVerticalIcon className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Approve</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">Reject</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>s
    </SectionCard>
  )
}

export default RecentLoanApplicationsTable