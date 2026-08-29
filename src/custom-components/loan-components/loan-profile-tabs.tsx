import { useLocation, useNavigate, useParams } from "react-router-dom"
import { FileTextIcon, HistoryIcon, UsersIcon, FilePlusCornerIcon, UserRoundCheckIcon, ListCheckIcon } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"

const tabItems = [
  { value: "loan-details", label: "Loan Details", icon: FileTextIcon },
  { value: "loan-application-status", label: "Application Status", icon: ListCheckIcon},
  { value: "approvals-status", label: "Approvals Status", icon: UserRoundCheckIcon },
  { value: "contracts-documents", label: "Documents & Contracts", icon: FilePlusCornerIcon },
  { value: "guarantors", label: "Guarantors", icon: UsersIcon },
  { value: "repayment-history", label: "Repayment History", icon: HistoryIcon },
]

const LoanProfileTabs = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { applicantId, loanId } = useParams<{ applicantId: string; loanId: string }>()

  const activeTab = tabItems.find((tab) => location.pathname.endsWith(tab.value))?.value ?? "loan-details"

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => navigate(`/applicants/${applicantId}/loan-applications/${loanId}/${value}`)}
    >
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

export default LoanProfileTabs