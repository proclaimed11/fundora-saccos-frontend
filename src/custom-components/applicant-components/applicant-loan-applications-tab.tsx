import SummaryStatusCard from "../summary-status-card"
import type { FlatSummaryWidget } from "../flat-summary-card"
import LoanApplicationsTable from "./applicant-loan-applications-table"

const ApplicantLoanApplicationsTab = () => {
  const handleNewLoan = () => {
    // Open a new loan application dialog here
  }

  const statusData = {
    allApplications: 6,
    pending: 1,
    approved: 3,
    rejected: 1,
    withdrawn: 0,
  }

  const statusWidgets: FlatSummaryWidget[] = [
    { key: "allApplications", label: "All Applications", value: String(statusData.allApplications) },
    { key: "pending", label: "Pending", value: String(statusData.pending) },
    { key: "approved", label: "Approved", value: String(statusData.approved) },
    { key: "rejected", label: "Rejected", value: String(statusData.rejected) },
    { key: "withdrawn", label: "Withdrawn", value: String(statusData.withdrawn) },
  ]

  return (
    <div className="flex flex-col gap-4">
      <SummaryStatusCard title="Loan Applications" widgets={statusWidgets} />

      <LoanApplicationsTable
        onSendMessage={handleNewLoan}
        applications={[
          {
            id: "1",
            loanId: "LN-000241",
            loanType: "Personal Loan",
            loanTypeValue: "personal_loan",
            amount: "TZS 1,250,000",
            status: "Active",
            appliedOn: "May 10, 2024",
            isoAppliedOn: "2024-05-10",
            decisionDate: "May 14, 2024",
            disbursedAmount: "TZS 1,250,000",
          },
          {
            id: "2",
            loanId: "LN-000317",
            loanType: "Business Loan",
            loanTypeValue: "business_loan",
            amount: "TZS 1,700,000",
            status: "Active",
            appliedOn: "Oct 01, 2024",
            isoAppliedOn: "2024-10-01",
            decisionDate: "Oct 10, 2024",
            disbursedAmount: "TZS 1,700,000",
          },
          {
            id: "3",
            loanId: "LN-000389",
            loanType: "Emergency Loan",
            loanTypeValue: "emergency_loan",
            amount: "TZS 500,000",
            status: "Approved",
            appliedOn: "Jan 28, 2025",
            isoAppliedOn: "2025-01-28",
            decisionDate: "Feb 01, 2025",
            disbursedAmount: "TZS 500,000",
          },
          {
            id: "4",
            loanId: "LN-000412",
            loanType: "Personal Loan",
            loanTypeValue: "personal_loan",
            amount: "TZS 750,000",
            status: "Pending",
            appliedOn: "May 15, 2025",
            isoAppliedOn: "2025-05-15",
            decisionDate: "",
            disbursedAmount: "TZS 0",
          },
          {
            id: "5",
            loanId: "LN-000418",
            loanType: "Business Loan",
            loanTypeValue: "business_loan",
            amount: "TZS 1,000,000",
            status: "Rejected",
            appliedOn: "May 02, 2025",
            isoAppliedOn: "2025-05-02",
            decisionDate: "May 05, 2025",
            disbursedAmount: "TZS 0",
          },
        ]}
      />
    </div>
  )
}

export default ApplicantLoanApplicationsTab