import dayjs from 'dayjs'
import {
  LOANS,
  NPL_STYLE,
  SAMPLE_PAYMENTS,
  SAMPLE_PENALTIES,
  classify,
  plannedInstallments,
  type Loan,
  type NplClass,
} from '../loans/loanApplicationsData'
import { SAMPLE_WRITE_OFFS } from '../collections/collectionsData'
import { SAMPLE_GL_TRANSACTIONS, trialBalanceFor, type TrialBalanceRow } from '../accounting/accountingData'

/* ---------- the report list ---------- */

export type ReportKey = 'portfolio' | 'npl' | 'aging' | 'efficiency' | 'trial'

export type ReportGroup = 'Portfolio' | 'Collections' | 'Accounting'

export type ReportInfo = {
  key: ReportKey
  label: string
  group: ReportGroup
  icon: string
  description: string
  endpoint: string
  /** false when the start date means nothing, the report is a position at the end date */
  usesFrom: boolean
  /** shown under the filters */
  hint: string
}

export const REPORTS: ReportInfo[] = [
  { key: 'portfolio', label: 'Portfolio summary', group: 'Portfolio', icon: 'chart-column-increasing', description: 'The loan book at a glance: how much was lent, what is still owed and how risky it is', endpoint: '/api/reports/portfolio-summary', usesFrom: true, hint: 'The loan book is shown as it stood on the end date. The activity totals cover the whole period.' },
  { key: 'npl', label: 'NPL classification', group: 'Portfolio', icon: 'triangle-alert', description: 'Active loans grouped by how late they are, from Current to Loss', endpoint: '/api/reports/npl', usesFrom: false, hint: 'A position report: loans are shown as they stood on the end date, so the start date is not used.' },
  { key: 'aging', label: 'Collections aging', group: 'Collections', icon: 'clock', description: 'Overdue loans grouped by how many days they are late', endpoint: '/api/reports/collections-aging', usesFrom: false, hint: 'A position report: lateness is counted up to the end date, so the start date is not used.' },
  { key: 'efficiency', label: 'Collection efficiency', group: 'Collections', icon: 'hand-coins', description: 'How much of the money that fell due in the period was collected', endpoint: '/api/reports/collection-efficiency', usesFrom: true, hint: 'Installments that fell due between the two dates, and how much of them was paid by the end date.' },
  { key: 'trial', label: 'GL trial balance', group: 'Accounting', icon: 'scale', description: 'Debit and credit totals for every account that had entries in the period', endpoint: '/api/reports/gl-trial-balance', usesFrom: true, hint: 'Only the entries posted between the two dates. Use a quarter or a year for a period close.' },
]

export const REPORT_GROUPS: ReportGroup[] = ['Portfolio', 'Collections', 'Accounting']

export const reportPickerData = REPORT_GROUPS.map((g) => ({
  group: g,
  items: REPORTS.filter((r) => r.group === g).map((r) => ({ value: r.key, label: r.label })),
}))

/* ---------- periods ---------- */

const FMT = 'YYYY-MM-DD'

export type Range = { from: string; to: string }

export type PresetKey =
  | 'this-month'
  | 'last-month'
  | 'this-quarter'
  | 'last-quarter'
  | 'q1'
  | 'q2'
  | 'q3'
  | 'q4'
  | 'this-year'
  | 'last-year'
  | 'custom'

const monthStart = (y: number, m: number) => dayjs(new Date(y, m, 1))

const monthRange = (y: number, m: number): Range => ({
  from: monthStart(y, m).format(FMT),
  to: monthStart(y, m).endOf('month').format(FMT),
})

// q is 0 to 3
const quarterRange = (y: number, q: number): Range => ({
  from: monthStart(y, q * 3).format(FMT),
  to: monthStart(y, q * 3 + 2).endOf('month').format(FMT),
})

const yearRange = (y: number): Range => ({ from: `${y}-01-01`, to: `${y}-12-31` })

// the current period is the default, so every preset is worked out from today
export function rangeFor(preset: Exclude<PresetKey, 'custom'>): Range {
  const now = dayjs()
  const y = now.year()
  const m = now.month()
  const q = Math.floor(m / 3)

  switch (preset) {
    case 'this-month':
      return monthRange(y, m)
    case 'last-month':
      return m === 0 ? monthRange(y - 1, 11) : monthRange(y, m - 1)
    case 'this-quarter':
      return quarterRange(y, q)
    case 'last-quarter':
      return q === 0 ? quarterRange(y - 1, 3) : quarterRange(y, q - 1)
    case 'q1':
      return quarterRange(y, 0)
    case 'q2':
      return quarterRange(y, 1)
    case 'q3':
      return quarterRange(y, 2)
    case 'q4':
      return quarterRange(y, 3)
    case 'this-year':
      return yearRange(y)
    default:
      return yearRange(y - 1)
  }
}

