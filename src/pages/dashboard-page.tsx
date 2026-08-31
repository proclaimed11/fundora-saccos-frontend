import { useEffect, useState } from "react"
import {
  WalletIcon,
  UsersIcon,
  CalendarClockIcon,
  AlertTriangleIcon,
} from "lucide-react"
import DashboardGreeting from "@/custom-components/dashboard-components/dashboard-datepicker"
import DashboardStatsWidgets, {
  type StatCardProps,
} from "@/custom-components/dashboard-components/dashboard-stats-widgets"
import DashboardStatsWidgetsSkeleton from "@/custom-components/skeleton-loaders/dashboard-widgets-skeleton"
import PortfolioOverviewChart from "@/custom-components/graph-charts/portfolio-overview-line-chart"
import LoanStatusChart from "@/custom-components/graph-charts/loans-status-chart"
import PortfolioSummaryCard from "@/custom-components/dashboard-components/portfolio-summary-card"
import RecentLoanApplicationsTable from "@/custom-components/dashboard-components/recent-loans-table"
import RepaymentDueTodayTable from "@/custom-components/dashboard-components/repayment-due"
import AlertsNotificationsCard from "@/custom-components/dashboard-components/alert-notifications"
import TasksCard from "@/custom-components/dashboard-components/tasks"

// Static shell (label + icon) known upfront — only the values are fetched.
const statShell = [
  { label: "Total Loan Portfolio", icon: WalletIcon, iconClassName: "bg-emerald-500 text-white" },
  { label: "Active Loans", icon: UsersIcon, iconClassName: "bg-blue-500 text-white" },
  { label: "Total Outstanding", icon: CalendarClockIcon, iconClassName: "bg-orange-500 text-white" },
  { label: "NPL (30+ Days)", icon: AlertTriangleIcon, iconClassName: "bg-red-500 text-white" },
]

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [statCards, setStatCards] = useState<StatCardProps[] | null>(null)

  useEffect(() => {
    setIsLoading(true)
    // Replace with your real fetch, e.g. fetch(`/api/dashboard`)
    const timer = setTimeout(() => {
      const values = [
        "TZS 2,450,000,000",
        "1,248",
        "TZS 1,680,000,000",
        "TZS 98,750,000",
      ]
      setStatCards(statShell.map((shell, i) => ({ ...shell, value: values[i] })))
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <DashboardGreeting />

      {isLoading || !statCards ? (
        <DashboardStatsWidgetsSkeleton stats={statShell} />
      ) : (
        <DashboardStatsWidgets stats={statCards} />
      )}

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