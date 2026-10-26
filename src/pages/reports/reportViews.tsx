import { AppIcon } from '../../components/appIcon'
import { Badge, Button, Progress, Text } from '@mantine/core'
import { CustomTable, type CustomTableColumn } from '../../components/customTable/customTable'
import { BucketChart, type Bucket } from '../../components/dashboard/bucketChart'
import { LoansByStatus } from '../../components/dashboard/loansByStatus'
import { PortfolioHealth } from '../../components/dashboard/portfolioHealth'
import { formatTzs } from '../../utils/format'
import { NPL_STYLE } from '../loans/loanApplicationsData'
import { ACCOUNT_TYPE, type TrialBalanceRow } from '../accounting/accountingData'
import type {
  AgingReport,
  EfficiencyReport,
  NplReport,
  PortfolioSummary,
  TrialBalanceReport,
} from './reportsData'

type Go = { go: (path: string) => void }

/* ---------- small pieces ---------- */

function Tile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-md bg-gray-50 px-4 py-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-medium text-gray-800">{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-gray-400">{hint}</div>}
    </div>
  )
}

function Field({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`text-right ${strong ? 'font-semibold' : 'font-medium'} text-gray-800`}>{value}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text size="sm" fw={600} mb={4}>
      {children}
    </Text>
  )
}

const pct = (n: number) => `${n.toFixed(1)}%`
const share = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0)

// the chart needs hex colors, these match the badge colors of NPL_STYLE
const CLASS_HEX = {
  CURRENT: '#40c057',
  WATCH: '#fab005',
  SUBSTANDARD: '#fd7e14',
  DOUBTFUL: '#fa5252',
  LOSS: '#343a40',
} as const

const AGING_HEX = ['#fab005', '#fd7e14', '#fa5252', '#343a40']

/* ---------- 1. portfolio summary ---------- */