// grouped options for the period picker, the quarters of this year that have started are listed
export function presetGroups() {
  const now = dayjs()
  const y = now.year()
  const q = Math.floor(now.month() / 3)

  return [
    {
      group: 'Month',
      items: [
        { value: 'this-month', label: 'This month' },
        { value: 'last-month', label: 'Last month' },
      ],
    },
    {
      group: 'Quarter',
      items: [
        { value: 'this-quarter', label: 'This quarter' },
        { value: 'last-quarter', label: 'Last quarter' },
        ...Array.from({ length: q + 1 }, (_, i) => ({ value: `q${i + 1}`, label: `Q${i + 1} ${y}` })),
      ],
    },
    {
      group: 'Year',
      items: [
        { value: 'this-year', label: 'This year' },
        { value: 'last-year', label: 'Last year' },
      ],
    },
    { group: 'Other', items: [{ value: 'custom', label: 'Custom range' }] },
  ]
}

const after = (date: string, limit: string) => dayjs(date).isAfter(dayjs(limit), 'day')
const before = (date: string, limit: string) => dayjs(date).isBefore(dayjs(limit), 'day')
const inRange = (date: string, from: string, to: string) => !before(date, from) && !after(date, to)

// a report cannot look into the future, so a period that has not ended yet stops at today
export const effectiveTo = (to: string) => {
  const today = dayjs().format(FMT)
  return after(to, today) ? today : to
}

export const dateText = (d: string) => dayjs(d).format('MMM D, YYYY')

export const rangeText = (r: Range) => `${dateText(r.from)} – ${dateText(r.to)}`

/* ---------- SAMPLE ONLY: built from the sample loans, payments and ledger, so every figure matches the other pages ---------- */

const sum = <T>(list: T[], f: (x: T) => number) => list.reduce((s, x) => s + f(x), 0)
const percent = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0)

// one loan as it stood on a date
type LoanAt = {
  loan: Loan
  principal: number
  interest: number
  penalty: number
  outstanding: number
  overdueDays: number
  overdueAmount: number
  classification: NplClass
  isNpl: boolean
  state: 'ACTIVE' | 'OVERDUE' | 'CLOSED'
}

// the same rules as viewOf(), but only the payments and penalties up to that date count
function loanAt(loan: Loan, asOf: string): LoanAt | null {
  if (after(loan.disbursed, asOf)) return null

  const allocations = SAMPLE_PAYMENTS.filter((p) => p.loanId === loan.id && !after(p.date, asOf)).flatMap((p) => p.allocations)
  const penalties = SAMPLE_PENALTIES.filter((p) => p.loanId === loan.id && !after(p.date, asOf))

  let principal = 0
  let interest = 0
  let penalty = 0
  let overdueDays = 0
  let overdueAmount = 0

  plannedInstallments(loan).forEach((row) => {
    const mine = allocations.filter((a) => a.installmentNo === row.installmentNo)
    const penaltyDue = sum(penalties.filter((p) => p.installmentNo === row.installmentNo), (p) => p.amount)
    const p = row.principalDue - sum(mine, (a) => a.principal)
    const i = row.interestDue - sum(mine, (a) => a.interest)
    const pen = penaltyDue - sum(mine, (a) => a.penalty)
    const out = p + i + pen

    principal += p
    interest += i
    penalty += pen

    const late = dayjs(asOf).diff(dayjs(row.dueDate), 'day')
    if (out > 0 && late > 0) {
      overdueDays = Math.max(overdueDays, late)
      overdueAmount += out
    }
  })

  const outstanding = principal + interest + penalty
  return {
    loan,
    principal,
    interest,
    penalty,
    outstanding,
    overdueDays,
    overdueAmount,
    classification: classify(overdueDays),
    isNpl: overdueDays >= 90, // the API marks a loan NPL from 90 days
    state: outstanding <= 0 ? 'CLOSED' : overdueDays > 0 ? 'OVERDUE' : 'ACTIVE',
  }
}

const positions = (asOf: string) => LOANS.map((l) => loanAt(l, asOf)).filter((x): x is LoanAt => x !== null)

/* ---------- portfolio summary ---------- */

