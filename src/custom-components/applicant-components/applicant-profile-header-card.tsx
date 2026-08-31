import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import ProfileHeaderSkeleton from "../skeleton-loaders/profile-header-skeleton-loader"

export type ApplicantProfileHeaderData = {
  fullName: string
  applicantTag: string
  phone: string
  email: string
  addressLine1: string
  addressLine2: string
  applicantId: string
  nationality: string
}

type ApplicantProfileHeaderProps =
  | { data: ApplicantProfileHeaderData; isLoading?: false }
  | { data?: undefined; isLoading: true }

const getInitials = (fullName: string) =>
  fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

const SummaryField = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium">{value}</p>
  </div>
)

const ApplicantProfileHeader = (props: ApplicantProfileHeaderProps) => {
  if (props.isLoading) {
    return (
      <ProfileHeaderSkeleton leadingShape="circle" leadingSize="size-14" leadingLines={1} showLeadingBadge fieldCount={4}/>
    )
  }

  const { data } = props

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 divide-y divide-border md:flex-row md:items-center md:divide-x md:divide-y-0">
          <div className="flex items-center gap-4 pb-4 md:pb-0 md:pr-6">
            <Avatar className="size-14">
              <AvatarFallback className="bg-muted text-sm font-semibold">
                {getInitials(data.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <h1 className="text-lg font-semibold">{data.fullName}</h1>
              <Badge
                className="w-fit bg-emerald-100 font-medium text-emerald-700 hover:bg-emerald-100"
                variant="secondary"
              >
                {data.applicantTag}
              </Badge>
            </div>
          </div>

          <div className="pt-4 md:px-6 md:pt-0">
            <SummaryField label="Applicant ID" value={data.applicantId} />
          </div>

          <div className="pt-4 md:px-6 md:pt-0">
            <SummaryField label="Phone Number" value={data.phone} />
          </div>

          <div className="pt-4 md:px-6 md:pt-0">
            <SummaryField label="Email Address" value={data.email} />
          </div>

          <div className="pt-4 md:pl-6 md:pt-0">
            <SummaryField label="Nationality" value={data.nationality} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ApplicantProfileHeader