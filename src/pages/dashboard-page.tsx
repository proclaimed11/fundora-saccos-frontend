import {
  WalletIcon,
  UsersIcon,
  CalendarClockIcon,
  AlertTriangleIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "../../src/components/ui/card"
import { cn } from "../../src/lib/utils"
import DashboardGreeting from "@/custom-components/dashboard-components/dashboard-datepicker"
import PortfolioOverviewChart from "@/custom-components/graph-charts/portfolio-overview-line-chart"
import LoanStatusChart from "@/custom-components/graph-charts/loans-status-chart"
import PortfolioSummaryCard from "@/custom-components/dashboard-components/portfolio-summary-card"
import RecentLoanApplicationsTable from "@/custom-components/dashboard-components/recent-loans-table"
import RepaymentDueTodayTable from "@/custom-components/dashboard-components/repayment-due"
import AlertsNotificationsCard from "@/custom-components/dashboard-components/alert-notifications"
import TasksCard from "@/custom-components/dashboard-components/tasks"

type StatCardProps = {
  label: string
  value: string
  icon: LucideIcon
  iconClassName: string
}

const StatCard = ({ label, value, icon: Icon, iconClassName }: StatCardProps) => {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex items-center gap-3 px-4 py-3">
        <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", iconClassName)}>
          <Icon className="size-4" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-lg font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

const statCards: StatCardProps[] = [
  {
    label: "Total Loan Portfolio",
    value: "TZS 2,450,000,000",
    icon: WalletIcon,
    iconClassName: "bg-emerald-500 text-white",
  },
  {
    label: "Active Loans",
    value: "1,248",
    icon: UsersIcon,
    iconClassName: "bg-blue-500 text-white",
  },
  {
    label: "Total Outstanding",
    value: "TZS 1,680,000,000",
    icon: CalendarClockIcon,
    iconClassName: "bg-orange-500 text-white",
  },
  {
    label: "NPL (30+ Days)",
    value: "TZS 98,750,000",
    icon: AlertTriangleIcon,
    iconClassName: "bg-red-500 text-white",
  },
]

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <DashboardGreeting />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PortfolioOverviewChart />
        <LoanStatusChart />
      </div>

      {/* Tables row + right sidebar begin together from here */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <RecentLoanApplicationsTable />
          <RepaymentDueTodayTable />
        </div>

        <div className="flex flex-col gap-4">
          <PortfolioSummaryCard />
          <AlertsNotificationsCard />
          <TasksCard />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage