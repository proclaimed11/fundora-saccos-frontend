import dayjs from 'dayjs'
import { Text } from '@mantine/core'
import { DashboardLayout } from '../components/layout/dashboardLayout'
import { LoansByStatus } from '../components/dashboard/loansByStatus'
import { TrendChart, type TrendPoint } from '../components/dashboard/trendChart'
import { QueueCard, type QueueRow } from '../components/dashboard/queueCard'
import { BucketChart, type Bucket } from '../components/dashboard/bucketChart'
import { StatWidget } from '../components/statsWidgets'
import { formatTzs } from '../utils/format'
import { useAppTheme } from '../theme/themeContext'
import {
  LOANS,
  SAMPLE_PAYMENTS,
  SAMPLE_PENALTIES,
  applications,
  viewOf,
} from './loans/loanApplicationsData'
import { applicants } from './applicants/applicantsData'
import { SAMPLE_ACCOUNTS } from './accounting/accountingData'

/* ---------- key numbers, built from the same sample data as their pages ---------- */

const views = LOANS.map((l) => viewOf(l, SAMPLE_PAYMENTS, SAMPLE_PENALTIES))
const openLoans = views.filter((v) => v.state !== 'CLOSED')

const totalOutstanding = openLoans.reduce((s, v) => s + v.outstanding, 0)
const atRisk = openLoans.filter((v) => v.overdueDays > 0).reduce((s, v) => s + v.outstanding, 0)
const parPercent = totalOutstanding > 0 ? (atRisk / totalOutstanding) * 100 : 0

// installments that fall due in the next 7 days
const dueThisWeek = openLoans
  .flatMap((v) => v.installments)
  .filter((s) => {
    const days = dayjs(s.dueDate).startOf('day').diff(dayjs().startOf('day'), 'day')
    return s.outstanding > 0 && days >= 0 && days <= 7
  })
  .reduce((s, i) => s + i.outstanding, 0)

const todayDate = dayjs().format('YYYY-MM-DD')
const collectedToday = SAMPLE_PAYMENTS.filter((p) => p.date === todayDate).reduce((s, p) => s + p.amount, 0)

// cash on hand plus the bank and mobile money accounts
const cashAvailable = SAMPLE_ACCOUNTS.filter((a) =>
  ['CASH', 'BANK_CRDB', 'BANK_NMB', 'MPESA'].includes(a.accountCode),
).reduce((s, a) => s + a.currentBalance, 0)

// SAMPLE ONLY: replaced by GET /api/dashboard in a later step
// here `color` is the icon color
const stats = [
  { label: 'Total Outstanding', value: formatTzs(totalOutstanding), miniLabel: 'TZS', icon: 'scale', color: '#8e44ad' },
  { label: 'Cash Available', value: formatTzs(cashAvailable), miniLabel: 'TZS', icon: 'landmark', color: '#45bdfc' },
  { label: 'Due This Week', value: formatTzs(dueThisWeek), miniLabel: 'TZS', icon: 'calendar-days', color: '#e08a1e' },
  { label: 'Collected Today', value: formatTzs(collectedToday), miniLabel: 'TZS', icon: 'banknote', color: 'var(--app-brand)' },
  { label: 'Portfolio At Risk', value: `${parPercent.toFixed(1)}%`, icon: 'triangle-alert', color: '#ef4444' },
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

// sample data from /api/reports/collections-aging
const agingBuckets: Bucket[] = [
  { label: '1-30 days', count: 1, amount: 120000, color: '#eab308' },
  { label: '31-60 days', count: 0, amount: 0, color: '#f97316' },
  { label: '61-90 days', count: 0, amount: 0, color: '#ef4444' },
  { label: '90+ days', count: 1, amount: 250000, color: '#991b1b' },
]

/* ---------- the work queues, built from the same sample data as their pages ---------- */

// our own rule, the same limits as the pages: highlight anything waiting longer than this
const LATE_APPROVAL_DAYS = 7
const LATE_KYC_DAYS = 7

const waiting = (n: number) => (n <= 0 ? 'today' : n === 1 ? '1 day' : `${n} days`)

// oldest first, so the longest wait is at the top
type Queue = { row: QueueRow; days: number }
const oldestFirst = (list: Queue[]) => [...list].sort((a, b) => b.days - a.days).map((q) => q.row)

// waiting for an approval decision
const approvalQueue: Queue[] = applications
  .filter((a) => a.status === 'CREDIT_APPROVED' || a.status === 'PENDING_APPROVAL')
  .map((a) => {
    const days = dayjs().diff(dayjs(a.submittedAt ?? a.created), 'day')
    return {
      days,
      row: {
        id: a.id,
        title: a.applicantName,
        sub: a.applicationNo,
        value: formatTzs(a.requestedAmount),
        valueSub: `Waiting ${waiting(days)}`,
        late: days > LATE_APPROVAL_DAYS,
        to: `/loan-approvals?review=${a.id}`,
      },
    }
  })

// applicants whose documents are waiting for a KYC decision
const kycQueue: Queue[] = applicants
  .filter((a) => a.status === 'PENDING_KYC')
  .map((a) => {
    const days = dayjs().diff(dayjs(a.registered), 'day')
    return {
      days,
      row: {
        id: a.id,
        title: a.name,
        sub: a.applicantNo,
        value: a.isReturning ? 'Returning' : 'New',
        valueSub: `Waiting ${waiting(days)}`,
        late: days > LATE_KYC_DAYS,
        to: `/applicants/${a.id}`,
      },
    }
  })

export function Dashboard() {
  const { surfaceColors } = useAppTheme()

  const approvalRows = oldestFirst(approvalQueue)
  const kycRows = oldestFirst(kycQueue)

  // sample data from /api/reports/npl
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
          <span className="text-sm font-bold text-brand">John Doe</span>!
        </>
      }
    >
      {/* row 1: key numbers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((s) => (
          <StatWidget key={s.label} {...s} />
        ))}
      </div>

      {/* row 2: charts on the left (2/3), queues and aging stacked on the right (1/3) */}
      <div className="mt-4 grid items-start gap-4 lg:grid-cols-3">
        {/* left column: the big chart, then two smaller charts side by side */}
        <div className="space-y-4 lg:col-span-2">
          <TrendChart data={trend} />

          <div className="grid gap-4 md:grid-cols-2">
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
          </div>
        </div>

        {/* right column: the most urgent queue, KYC, then the aging chart */}
        <div className="space-y-4">
          <QueueCard
            title="Pending Approvals"
            count={approvalRows.length}
            rows={approvalRows}
            viewAllTo="/loan-approvals"
            emptyText="Nothing is waiting for approval"
          />
          <QueueCard
            title="KYC To Review"
            count={kycRows.length}
            rows={kycRows}
            viewAllTo="/kyc-review"
            emptyText="No applicants are waiting for KYC review"
            titleHeader="Applicant"
            valueHeader="Type"
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
      </div>
    </DashboardLayout>
  )
}