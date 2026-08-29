import LoanApplicationTable, { type LoanApplication } from "@/custom-components/loan-components/loan-application-table"
import SummaryCards, { type SummaryWidget } from "@/custom-components/summary-cards"
import { exportToCsv } from "@/lib/export-csv"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  FilePlus2Icon,
  FileTextIcon,
  ClockIcon,
  CheckCircle2Icon,
  BanknoteIcon,
} from "lucide-react"

const allLoanApplications: LoanApplication[] = [
  { id: "1", applicationNo: "LA-1786", applicantId: "1", applicantName: "Juma Ali Said", loanOfficerName: "Herman Mushi", requestedAmount: "TZS 5,000,000", status: "PENDING_APPROVAL", finalized: true, submittedOn: "May 14, 2024 10:25 AM" },
  { id: "2", applicationNo: "LA-1792", applicantId: "2", applicantName: "Fatma Salim Rashid", loanOfficerName: "Masudi Hamfaume", requestedAmount: "TZS 2,000,000", status: "LOAN_CREATED", finalized: true, submittedOn: "May 13, 2024 02:15 PM" },
  { id: "3", applicationNo: "LA-1798", applicantId: "3", applicantName: "Haruna Juma Mwinyi", loanOfficerName: "Herman Mushi", requestedAmount: "TZS 3,500,000", status: "DRAFT", finalized: false, submittedOn: "-" },
  { id: "4", applicationNo: "LA-1804", applicantId: "4", applicantName: "Asha Hamis Suleiman", loanOfficerName: "Masudi Hamfaume", requestedAmount: "TZS 1,200,000", status: "APPROVED", finalized: true, submittedOn: "May 12, 2024 04:20 PM" },
  { id: "5", applicationNo: "LA-1811", applicantId: "5", applicantName: "Mohamed Said Ally", loanOfficerName: "Herman Mushi", requestedAmount: "TZS 4,000,000", status: "CONTRACT_SIGNED", finalized: true, submittedOn: "May 12, 2024 09:10 AM" },
]

const LoansApplicationsPage = () => {
  const navigate = useNavigate()

  const handleExport = (filteredApplications: LoanApplication[]) => {
    exportToCsv(
      filteredApplications,
      [
        { header: "Application No.", accessor: (row) => row.applicationNo },
        { header: "Applicant", accessor: (row) => row.applicantName },
        { header: "Loan Officer", accessor: (row) => row.loanOfficerName },
        { header: "Requested Amount", accessor: (row) => row.requestedAmount },
        { header: "Status", accessor: (row) => row.status },
        { header: "Submitted On", accessor: (row) => row.submittedOn },
      ],
      `loan-applications-${new Date().toISOString().slice(0, 10)}.csv`
    )
  }

  const handleNewApplication = () => {
    navigate("/loans/new-application")
  }

  const totalApplications = allLoanApplications.length
  const draftCount = allLoanApplications.filter((a) => a.status === "DRAFT").length
  const pendingApprovalCount = allLoanApplications.filter((a) => a.status === "PENDING_APPROVAL").length
  const approvedCount = allLoanApplications.filter(
    (a) => a.status === "APPROVED" || a.status === "CONTRACT_GENERATED" || a.status === "CONTRACT_SIGNED"
  ).length
  const loanCreatedCount = allLoanApplications.filter((a) => a.status === "LOAN_CREATED").length

  const summaryWidgets: SummaryWidget[] = [
    {
      key: "totalApplications",
      label: "Total Applications",
      value: String(totalApplications),
      icon: FileTextIcon,
      iconClassName: "bg-blue-50 text-blue-500",
    },
    {
      key: "drafts",
      label: "Drafts",
      value: String(draftCount),
      icon: ClockIcon,
      iconClassName: "bg-slate-50 text-slate-500",
    },
    {
      key: "pendingApproval",
      label: "Pending Approval",
      value: String(pendingApprovalCount),
      icon: ClockIcon,
      iconClassName: "bg-amber-50 text-amber-500",
    },
    {
      key: "approved",
      label: "Approved",
      value: String(approvedCount),
      icon: CheckCircle2Icon,
      iconClassName: "bg-emerald-50 text-emerald-500",
    },
    {
      key: "loanCreated",
      label: "Loans Created",
      value: String(loanCreatedCount),
      icon: BanknoteIcon,
      iconClassName: "bg-sky-50 text-sky-500",
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Loan Applications</h1>
          <p className="text-sm text-muted-foreground">View, filter, and manage all loan applications</p>
        </div>

        <Button onClick={handleNewApplication}>
          <FilePlus2Icon className="size-4" />
          New Application
        </Button>
      </div>

      <SummaryCards widgets={summaryWidgets} />

      <LoanApplicationTable
        applications={allLoanApplications}
        context="standalone"
        onContinue={(application) => navigate(`/loans/new?applicationId=${application.id}`)}
        onExport={handleExport}
      />
    </div>
  )
}

export default LoansApplicationsPage