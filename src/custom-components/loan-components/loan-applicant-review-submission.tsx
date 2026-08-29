import { ShieldCheckIcon, SparkleIcon, UserIcon, FileTextIcon, HashIcon, CalendarCheckIcon, UserCheckIcon, ClockIcon, CheckCircle2Icon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"

const kycSummaryRows = [
  { label: "Applicant Name", value: "Juma Ali Said", icon: UserIcon },
  { label: "Application ID", value: "APP-2024-005678", icon: FileTextIcon },
  { label: "KYC Reference No.", value: "KYC-2024-005678", icon: HashIcon },
  { label: "Verified On", value: "May 14, 2024 10:25 AM", icon: CalendarCheckIcon },
  { label: "Verified By", value: "Amina Mohamed (Admin)", icon: UserCheckIcon },
  { label: "KYC Expiry Date", value: "May 14, 2025", icon: ClockIcon },
]

const checksCompleted = [
  "Personal Details",
  "ID & Documents",
  "NIDA / TIN Verification",
  "OTP Verification",
  "Watchlist Screening",
]

const KycSuccessBadge = () => {
  return (
    <div className="relative flex size-28 items-center justify-center">
      {/* Soft radial glow behind the badge */}
      <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl" />

      {/* Main badge */}
      <div className="relative flex size-20 items-center justify-center rounded-full bg-emerald-500/15">
        <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white">
          <ShieldCheckIcon className="size-7" />
        </div>
      </div>

      {/* Decorative sparkles */}
      <SparkleIcon className="absolute -top-1 right-2 size-4 text-emerald-500/60" />
      <SparkleIcon className="absolute bottom-2 -left-2 size-3 text-emerald-500/40" />
      <SparkleIcon className="absolute top-6 -right-4 size-2.5 text-emerald-500/50" />
    </div>
  )
}

const LoanReviewSubmissionCard = () => {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <KycSuccessBadge />
          <h2 className="text-lg font-semibold">Application Completed Successful!</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            The application has been verified and all required checks have been completed successfully.
          </p>
          <Badge className="bg-emerald-100 font-medium text-emerald-700 hover:bg-emerald-100" variant="secondary">
            Application Status: COMPLETED
          </Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Application Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {kycSummaryRows.map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <row.icon className="size-4 shrink-0 text-muted-foreground" />
                <p className="flex-1 text-sm text-muted-foreground">{row.label}</p>
                <p className="text-sm font-medium">{row.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Checks Completed</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {checksCompleted.map((check) => (
              <div key={check} className="flex items-center gap-3">
                <CheckCircle2Icon className="size-4 shrink-0 text-emerald-600" />
                <p className="flex-1 text-sm text-muted-foreground">{check}</p>
                <Badge className="bg-emerald-100 font-medium text-emerald-700 hover:bg-emerald-100" variant="secondary">
                  Passed
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LoanReviewSubmissionCard