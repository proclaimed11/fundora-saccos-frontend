import ApplicantsTable, { type Applicant } from "@/custom-components/applicant-components/all-applicants-table"
import SummaryCards, { type SummaryWidget } from "@/custom-components/summary-cards"
import { exportToCsv } from "@/lib/export-csv"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  UserPlusIcon,
  UsersIcon,
  BadgeCheckIcon,
  ClockIcon,
  UserRoundPlusIcon,
} from "lucide-react"

const allApplicants: Applicant[] = [
  { id: "APP-2024-005678", fullName: "Juma Ali Said", phone: "+255 712 345 678", email: "juma.said@example.com", kycStatus: "Verified", registrationStatus: "Completed", registeredOn: "May 14, 2024 10:25 AM" },
  { id: "APP-2024-005677", fullName: "Fatma Salim Rashid", phone: "+255 713 987 654", email: "fatma.rashid@example.com", kycStatus: "Verified", registrationStatus: "Completed", registeredOn: "May 13, 2024 02:15 PM" },
  { id: "APP-2024-005676", fullName: "Haruna Juma Mwinyi", phone: "+255 754 321 987", email: "haruna.mwinyi@example.com", kycStatus: "Pending", registrationStatus: "Continue Registration", registeredOn: "May 13, 2024 11:40 AM" },
  { id: "APP-2024-005675", fullName: "Asha Hamis Suleiman", phone: "+255 746 654 321", email: "asha.suleiman@example.com", kycStatus: "Verified", registrationStatus: "Completed", registeredOn: "May 12, 2024 04:20 PM" },
  { id: "APP-2024-005674", fullName: "Mohamed Said Ally", phone: "+255 622 111 222", email: "mohamed.ally@example.com", kycStatus: "Verified", registrationStatus: "Completed", registeredOn: "May 12, 2024 09:10 AM" },
]

const AllApplicantsPage = () => {
  const navigate = useNavigate()

  const handleExport = (filteredApplicants: Applicant[]) => {
    exportToCsv(
      filteredApplicants,
      [
        { header: "Applicant ID", accessor: (row) => row.id },
        { header: "Full Name", accessor: (row) => row.fullName },
        { header: "Phone Number", accessor: (row) => row.phone },
        { header: "Email Address", accessor: (row) => row.email },
        { header: "KYC Status", accessor: (row) => row.kycStatus },
        { header: "Registration", accessor: (row) => row.registrationStatus },
        { header: "Registered On", accessor: (row) => row.registeredOn },
      ],
      `applicants-${new Date().toISOString().slice(0, 10)}.csv`
    )
  }

  const handleNewApplicant = () => {
    navigate("/applicants/onboarding")
  }

  const totalApplicants = allApplicants.length
  const verifiedCount = allApplicants.filter((a) => a.kycStatus === "Verified").length
  const pendingCount = allApplicants.filter((a) => a.kycStatus === "Pending").length
  const continueRegistrationCount = allApplicants.filter(
    (a) => a.registrationStatus === "Continue Registration"
  ).length

const summaryWidgets: SummaryWidget[] = [
  {
    key: "totalApplicants",
    label: "Total Applicants",
    value: String(totalApplicants),
    icon: UsersIcon,
    iconClassName: "bg-blue-500",
  },
  {
    key: "verified",
    label: "KYC Verified",
    value: String(verifiedCount),
    icon: BadgeCheckIcon,
    iconClassName: "bg-emerald-500",
  },
  {
    key: "pending",
    label: "KYC Pending",
    value: String(pendingCount),
    icon: ClockIcon,
    iconClassName: "bg-red-400",
  },
  {
    key: "continueRegistration",
    label: "Continue Registration",
    value: String(continueRegistrationCount),
    icon: UserRoundPlusIcon,
    iconClassName: "bg-sky-400",
  },
]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">All Applicants</h1>
          <p className="text-sm text-muted-foreground">View and search all registered applicants</p>
        </div>

        <Button onClick={handleNewApplicant}>
          <UserPlusIcon className="size-4" />
          New Applicant
        </Button>
      </div>

      <SummaryCards widgets={summaryWidgets} />

      <ApplicantsTable
        applicants={allApplicants}
        onViewProfile={(applicant) => navigate(`/applicants/${applicant.id}`)}
        onExport={handleExport}
      />
    </div>
  )
}

export default AllApplicantsPage