export type PortfolioSummary = {
  totalLoans: number
  loansByStatus: Record<string, number>
  activeLoanCount: number
  closedLoanCount: number
  writtenOffLoanCount: number
  nplLoanCount: number
  totalPrincipalDisbursed: number
  totalOutstandingPrincipal: number
  totalOutstandingInterest: number
  totalOutstandingPenalty: number
  totalOutstanding: number
  nplOutstandingAmount: number
  nplRatioPercent: number
  portfolioAtRiskAmount: number
  portfolioAtRiskRatioPercent: number
  totalWrittenOffAmount: number
  /** collection efficiency of the same period, for the health card */
  efficiencyPercent: number
  /** what happened between the two dates, this part is not in the API report */
  activity: {
    disbursedCount: number
    disbursedAmount: number
    collectedCount: number
    collectedAmount: number
    writtenOffCount: number
    writtenOffAmount: number
  }
}

function portfolioFor(range: Range): PortfolioSummary {
  const asOf = effectiveTo(range.to)
  const at = positions(asOf)
  const active = at.filter((l) => l.state !== 'CLOSED')
  const closed = at.filter((l) => l.state === 'CLOSED')
  const npl = active.filter((l) => l.isNpl)
  const overdue = active.filter((l) => l.overdueDays > 0)
  const written = SAMPLE_WRITE_OFFS.filter((w) => !after(w.date, asOf))

  const outstanding = sum(active, (l) => l.outstanding)
  const nplOutstanding = sum(npl, (l) => l.outstanding)
  const overdueOutstanding = sum(overdue, (l) => l.outstanding)

  const disbursed = LOANS.filter((l) => inRange(l.disbursed, range.from, asOf))
  const payments = SAMPLE_PAYMENTS.filter((p) => inRange(p.date, range.from, asOf))
  const writtenInPeriod = SAMPLE_WRITE_OFFS.filter((w) => inRange(w.date, range.from, asOf))

  return {
    totalLoans: at.length + written.length,
    loansByStatus: { ACTIVE: active.length, CLOSED: closed.length, WRITTEN_OFF: written.length },
    activeLoanCount: active.length,
    closedLoanCount: closed.length,
    writtenOffLoanCount: written.length,
    nplLoanCount: npl.length,
    totalPrincipalDisbursed: sum(at, (l) => l.loan.principal),
    totalOutstandingPrincipal: sum(active, (l) => l.principal),
    totalOutstandingInterest: sum(active, (l) => l.interest),
    totalOutstandingPenalty: sum(active, (l) => l.penalty),
    totalOutstanding: outstanding,
    nplOutstandingAmount: nplOutstanding,
    nplRatioPercent: percent(nplOutstanding, outstanding),
    portfolioAtRiskAmount: overdueOutstanding,
    portfolioAtRiskRatioPercent: percent(overdueOutstanding, outstanding),
    totalWrittenOffAmount: sum(written, (w) => w.amount),
    efficiencyPercent: efficiencyFor(range).efficiencyPercent,
    activity: {
      disbursedCount: disbursed.length,
      disbursedAmount: sum(disbursed, (l) => l.principal),
      collectedCount: payments.length,
      collectedAmount: sum(payments, (p) => p.amount),
      writtenOffCount: writtenInPeriod.length,
      writtenOffAmount: sum(writtenInPeriod, (w) => w.amount),
    },
  }
}

/* ---------- NPL classification ---------- */

export const NPL_CLASSES: NplClass[] = ['CURRENT', 'WATCH', 'SUBSTANDARD', 'DOUBTFUL', 'LOSS']

export type NplBucket = { classification: NplClass; loanCount: number; outstandingAmount: number }

export type NplReport = {
  buckets: NplBucket[]
  totalLoanCount: number
  totalOutstandingAmount: number
  nplLoanCount: number
  nplOutstandingAmount: number
  nplRatioPercent: number
}

function nplFor(range: Range): NplReport {
  const active = positions(effectiveTo(range.to)).filter((l) => l.state !== 'CLOSED')
  const npl = active.filter((l) => l.isNpl)
  const total = sum(active, (l) => l.outstanding)

  return {
    buckets: NPL_CLASSES.map((c) => {
      const list = active.filter((l) => l.classification === c)
      return { classification: c, loanCount: list.length, outstandingAmount: sum(list, (l) => l.outstanding) }
    }),
    totalLoanCount: active.length,
    totalOutstandingAmount: total,
    nplLoanCount: npl.length,
    nplOutstandingAmount: sum(npl, (l) => l.outstanding),
    nplRatioPercent: percent(sum(npl, (l) => l.outstanding), total),
  }
}