export function PortfolioView({ data: p, go }: { data: PortfolioSummary } & Go) {
  const a = p.activity

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Tile label="Total loans" value={p.totalLoans} hint={`${p.activeLoanCount} active · ${p.closedLoanCount} closed · ${p.writtenOffLoanCount} written off`} />
        <Tile label="Principal disbursed" value={formatTzs(p.totalPrincipalDisbursed)} hint="All loans up to the end date" />
        <Tile label="Total outstanding" value={formatTzs(p.totalOutstanding)} hint="Active loans only" />
        <Tile label="NPL ratio" value={pct(p.nplRatioPercent)} hint={`${p.nplLoanCount} NPL ${p.nplLoanCount === 1 ? 'loan' : 'loans'} · ${formatTzs(p.nplOutstandingAmount)}`} />
        <Tile label="Portfolio at risk" value={pct(p.portfolioAtRiskRatioPercent)} hint={`${formatTzs(p.portfolioAtRiskAmount)} on overdue loans`} />
        <Tile label="Total written off" value={formatTzs(p.totalWrittenOffAmount)} />
      </div>

      <div>
        <SectionTitle>Activity in the period</SectionTitle>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Tile label="Disbursed" value={formatTzs(a.disbursedAmount)} hint={`${a.disbursedCount} ${a.disbursedCount === 1 ? 'loan' : 'loans'}`} />
          <Tile label="Collected" value={formatTzs(a.collectedAmount)} hint={`${a.collectedCount} ${a.collectedCount === 1 ? 'payment' : 'payments'}`} />
          <Tile label="Written off" value={formatTzs(a.writtenOffAmount)} hint={`${a.writtenOffCount} ${a.writtenOffCount === 1 ? 'loan' : 'loans'}`} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LoansByStatus data={p.loansByStatus} />
        <PortfolioHealth
          nplRatio={p.nplRatioPercent}
          parRatio={p.portfolioAtRiskRatioPercent}
          efficiency={p.efficiencyPercent}
          writtenOff={p.totalWrittenOffAmount}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <SectionTitle>What is still owed</SectionTitle>
          <Field label="Principal" value={formatTzs(p.totalOutstandingPrincipal)} />
          <Field label="Interest" value={formatTzs(p.totalOutstandingInterest)} />
          <Field label="Penalty" value={formatTzs(p.totalOutstandingPenalty)} />
          <Field label="Total" value={formatTzs(p.totalOutstanding)} strong />
        </div>
        <div>
          <SectionTitle>Where to look next</SectionTitle>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="xs" variant="default" leftSection={<AppIcon name="hand-coins" />} onClick={() => go('/loans')}>
              Loans
            </Button>
            <Button size="xs" variant="default" leftSection={<AppIcon name="triangle-alert" />} onClick={() => go('/npl')}>
              NPL &amp; write-offs
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- 2. NPL classification ---------- */

export function NplView({ data: r, go }: { data: NplReport } & Go) {
  const buckets: Bucket[] = r.buckets.map((b) => ({
    label: NPL_STYLE[b.classification].label,
    count: b.loanCount,
    amount: b.outstandingAmount,
    color: CLASS_HEX[b.classification],
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Active loans" value={r.totalLoanCount} />
        <Tile label="Total outstanding" value={formatTzs(r.totalOutstandingAmount)} />
        <Tile label="NPL loans" value={r.nplLoanCount} hint="90 or more days overdue" />
        <Tile label="NPL ratio" value={pct(r.nplRatioPercent)} hint={formatTzs(r.nplOutstandingAmount)} />
      </div>

      <BucketChart
        title="Outstanding by class"
        buckets={buckets}
        footer={
          <>
            <span className="text-xs text-gray-500">Total outstanding</span>
            <span className="text-sm font-semibold text-gray-800">{formatTzs(r.totalOutstandingAmount)}</span>
          </>
        }
      />

      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="bg-gray-50 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-3 py-2">Class</th>
              <th className="px-3 py-2 text-right">Loans</th>
              <th className="px-3 py-2 text-right">Outstanding</th>
              <th className="px-3 py-2 text-right">Share</th>
            </tr>
          </thead>
          <tbody>
            {r.buckets.map((b) => (
              <tr key={b.classification} className="border-t border-gray-100">
                <td className="px-3 py-2.5">
                  <Badge variant="outline" color={NPL_STYLE[b.classification].color} radius="sm" size="sm">
                    {NPL_STYLE[b.classification].label}
                  </Badge>
                </td>
                <td className="px-3 py-2.5 text-right text-gray-800">{b.loanCount}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right font-medium text-gray-800">{formatTzs(b.outstandingAmount)}</td>
                <td className="px-3 py-2.5 text-right text-gray-600">{pct(share(b.outstandingAmount, r.totalOutstandingAmount))}</td>
              </tr>
            ))}
            <tr className="border-t border-gray-200 bg-gray-50 font-medium text-gray-800">
              <td className="px-3 py-2.5">Total</td>
              <td className="px-3 py-2.5 text-right">{r.totalLoanCount}</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right">{formatTzs(r.totalOutstandingAmount)}</td>
              <td className="px-3 py-2.5 text-right">{r.totalLoanCount > 0 ? '100.0%' : '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Button size="xs" variant="default" leftSection={<AppIcon name="triangle-alert" />} onClick={() => go('/npl')}>
        Open NPL &amp; write-offs
      </Button>
    </div>
  )
}

/* ---------- 3. collections aging ---------- */

export function AgingView({ data: r, go }: { data: AgingReport } & Go) {
  const oldest = Math.max(0, ...r.buckets.flatMap((b) => b.loans.map((l) => l.overdueDays)))
  const buckets: Bucket[] = r.buckets.map((b, i) => ({
    label: b.bucketLabel,
    count: b.loanCount,
    amount: b.outstandingAmount,
    color: AGING_HEX[i],
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Tile label="Overdue loans" value={r.totalOverdueLoanCount} />
        <Tile label="Outstanding on them" value={formatTzs(r.totalOverdueAmount)} />
        <Tile label="Oldest overdue" value={oldest > 0 ? `${oldest} days` : '—'} />
      </div>

      <BucketChart
        title="Overdue outstanding by age"
        buckets={buckets}
        footer={
          <>
            <span className="text-xs text-gray-500">Total overdue</span>
            <span className="text-sm font-semibold text-gray-800">{formatTzs(r.totalOverdueAmount)}</span>
          </>
        }
      />

      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-gray-50 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-3 py-2">Age</th>
              <th className="px-3 py-2 text-right">Loans</th>
              <th className="px-3 py-2 text-right">Outstanding</th>
              <th className="px-3 py-2">Loans in this bucket</th>
            </tr>
          </thead>
          <tbody>
            {r.buckets.map((b, i) => (
              <tr key={b.bucketLabel} className="border-t border-gray-100 align-top">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: AGING_HEX[i] }} aria-hidden="true" />
                    <span className="whitespace-nowrap font-medium text-gray-800">{b.bucketLabel}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-right text-gray-800">{b.loanCount}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right font-medium text-gray-800">{formatTzs(b.outstandingAmount)}</td>
                <td className="px-3 py-2.5">
                  {b.loans.length === 0 ? (
                    <span className="text-xs text-gray-400">None</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {b.loans.map((l) => (
                        <Button
                          key={l.id}
                          size="compact-xs"
                          variant="light"
                          onClick={() => go(`/loans/${l.id}`)}
                          title={`${l.borrower} · ${l.overdueDays} days overdue`}
                        >
                          {l.loanNo} · {l.overdueDays}d
                        </Button>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            <tr className="border-t border-gray-200 bg-gray-50 font-medium text-gray-800">
              <td className="px-3 py-2.5">Total</td>
              <td className="px-3 py-2.5 text-right">{r.totalOverdueLoanCount}</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right">{formatTzs(r.totalOverdueAmount)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      <Button size="xs" variant="default" leftSection={<AppIcon name="phone" />} onClick={() => go('/collection-cases')}>
        Open collection cases
      </Button>
    </div>
  )
}

/* ---------- 4. collection efficiency ---------- */

// higher is better, the same thresholds as Portfolio Health
const efficiencyColor = (v: number) => (v >= 90 ? 'green' : v >= 70 ? 'yellow' : 'red')

export function EfficiencyView({ data: r, go }: { data: EfficiencyReport } & Go) {
  const shortfall = Math.max(0, r.totalExpected - r.totalCollected)
  const paidShare = share(r.paidInstallments, r.dueInstallments)
  const color = efficiencyColor(r.efficiencyPercent)
  const nothingDue = r.dueInstallments === 0

  const reading = nothingDue
    ? 'No installment fell due in this period, so there is nothing to measure. Try a longer period.'
    : r.efficiencyPercent >= 90
      ? 'Collections are on track. Nearly everything that fell due has been paid.'
      : r.efficiencyPercent >= 70
        ? 'Collections are slipping. Follow up the borrowers who are behind before it gets worse.'
        : 'Collections are weak. A large part of what fell due has not been paid.'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Expected in period" value={formatTzs(r.totalExpected)} hint="Installments that fell due" />
        <Tile label="Collected" value={formatTzs(r.totalCollected)} />
        <Tile label="Not yet collected" value={formatTzs(shortfall)} />
        <Tile label="Efficiency" value={nothingDue ? '—' : pct(r.efficiencyPercent)} />
      </div>

      <div className="space-y-5 rounded-md border border-gray-200 p-4">
        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <Text size="sm" fw={500}>
              Money collected vs expected
            </Text>
            <Text size="lg" fw={600}>
              {nothingDue ? '—' : pct(r.efficiencyPercent)}
            </Text>
          </div>
          <Progress value={Math.min(r.efficiencyPercent, 100)} color={color} size="lg" radius="xl" />
        </div>

        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <Text size="sm" fw={500}>
              Installments paid
            </Text>
            <Text size="sm" c="dimmed">
              {r.paidInstallments} of {r.dueInstallments} that fell due
            </Text>
          </div>
          <Progress value={paidShare} color={efficiencyColor(paidShare)} size="md" radius="xl" />
        </div>

        <Text size="sm" c="dimmed">
          {reading}
        </Text>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="xs" variant="default" leftSection={<AppIcon name="credit-card" />} onClick={() => go('/payments')}>
          Open payments
        </Button>
        <Button size="xs" variant="default" leftSection={<AppIcon name="clock" />} onClick={() => go('/penalties')}>
          Open penalties &amp; grace
        </Button>
      </div>
    </div>
  )
}

/* ---------- 5. GL trial balance ---------- */

const trialColumns: CustomTableColumn<TrialBalanceRow>[] = [
  {
    accessor: 'accountCode',
    header: 'Account',
    render: (r) => (
      <div className="min-w-0">
        <div className="truncate font-mono text-xs font-semibold text-gray-800">{r.accountCode}</div>
        <div className="truncate text-xs text-gray-500">{r.accountName}</div>
      </div>
    ),
    exportValue: (r) => `${r.accountCode} (${r.accountName})`,
  },
  {
    accessor: 'accountType',
    header: 'Type',
    sortable: false,
    width: 120,
    render: (r) => (
      <span className="whitespace-nowrap">
        <Badge variant="light" color={ACCOUNT_TYPE[r.accountType].color} radius="sm" size="sm">
          {ACCOUNT_TYPE[r.accountType].label}
        </Badge>
      </span>
    ),
    exportValue: (r) => ACCOUNT_TYPE[r.accountType].label,
  },
  {
    accessor: 'totalDebit',
    header: 'Total debit',
    render: (r) => <span className="whitespace-nowrap text-sm text-gray-800">{r.totalDebit > 0 ? formatTzs(r.totalDebit) : '—'}</span>,
    exportValue: (r) => r.totalDebit,
  },
  {
    accessor: 'totalCredit',
    header: 'Total credit',
    render: (r) => <span className="whitespace-nowrap text-sm text-gray-800">{r.totalCredit > 0 ? formatTzs(r.totalCredit) : '—'}</span>,
    exportValue: (r) => r.totalCredit,
  },
  {
    accessor: 'netBalance',
    header: 'Net balance',
    render: (r) => (
      <div>
        <div className="whitespace-nowrap text-sm font-medium text-gray-800">{formatTzs(Math.abs(r.netBalance))}</div>
        <div className="text-xs text-gray-500">{r.netBalance === 0 ? 'Nil' : r.netBalance > 0 ? 'Debit' : 'Credit'}</div>
      </div>
    ),
    exportValue: (r) => r.netBalance,
  },
]

export function TrialView({ data: r, go }: { data: TrialBalanceReport } & Go) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-md bg-gray-50 px-4 py-3">
        <Badge variant="light" color={r.balanced ? 'green' : 'red'} radius="sm" size="sm">
          {r.balanced ? 'Balanced' : 'Not balanced'}
        </Badge>
        <span className="text-sm text-gray-700">
          Total debit <span className="font-medium">{formatTzs(r.totalDebit)}</span>
        </span>
        <span className="text-sm text-gray-700">
          Total credit <span className="font-medium">{formatTzs(r.totalCredit)}</span>
        </span>
        <Button size="compact-xs" variant="default" className="sm:ml-auto" onClick={() => go('/gl-transactions')}>
          Open GL transactions
        </Button>
      </div>

      <CustomTable<TrialBalanceRow>
        size="md"
        data={r.accountBalances}
        columns={trialColumns}
        searchInput
        searchPlaceholder="Search account"
        searchKeys={['accountCode', 'accountName']}
        defaultSort={{ accessor: 'accountCode', direction: 'asc' }}
        noRecordText="No entries were posted in this period"
        onRowClick={(row) => go(`/gl-transactions?account=${row.accountCode}`)}
        exportCsv
        exportFileName="gl-trial-balance"
        print
        printTitle="GL Trial Balance"
      />
    </div>
  )
}