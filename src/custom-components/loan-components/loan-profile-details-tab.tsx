import { useEffect, useState } from "react"
import { UserIcon, FileTextIcon, WalletIcon, ShieldCheckIcon } from "lucide-react"
import SectionCard from "../section-card"
import { Badge } from "../../components/ui/badge"
import SectionCardSkeleton from "../skeleton-loaders/skeleton-summary-loader"
import { Skeleton } from "@/components/ui/skeleton"

type ApplicantInformation = {
  applicantNo: string
  fullName: string
  phone: string
  email: string
  addressLine1: string
  addressLine2: string
  kycStatus: string
  kycStatusDate: string
  nationality: string
  occupation: string
}

type LoanTerms = {
  requestedAmount: string
  interestMethod: string
  interestRate: string
  tenure: string
  penaltyRate: string
  guarantorRequired: string
  collateralRequired: string
  applicationFee: string
}

type FinancialSummary = {
  requestedAmount: string
  approvedAmount: string
  disbursedAmount: string
  interestAmount: string
  totalRepayable: string
  outstandingBalance: string
  nextDueDate: string
  nextRepaymentAmount: string
}

type CreditAssessment = {
  decision: string
  monthlyIncome: string
  monthlyExpenses: string
  cashFlow: string
  hasPendingPayments: string
  assessedBy: string
  assessedOn: string
  notes: string
}

type LoanOverviewData = {
  applicantInformation: ApplicantInformation
  loanTerms: LoanTerms
  financialSummary: FinancialSummary
  creditAssessment: CreditAssessment
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

const InfoFieldSkeleton = () => (
  <div className="flex items-center justify-between gap-4">
    <Skeleton className="h-3.5 w-24" />
    <Skeleton className="h-3.5 w-32" />
  </div>
)

const LoanOverviewTab = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<LoanOverviewData | null>(null)

  useEffect(() => {
    setIsLoading(true)
    // Replace with your real fetch, e.g. fetch(`/api/loan-origination/applications/${applicationId}/workflow`)
    const timer = setTimeout(() => {
      setData({
        applicantInformation: {
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
        },
        loanTerms: {
          requestedAmount: "TZS 1,250,000",
          interestMethod: "Reducing Balance",
          interestRate: "18% p.a.",
          tenure: "12 Months",
          penaltyRate: "2%",
          guarantorRequired: "Yes",
          collateralRequired: "No",
          applicationFee: "TZS 25,000",
        },
        financialSummary: {
          requestedAmount: "TZS 1,250,000",
          approvedAmount: "TZS 1,250,000",
          disbursedAmount: "TZS 1,250,000",
          interestAmount: "TZS 217,154.86",
          totalRepayable: "TZS 1,467,154.86",
          outstandingBalance: "TZS 1,250,000",
          nextDueDate: "May 25, 2024",
          nextRepaymentAmount: "TZS 178,525.81",
        },
        creditAssessment: {
          decision: "APPROVE",
          monthlyIncome: "TZS 2,500,000",
          monthlyExpenses: "TZS 800,000",
          cashFlow: "TZS 1,700,000",
          hasPendingPayments: "No",
          assessedBy: "Grace Kileo",
          assessedOn: "May 12, 2024",
          notes: "Stable income, consistent repayment history on existing loans.",
        },
      })
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SectionCardSkeleton variant="custom" titleWidth="w-36">
          <div className="flex flex-col gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <InfoFieldSkeleton key={i} />
            ))}
          </div>
        </SectionCardSkeleton>

        <SectionCardSkeleton variant="text" rows={8} titleWidth="w-24" />

        <SectionCardSkeleton variant="custom" titleWidth="w-36">
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <InfoFieldSkeleton key={i} />
            ))}
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3.5 w-full" />
            </div>
          </div>
        </SectionCardSkeleton>

        <SectionCardSkeleton variant="text" rows={8} titleWidth="w-32" />
      </div>
    )
  }

  const { applicantInformation, loanTerms, financialSummary, creditAssessment } = data

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