/* ---------- collections aging ---------- */

export type AgingLoan = { id: number; loanNo: string; borrower: string; overdueDays: number; outstanding: number }

export type AgingBucket = {
  bucketLabel: string
  loanCount: number
  outstandingAmount: number
  loanIds: number[]
  /** the API only returns loanIds, the names are joined from the loans later */
  loans: AgingLoan[]
}

export type AgingReport = {
  buckets: AgingBucket[]
  totalOverdueLoanCount: number
  totalOverdueAmount: number
}

// 90+ starts at 90 days, the same point where a loan becomes NPL
const AGING_RULES: { label: string; test: (days: number) => boolean }[] = [
  { label: '1-30 days', test: (d) => d >= 1 && d <= 30 },
  { label: '31-60 days', test: (d) => d >= 31 && d <= 60 },
  { label: '61-90 days', test: (d) => d >= 61 && d < 90 },
  { label: '90+ days', test: (d) => d >= 90 },
]

function agingFor(range: Range): AgingReport {
  const overdue = positions(effectiveTo(range.to)).filter((l) => l.state !== 'CLOSED' && l.overdueDays > 0)

  return {
    buckets: AGING_RULES.map((rule) => {
      const list = overdue.filter((l) => rule.test(l.overdueDays))
      return {
        bucketLabel: rule.label,
        loanCount: list.length,
        outstandingAmount: sum(list, (l) => l.outstanding),
        loanIds: list.map((l) => l.loan.id),
        loans: list.map((l) => ({
          id: l.loan.id,
          loanNo: l.loan.loanNo,
          borrower: l.loan.applicantName,
          overdueDays: l.overdueDays,
          outstanding: l.outstanding,
        })),
      }
    }),
    totalOverdueLoanCount: overdue.length,
    totalOverdueAmount: sum(overdue, (l) => l.outstanding),
  }
}

/* ---------- collection efficiency ---------- */

export type EfficiencyReport = {
  totalExpected: number
  totalCollected: number
  efficiencyPercent: number
  paidInstallments: number
  dueInstallments: number
}

// expected = installments that fell due in the period, collected = how much of them was paid by the end date
function efficiencyFor(range: Range): EfficiencyReport {
  const to = effectiveTo(range.to)
  let expected = 0
  let collected = 0
  let paidCount = 0
  let dueCount = 0

  LOANS.forEach((loan) => {
    const allocations = SAMPLE_PAYMENTS.filter((p) => p.loanId === loan.id && !after(p.date, to)).flatMap((p) => p.allocations)
    const penalties = SAMPLE_PENALTIES.filter((p) => p.loanId === loan.id && !after(p.date, to))

    plannedInstallments(loan)
      .filter((row) => inRange(row.dueDate, range.from, to))
      .forEach((row) => {
        const paid = sum(
          allocations.filter((a) => a.installmentNo === row.installmentNo),
          (a) => a.penalty + a.interest + a.principal,
        )
        const penaltyDue = sum(penalties.filter((p) => p.installmentNo === row.installmentNo), (p) => p.amount)
        const due = row.principalDue + row.interestDue + penaltyDue

        expected += due
        collected += Math.min(paid, due)
        dueCount += 1
        if (paid >= due) paidCount += 1
      })
  })

  return {
    totalExpected: expected,
    totalCollected: collected,
    efficiencyPercent: Math.round(percent(collected, expected) * 100) / 100,
    paidInstallments: paidCount,
    dueInstallments: dueCount,
  }
}

/* ---------- GL trial balance ---------- */

export type TrialBalanceReport = {
  accountBalances: TrialBalanceRow[]
  totalDebit: number
  totalCredit: number
  balanced: boolean
}

function trialFor(range: Range): TrialBalanceReport {
  const to = effectiveTo(range.to)
  const rows = trialBalanceFor(SAMPLE_GL_TRANSACTIONS.filter((t) => inRange(t.date, range.from, to))).sort((a, b) =>
    a.accountCode.localeCompare(b.accountCode),
  )
  const totalDebit = sum(rows, (r) => r.totalDebit)
  const totalCredit = sum(rows, (r) => r.totalCredit)
  return { accountBalances: rows, totalDebit, totalCredit, balanced: totalDebit === totalCredit }
}

/* ---------- generate ---------- */

