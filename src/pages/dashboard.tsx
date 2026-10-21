import { Text } from '@mantine/core'
import { DashboardLayout } from '../components/layout/dashboardLayout'
import { PortfolioHealth } from '../components/dashboard/portfolioHealth'
import { LoansByStatus } from '../components/dashboard/loansByStatus'
import { TrendChart, type TrendPoint } from '../components/dashboard/trendChart'
import { formatTzs } from '../utils/format'
import { BucketChart, type Bucket } from '../components/dashboard/bucketChart'
import { StatWidget } from '../components/statsWidgets'
import { useAppTheme } from '../theme/themeContext'

// sample numbers, replaced by GET /api/dashboard in a later step
// here `color` is the icon color
const stats = [
  { label: 'Active Loans', value: 64, icon: 'hand-coins', color: '#45bdfc' },
  { label: 'Total Outstanding', value: formatTzs(1625000), miniLabel: 'TZS', icon: 'scale', color: '#8e44ad' },
  { label: 'Collected This Month', value: formatTzs(178525), miniLabel: 'TZS', icon: 'calendar', color: '#1eeb3a' },
  { label: 'Pending Approvals', value: 9, icon: 'square-check', color: '#0077b5' },
  { label: 'Overdue Loans', value: 7, icon: 'clock', color: '#e08a1e' },
]

// SAMPLE ONLY: no endpoint in the API doc returns this yet
const trend: TrendPoint[] = [
  { month: 'May', disbursed: 800000, collected: 120000 },
  { month: 'Jun', disbursed: 1200000, collected: 260000 },
  { month: 'Jul', disbursed: 900000, collected: 340000 },
  { month: 'Aug', disbursed: 1500000, collected: 410000 },
  { month: 'Sep', disbursed: 1100000, collected: 520000 },
  { month: 'Oct', disbursed: 1400000, collected: 178525 },
]

// sample data from /api/reports/npl
// sample data from /api/reports/collections-aging
const agingBuckets: Bucket[] = [
  { label: '1-30 days', count: 1, amount: 120000, color: '#eab308' },
  { label: '31-60 days', count: 0, amount: 0, color: '#f97316' },
  { label: '61-90 days', count: 0, amount: 0, color: '#ef4444' },
  { label: '90+ days', count: 1, amount: 250000, color: '#991b1b' },
]

export function Dashboard() {
  const { surfaceColors } = useAppTheme()
  const nplBuckets: Bucket[] = [
    { label: 'Current', count: 2, amount: 1000000, color: surfaceColors.primary },
    { label: 'Watch', count: 0, amount: 0, color: '#eab308' },
    { label: 'Substandard', count: 0, amount: 0, color: '#f97316' },
    { label: 'Doubtful', count: 1, amount: 250000, color: '#ef4444' },
    { label: 'Loss', count: 0, amount: 0, color: '#991b1b' },
  ]
  return (
    <DashboardLayout
      title="Dashboard"
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Dashboard' }]}
      subtitle={
        <>
          Welcome Back{'  '}
          <span className="text-sm font-bold" style={{ color: '#ffffff' }}>John Doe</span>!
        </>
      }
    >
      {/* row 1: key numbers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((s) => (
          <StatWidget key={s.label} {...s} />
        ))}
      </div>

      {/* row 2: trend (2/3) + portfolio health (1/3) */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <TrendChart data={trend} />
        <PortfolioHealth nplRatio={15.38} parRatio={18.46} efficiency={16.67} writtenOff={892629.05} />
      </div>

      {/* row 3: three charts */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <LoansByStatus data={{ ACTIVE: 3, CLOSED: 1, WRITTEN_OFF: 1 }} />
        <BucketChart
          title="NPL Classification"
          buckets={nplBuckets}
          footer={
            <>
              <Text size="sm" c="dimmed">NPL ratio</Text>
              <Text size="sm" fw={600}>20.0%</Text>
            </>
          }
        />
        <BucketChart
          title="Collections Aging"
          buckets={agingBuckets}
          footer={
            <>
              <Text size="sm" c="dimmed">Total overdue</Text>
              <Text size="sm" fw={600}>{formatTzs(370000)}</Text>
            </>
          }
        />
      </div>
    </DashboardLayout>
  )
}