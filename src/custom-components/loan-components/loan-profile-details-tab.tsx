import { UserIcon, FileTextIcon, WalletIcon, ShieldCheckIcon } from "lucide-react"
import SectionCard from "../section-card"
import { Badge } from "../../components/ui/badge"

const applicantInformation = {
  applicantNo: "APP-1786436767272",
  fullName: "Juma Ali Said",
  phone: "+255 712 345 678",
  email: "juma.said@example.com",
  addressLine1: "Mikocheni, Biafra Road,",
  addressLine2: "House No. 123, Dar es Salaam, Tanzania",
  kycStatus: "Approved",
  kycStatusDate: "May 09, 2024",
  nationality: "Tanzanian",
  occupation: "Businessman",
}

const loanTerms = {
  requestedAmount: "TZS 1,250,000",
  interestMethod: "Reducing Balance",
  interestRate: "18% p.a.",
  tenure: "12 Months",
  penaltyRate: "2%",
  guarantorRequired: "Yes",
  collateralRequired: "No",
  applicationFee: "TZS 25,000",
}

const financialSummary = {
  requestedAmount: "TZS 1,250,000",
  approvedAmount: "TZS 1,250,000",
  disbursedAmount: "TZS 1,250,000",
  interestAmount: "TZS 217,154.86",
  totalRepayable: "TZS 1,467,154.86",
  outstandingBalance: "TZS 1,250,000",
  nextDueDate: "May 25, 2024",
  nextRepaymentAmount: "TZS 178,525.81",
}

const creditAssessment = {
  decision: "APPROVE",
  monthlyIncome: "TZS 2,500,000",
  monthlyExpenses: "TZS 800,000",
  cashFlow: "TZS 1,700,000",
  hasPendingPayments: "No",
  assessedBy: "Grace Kileo",
  assessedOn: "May 12, 2024",
  notes: "Stable income, consistent repayment history on existing loans.",
}

const decisionBadgeStyles: Record<string, string> = {
  APPROVE: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  REJECT: "bg-red-100 text-red-700 hover:bg-red-100",
}

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-sm font-medium">{value}</p>
  </div>
)

const LoanOverviewTab = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SectionCard icon={UserIcon} title="Applicant Information">
        <div className="flex flex-col gap-3">
          <InfoField label="Applicant No." value={applicantInformation.applicantNo} />
          <InfoField label="Name" value={applicantInformation.fullName} />
          <InfoField label="Phone" value={applicantInformation.phone} />
          <InfoField label="Email" value={applicantInformation.email} />
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="text-right text-sm font-medium">
              {applicantInformation.addressLine1}
              <br />
              {applicantInformation.addressLine2}
            </p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">KYC Status</p>
            <div className="flex items-center gap-2">
              <Badge
                className="bg-emerald-100 font-medium text-emerald-700 hover:bg-emerald-100"
                variant="secondary"
              >
                {applicantInformation.kycStatus}
              </Badge>
              <span className="text-xs text-muted-foreground">{applicantInformation.kycStatusDate}</span>
            </div>
          </div>
          <InfoField label="Nationality" value={applicantInformation.nationality} />
          <InfoField label="Occupation" value={applicantInformation.occupation} />
        </div>
      </SectionCard>

      <SectionCard icon={FileTextIcon} title="Loan Terms">
        <div className="flex flex-col gap-3">
          <InfoField label="Requested Amount" value={loanTerms.requestedAmount} />
          <InfoField label="Interest Method" value={loanTerms.interestMethod} />
          <InfoField label="Interest Rate" value={loanTerms.interestRate} />
          <InfoField label="Tenure" value={loanTerms.tenure} />
          <InfoField label="Penalty Rate" value={loanTerms.penaltyRate} />
          <InfoField label="Guarantor Required" value={loanTerms.guarantorRequired} />
          <InfoField label="Collateral Required" value={loanTerms.collateralRequired} />
          <InfoField label="Application Fee" value={loanTerms.applicationFee} />
        </div>
      </SectionCard>

      <SectionCard icon={ShieldCheckIcon} title="Credit Assessment">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Decision</p>
            <Badge className={decisionBadgeStyles[creditAssessment.decision]} variant="secondary">
              {creditAssessment.decision}
            </Badge>
          </div>
          <InfoField label="Monthly Income" value={creditAssessment.monthlyIncome} />
          <InfoField label="Monthly Expenses" value={creditAssessment.monthlyExpenses} />
          <InfoField label="Cash Flow" value={creditAssessment.cashFlow} />
          <InfoField label="Pending Payments" value={creditAssessment.hasPendingPayments} />
          <InfoField label="Assessed By" value={creditAssessment.assessedBy} />
          <InfoField label="Assessed On" value={creditAssessment.assessedOn} />
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Notes</p>
            <p className="text-sm font-medium">{creditAssessment.notes}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={WalletIcon} title="Financial Summary">
        <div className="flex flex-col gap-3">
          <InfoField label="Requested Amount" value={financialSummary.requestedAmount} />
          <InfoField label="Approved Amount" value={financialSummary.approvedAmount} />
          <InfoField label="Disbursed Amount" value={financialSummary.disbursedAmount} />
          <InfoField label="Interest Amount" value={financialSummary.interestAmount} />
          <InfoField label="Total Repayable" value={financialSummary.totalRepayable} />
          <InfoField label="Outstanding Balance" value={financialSummary.outstandingBalance} />
          <InfoField label="Next Due Date" value={financialSummary.nextDueDate} />
          <InfoField label="Next Repayment Amount" value={financialSummary.nextRepaymentAmount} />
        </div>
      </SectionCard>
    </div>
  )
}

export default LoanOverviewTab