export type Generated =
  | { key: 'portfolio'; data: PortfolioSummary }
  | { key: 'npl'; data: NplReport }
  | { key: 'aging'; data: AgingReport }
  | { key: 'efficiency'; data: EfficiencyReport }
  | { key: 'trial'; data: TrialBalanceReport }

// TODO: GET the report endpoint of that report. None of them takes a date yet, so the backend needs
//       from/to (or asOf) query parameters before the period can be applied there.
export function buildReport(key: ReportKey, range: Range): Generated {
  switch (key) {
    case 'portfolio':
      return { key, data: portfolioFor(range) }
    case 'npl':
      return { key, data: nplFor(range) }
    case 'aging':
      return { key, data: agingFor(range) }
    case 'efficiency':
      return { key, data: efficiencyFor(range) }
    default:
      return { key: 'trial', data: trialFor(range) }
  }
}

/* ---------- CSV export of a generated report ---------- */

export function csvFor(g: Generated, range: Range): { fileName: string; rows: (string | number)[][] } {
  const stamp = `${range.from}-to-${effectiveTo(range.to)}`

  switch (g.key) {
    case 'portfolio': {
      const p = g.data
      return {
        fileName: `portfolio-summary-${stamp}.csv`,
        rows: [
          ['Measure', 'Value'],
          ['Total loans', p.totalLoans],
          ['Active loans', p.activeLoanCount],
          ['Closed loans', p.closedLoanCount],
          ['Written-off loans', p.writtenOffLoanCount],
          ['NPL loans', p.nplLoanCount],
          ['Principal disbursed', p.totalPrincipalDisbursed],
          ['Outstanding principal', p.totalOutstandingPrincipal],
          ['Outstanding interest', p.totalOutstandingInterest],
          ['Outstanding penalty', p.totalOutstandingPenalty],
          ['Total outstanding', p.totalOutstanding],
          ['NPL outstanding', p.nplOutstandingAmount],
          ['NPL ratio %', p.nplRatioPercent.toFixed(2)],
          ['Portfolio at risk', p.portfolioAtRiskAmount],
          ['Portfolio at risk %', p.portfolioAtRiskRatioPercent.toFixed(2)],
          ['Total written off', p.totalWrittenOffAmount],
          ['Disbursed in period (amount)', p.activity.disbursedAmount],
          ['Disbursed in period (loans)', p.activity.disbursedCount],
          ['Collected in period (amount)', p.activity.collectedAmount],
          ['Collected in period (payments)', p.activity.collectedCount],
          ['Written off in period', p.activity.writtenOffAmount],
        ],
      }
    }
    case 'npl':
      return {
        fileName: `npl-classification-${stamp}.csv`,
        rows: [
          ['Class', 'Loans', 'Outstanding', 'Share of outstanding %'],
          ...g.data.buckets.map((b) => [
            NPL_STYLE[b.classification].label,
            b.loanCount,
            b.outstandingAmount,
            percent(b.outstandingAmount, g.data.totalOutstandingAmount).toFixed(1),
          ]),
          ['Total', g.data.totalLoanCount, g.data.totalOutstandingAmount, '100.0'],
        ],
      }
    case 'aging':
      return {
        fileName: `collections-aging-${stamp}.csv`,
        rows: [
          ['Bucket', 'Loans', 'Outstanding', 'Loan numbers'],
          ...g.data.buckets.map((b) => [b.bucketLabel, b.loanCount, b.outstandingAmount, b.loans.map((l) => l.loanNo).join(' ')]),
          ['Total', g.data.totalOverdueLoanCount, g.data.totalOverdueAmount, ''],
        ],
      }
    case 'efficiency':
      return {
        fileName: `collection-efficiency-${stamp}.csv`,
        rows: [
          ['Measure', 'Value'],
          ['Total expected', g.data.totalExpected],
          ['Total collected', g.data.totalCollected],
          ['Efficiency %', g.data.efficiencyPercent],
          ['Paid installments', g.data.paidInstallments],
          ['Due installments', g.data.dueInstallments],
        ],
      }
    default:
      return {
        fileName: `gl-trial-balance-${stamp}.csv`,
        rows: [
          ['Account code', 'Account name', 'Type', 'Total debit', 'Total credit', 'Net balance'],
          ...g.data.accountBalances.map((r) => [r.accountCode, r.accountName, r.accountType, r.totalDebit, r.totalCredit, r.netBalance]),
          ['Total', '', '', g.data.totalDebit, g.data.totalCredit, ''],
        ],
      }
  }
}