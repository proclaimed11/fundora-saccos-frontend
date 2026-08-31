import { FileTextIcon } from "lucide-react"
import { Card, CardContent } from "../../components/ui/card"
import ProfileHeaderSkeleton from "../skeleton-loaders/profile-header-skeleton-loader"

export type LoanProfileHeaderData = {
  applicationNo: string
  applicantName: string
  applicantId: string
  loanType: string
  submittedOn: string
}

type LoanProfileHeaderProps =
  | { data: LoanProfileHeaderData; isLoading?: false }
  | { data?: undefined; isLoading: true }

const SummaryField = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium">{value}</p>
  </div>
)

const LoansProfileHeader = (props: LoanProfileHeaderProps) => {
  if (props.isLoading) {
    return <ProfileHeaderSkeleton leadingShape="square" leadingSize="size-9" leadingLines={2} fieldCount={3} />
  }

  const { data } = props

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 divide-y divide-border md:flex-row md:items-center md:divide-x md:divide-y-0">
          <div className="flex items-center gap-3 pb-4 md:pb-0 md:pr-6">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
              <FileTextIcon className="size-4 text-muted-foreground" />
            </div>
            <SummaryField label="Application No." value={data.applicationNo} />
          </div>

          <div className="pt-4 md:px-6 md:pt-0">
            <p className="text-xs text-muted-foreground">Applicant</p>
            <p className="text-sm font-medium">{data.applicantName}</p>
            <p className="text-xs text-muted-foreground">{data.applicantId}</p>
          </div>

          <div className="pt-4 md:px-6 md:pt-0">
            <SummaryField label="Loan Type" value={data.loanType} />
          </div>

          <div className="pt-4 md:pl-6 md:pt-0">
            <SummaryField label="Submitted On" value={data.submittedOn} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoansProfileHeader