import { useLocation, useNavigate, useParams } from "react-router-dom"
import { FileTextIcon, ClipboardListIcon, BanknoteIcon, MessageSquareIcon, ShieldCheckIcon } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"

const tabItems = [
  { value: "applicant-details", label: "Applicant Details", icon: FileTextIcon },
  { value: "registration-status", label: "Registration Status", icon: ClipboardListIcon },
  { value: "loan-applications", label: "Loan Applications", icon: BanknoteIcon },
  { value: "communications", label: "Communications", icon: MessageSquareIcon },
  { value: "audit-trail", label: "Audit Trail", icon: ShieldCheckIcon },
]

const ApplicantProfileTabs = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { applicantId } = useParams<{ applicantId: string }>()

  const activeTab = tabItems.find((tab) => location.pathname.endsWith(tab.value))?.value ?? "overview"

  return (
    <Tabs value={activeTab} onValueChange={(value) => navigate(`/applicants/${applicantId}/${value}`)}>
      <TabsList variant="line">
        {tabItems.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="text-muted-foreground data-active:bg-transparent data-active:text-primary after:bg-primary"
          >
            <tab.icon className="size-4" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export default ApplicantProfileTabs