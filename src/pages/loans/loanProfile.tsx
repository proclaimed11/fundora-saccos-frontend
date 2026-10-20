import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { Alert, Badge, Button, Progress, Tabs, Text } from '@mantine/core'
import { DashboardLayout } from '../../components/layout/dashboardLayout'
import { CustomTable, type CustomTableColumn } from '../../components/customTable/customTable'
import { formatTzs } from '../../utils/format'
import { PaymentDialog, type PaymentInput } from './paymentDialog'
import {
  INSTALLMENT_STATUS,
  LOANS,
  LOAN_STATE,
  METHOD_LABEL,
  NPL_STYLE,
  SAMPLE_PAYMENTS,
  SAMPLE_PENALTIES,
  allocatePayment,
  loanActivity,
  methodLabel,
  penaltiesToCharge,
  viewOf,
  type InstallmentState,
  type LoanPayment,
  type LoanView,
  type PenaltyRecord,
} from './loanApplicationsData'

const CARD = 'rounded-md bg-white shadow-[0_10px_30px_rgba(76,87,125,0.12)]'

type PaymentRow = LoanPayment & { penalty: number; interest: number; principal: number; applied: string }
type PenaltyRow = PenaltyRecord & { paidStatus: 'Paid' | 'Partly paid' | 'Unpaid' }
type Notice = { text: string; color: 'green' | 'blue' } | null

/* ---------- small pieces ---------- */

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-800">{value}</span>
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

function Timeline({ v }: { v: LoanView }) {
  return (
    <ul className="space-y-4">
      {loanActivity(v).map((e, i) => (
        <li key={`${e.title}-${i}`} className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <i className={`fa ${e.icon}`} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between gap-3">
              <span className="text-sm font-medium text-gray-800">{e.title}</span>
              <span className="shrink-0 text-xs text-gray-400">{dayjs(e.date).format('MMM D, YYYY')}</span>
            </div>
            <div className="text-xs text-gray-500">{e.detail}</div>
          </div>
        </li>
      ))}
    </ul>
  )
}

const appliedTo = (p: LoanPayment) => {
  const nos = p.allocations.map((a) => a.installmentNo)
  if (nos.length === 0) return '—'
  return nos.length > 2 ? `#${nos[0]}–#${nos[nos.length - 1]}` : nos.map((x) => `#${x}`).join(', ')
}

const money = (value: number) => <Text size="sm">{value > 0 ? formatTzs(value) : '—'}</Text>

/* ---------- tables ---------- */

const scheduleColumns: CustomTableColumn<InstallmentState>[] = [
  { accessor: 'installmentNo', header: 'No.', width: 70 },
  { accessor: 'dueDate', header: 'Due date', type: 'date' },
  { accessor: 'principalDue', header: 'Principal', render: (r) => money(r.principalDue), exportValue: (r) => r.principalDue },
  { accessor: 'interestDue', header: 'Interest', render: (r) => money(r.interestDue), exportValue: (r) => r.interestDue },
  {
    accessor: 'penaltyDue',
    header: 'Penalty',
    render: (r) => (
      <Text size="sm" c={r.penaltyDue > 0 ? 'red' : undefined}>
        {r.penaltyDue > 0 ? formatTzs(r.penaltyDue) : '—'}
      </Text>
    ),
    exportValue: (r) => r.penaltyDue,
  },
  { accessor: 'paid', header: 'Paid', render: (r) => money(r.paid), exportValue: (r) => r.paid },
  {
    accessor: 'outstanding',
    header: 'Outstanding',
    render: (r) => (
      <Text size="sm" fw={500}>
        {r.outstanding > 0 ? formatTzs(r.outstanding) : '—'}
      </Text>
    ),
    exportValue: (r) => r.outstanding,
  },
  {
    accessor: 'status',
    header: 'Status',
    render: (r) => (
      <div>
        <Badge variant="light" color={INSTALLMENT_STATUS[r.status].color} radius="sm" size="sm">
          {INSTALLMENT_STATUS[r.status].label}
        </Badge>
        {r.daysOverdue > 0 && <div className="mt-0.5 text-[11px] text-red-500">{r.daysOverdue} days late</div>}
      </div>
    ),
    exportValue: (r) => INSTALLMENT_STATUS[r.status].label,
  },
]

const paymentColumns: CustomTableColumn<PaymentRow>[] = [
  { accessor: 'date', header: 'Date', type: 'date' },
  {
    accessor: 'amount',
    header: 'Amount',
    render: (r) => (
      <div>
        <div className="whitespace-nowrap text-sm font-medium text-gray-800">{formatTzs(r.amount)}</div>
        <div className="whitespace-nowrap text-xs text-gray-500">
          {METHOD_LABEL[r.method]}
          {r.reference ? ` · ${r.reference}` : ''}
        </div>
      </div>
    ),
    exportValue: (r) => r.amount,
  },
  { accessor: 'penalty', header: 'Penalty', render: (r) => money(r.penalty), exportValue: (r) => r.penalty },
  { accessor: 'interest', header: 'Interest', render: (r) => money(r.interest), exportValue: (r) => r.interest },
  { accessor: 'principal', header: 'Principal', render: (r) => money(r.principal), exportValue: (r) => r.principal },
  { accessor: 'applied', header: 'Applied to' },
  { accessor: 'receivedBy', header: 'Received by' },
]

const penaltyColumns: CustomTableColumn<PenaltyRow>[] = [
  { accessor: 'installmentNo', header: 'Installment', render: (r) => <Text size="sm">#{r.installmentNo}</Text> },
  { accessor: 'date', header: 'Charged on', type: 'date' },
  { accessor: 'rate', header: 'Rate', render: (r) => <Text size="sm">{r.rate}%</Text>, exportValue: (r) => r.rate },
  {
    accessor: 'amount',
    header: 'Amount',
    render: (r) => (
      <Text size="sm" fw={500}>
        {formatTzs(r.amount)}
      </Text>
    ),
    exportValue: (r) => r.amount,
  },
  {
    accessor: 'paidStatus',
    header: 'Status',
    render: (r) => (
      <Badge
        variant="light"
        color={r.paidStatus === 'Paid' ? 'green' : r.paidStatus === 'Partly paid' ? 'yellow' : 'red'}
        radius="sm"
        size="sm"
      >
        {r.paidStatus}
      </Badge>
    ),
  },
]

/* ---------- tabs ---------- */

function OverviewTab({ v }: { v: LoanView }) {
  const tiles = [
    { label: 'Outstanding balance', value: formatTzs(v.outstanding) },
    {
      label: v.next ? `Next installment · ${dayjs(v.next.dueDate).format('MMM D, YYYY')}` : 'Next installment',
      value: v.next ? formatTzs(v.next.outstanding) : '—',
    },
    { label: 'Paid so far', value: formatTzs(v.paid) },
  ]

  return (
    <div className="space-y-6">
      {v.state === 'OVERDUE' && (
        <Alert
          color={v.isNpl ? 'red' : 'yellow'}
          variant="light"
          title={`${v.overdueDays} days overdue · ${NPL_STYLE[v.classification].label}`}
          icon={<i className="fa fa-exclamation-triangle" aria-hidden="true" />}
        >
          <Text size="sm">
            {formatTzs(v.overdueAmount)} is past due.
            {v.isNpl
              ? ' At 90 days or more a loan is marked non-performing and moves on to collections and recovery.'
              : ' Record a payment or follow up with the borrower.'}
          </Text>
        </Alert>
      )}

      {v.state === 'CLOSED' && (
        <Alert color="green" variant="light" icon={<i className="fa fa-check-circle" aria-hidden="true" />}>
          <Text size="sm">Every installment is paid. This loan is closed.</Text>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-md bg-gray-50 px-4 py-3">
            <div className="text-xs text-gray-500">{t.label}</div>
            <div className="text-lg font-medium text-gray-800">{t.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <SectionTitle>What is still owed</SectionTitle>
          <Field label="Principal" value={formatTzs(v.outstandingPrincipal)} />
          <Field label="Interest" value={formatTzs(v.outstandingInterest)} />
          <Field label="Penalty" value={formatTzs(v.outstandingPenalty)} />
          <Field label="Total" value={formatTzs(v.outstanding)} />
        </div>
        <div>
          <SectionTitle>Loan terms</SectionTitle>
          <Field label="Principal" value={formatTzs(v.principal)} />
          <Field label="Interest" value={`${v.interestRate}% per year · ${methodLabel(v.interestMethod)}`} />
          <Field label="Tenure" value={`${v.tenure} months`} />
          <Field label="Penalty rate" value={`${v.penaltyRate}% on each late installment`} />
          <Field label="Total repayable" value={formatTzs(v.totalRepayable)} />
        </div>
      </div>
    </div>
  )
}

/* ---------- page ---------- */

export function LoanProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const [tab, setTab] = useState<string | null>('overview')
  // /loans/1?pay=1 opens the payment dialog straight away
  const [payOpen, setPayOpen] = useState(() => params.get('pay') === '1')
  // UI only: payments and penalties added in this session, nothing is saved yet
  const [addedPayments, setAddedPayments] = useState<LoanPayment[]>([])
  const [addedPenalties, setAddedPenalties] = useState<PenaltyRecord[]>([])
  const [notice, setNotice] = useState<Notice>(null)

  const loan = LOANS.find((l) => String(l.id) === id)

  const view = useMemo(
    () =>
      loan
        ? viewOf(loan, [...SAMPLE_PAYMENTS, ...addedPayments], [...SAMPLE_PENALTIES, ...addedPenalties])
        : null,
    [loan, addedPayments, addedPenalties],
  )

  // success banners fade away on their own
  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 9000)
    return () => clearTimeout(t)
  }, [notice])

  if (!view) {
    return (
      <DashboardLayout
        title="Loan not found"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Loans', to: '/loans' }, { label: 'Not found' }]}
      >
        <div className={`${CARD} p-6`}>
          <Text size="sm">We couldn't find that loan.</Text>
          <Button mt="md" size="xs" variant="default" onClick={() => navigate('/loans')}>
            Back to loans
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const toCharge = penaltiesToCharge(view, view.installments, view.penalties)
  const usedReferences = [...SAMPLE_PAYMENTS, ...addedPayments].map((p) => p.reference).filter(Boolean)

  const closePay = () => {
    setPayOpen(false)
    if (params.get('pay')) setParams({}, { replace: true })
  }

  const record = (input: PaymentInput) => {
    // TODO: POST /api/payments-workflow/loans/{loanId}/pay { amount, paymentMethod, referenceNumber, receivedBy }
    const { allocations, unallocated } = allocatePayment(input.amount, view.installments)
    const payment: LoanPayment = {
      id: Date.now(),
      loanId: view.id,
      ...input,
      date: dayjs().format('YYYY-MM-DD'),
      allocations,
      unallocated,
    }
    const after = viewOf(view, [...view.payments, payment], view.penalties)
    const sum = (key: 'penalty' | 'interest' | 'principal') => allocations.reduce((s, a) => s + a[key], 0)

    setAddedPayments((list) => [...list, payment])
    setNotice({
      color: 'green',
      text: `${formatTzs(input.amount)} recorded: penalty ${formatTzs(sum('penalty'))}, interest ${formatTzs(sum('interest'))}, principal ${formatTzs(sum('principal'))}. ${
        after.state === 'CLOSED'
          ? 'The loan is fully repaid and now closed.'
          : `${formatTzs(after.outstanding)} is still outstanding.`
      }`,
    })
    setTab('payments')
    closePay()
  }

  const accrue = () => {
    // TODO: POST /api/payments-workflow/loans/{loanId}/accrue-penalties (safe to repeat, it never charges twice)
    if (toCharge.length === 0) {
      setNotice({ color: 'blue', text: 'No new penalties to charge. Every late installment has already been charged.' })
      return
    }
    const today = dayjs().format('YYYY-MM-DD')
    setAddedPenalties((list) => [
      ...list,
      ...toCharge.map((p, i) => ({ id: Date.now() + i, loanId: view.id, ...p, date: today })),
    ])
    setNotice({
      color: 'green',
      text: `${toCharge.length} ${toCharge.length === 1 ? 'penalty' : 'penalties'} charged, ${formatTzs(
        toCharge.reduce((s, p) => s + p.amount, 0),
      )} in total.`,
    })
    setTab('penalties')
  }

  const paymentRows: PaymentRow[] = view.payments.map((p) => {
    const sum = (key: 'penalty' | 'interest' | 'principal') => p.allocations.reduce((s, a) => s + a[key], 0)
    return { ...p, penalty: sum('penalty'), interest: sum('interest'), principal: sum('principal'), applied: appliedTo(p) }
  })

  const penaltyRows: PenaltyRow[] = view.penalties.map((p) => {
    const s = view.installments.find((i) => i.installmentNo === p.installmentNo)
    const paid = s?.penaltyPaid ?? 0
    return { ...p, paidStatus: paid >= (s?.penaltyDue ?? p.amount) ? 'Paid' : paid > 0 ? 'Partly paid' : 'Unpaid' }
  })

  const details = [
    { icon: 'fa-calendar-o', label: 'Disbursed', value: dayjs(view.disbursed).format('MMM D, YYYY') },
    { icon: 'fa-percent', label: 'Interest', value: `${view.interestRate}% p.a. · ${methodLabel(view.interestMethod)}` },
    { icon: 'fa-calendar', label: 'Tenure', value: `${view.tenure} months` },
    { icon: 'fa-flag-o', label: 'Matures', value: dayjs(view.maturity).format('MMM D, YYYY') },
    { icon: 'fa-exclamation-triangle', label: 'Penalty rate', value: `${view.penaltyRate}%` },
    { icon: 'fa-briefcase', label: 'Loan officer', value: view.loanOfficer },
  ]

  const TABS = [
    { value: 'overview', label: 'Overview' },
    { value: 'schedule', label: 'Schedule' },
    { value: 'payments', label: `Payments (${view.payments.length})` },
    { value: 'penalties', label: `Penalties (${view.penalties.length})` },
    { value: 'activity', label: 'Activity' },
  ]

  return (
    <DashboardLayout
      title={view.loanNo}
      subtitle={view.applicantName}
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Loans', to: '/loans' }, { label: view.loanNo }]}
      actions={
        <>
          <Button
            size="xs"
            radius="xs"
            variant="default"
            leftSection={<i className="fa fa-user-o" aria-hidden="true" />}
            onClick={() => navigate(`/applicants/${view.applicantId}`)}
          >
            View borrower
          </Button>
          {view.applicationId && (
            <Button
              size="xs"
              radius="xs"
              variant="default"
              leftSection={<i className="fa fa-file-text-o" aria-hidden="true" />}
              onClick={() => navigate(`/loan-applications/${view.applicationId}`)}
            >
              View application
            </Button>
          )}
          {view.state !== 'CLOSED' && (
            <>
              <Button
                size="xs"
                radius="xs"
                variant="default"
                leftSection={<i className="fa fa-exclamation-triangle" aria-hidden="true" />}
                onClick={accrue}
              >
                Accrue penalties
              </Button>
              <Button
                size="xs"
                radius="xs"
                leftSection={<i className="fa fa-money" aria-hidden="true" />}
                onClick={() => setPayOpen(true)}
              >
                Record payment
              </Button>
            </>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {notice && (
          <Alert
            color={notice.color}
            variant="light"
            withCloseButton
            onClose={() => setNotice(null)}
            icon={<i className={`fa ${notice.color === 'green' ? 'fa-check-circle' : 'fa-info-circle'}`} aria-hidden="true" />}
          >
            <Text size="sm">{notice.text}</Text>
          </Alert>
        )}

        <div className="grid items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* loan summary */}
          <div className={`${CARD} p-5`}>
            <div className="flex flex-col items-center border-b border-gray-100 pb-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
                <i className="fa fa-money" aria-hidden="true" />
              </div>
              <div className="mt-3 text-lg font-medium text-gray-800">{formatTzs(view.outstanding)}</div>
              <div className="text-[11px] text-gray-500">outstanding</div>
              <button
                type="button"
                className="mt-1 text-xs text-green-700 hover:underline"
                onClick={() => navigate(`/applicants/${view.applicantId}`)}
              >
                {view.applicantName}
              </button>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Badge variant="light" color={LOAN_STATE[view.state].color} radius="sm" size="sm">
                  {LOAN_STATE[view.state].label}
                </Badge>
                {view.state === 'OVERDUE' && (
                  <Badge variant="outline" color={NPL_STYLE[view.classification].color} radius="sm" size="sm">
                    {view.isNpl ? 'NPL · ' : ''}
                    {NPL_STYLE[view.classification].label}
                  </Badge>
                )}
              </div>
              <div className="mt-3 w-full">
                <Progress value={view.repaidPct} size="sm" radius="xl" color="brand" />
                <div className="mt-1 text-[11px] text-gray-500">
                  {view.repaidPct}% repaid · {formatTzs(view.paid)} of {formatTzs(view.totalRepayable)}
                </div>
              </div>
            </div>

            <ul className="space-y-3 pt-4">
              {details.map((d) => (
                <li key={d.label} className="flex items-start gap-3 text-sm text-gray-700">
                  <i className={`fa ${d.icon} mt-0.5 w-4 text-center text-gray-400`} aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="text-[11px] text-gray-400">{d.label}</div>
                    <div className="break-words">{d.value}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* tabs */}
          <div className={CARD}>
            <Tabs value={tab} onChange={setTab} color="brand">
              <Tabs.List className="flex-nowrap overflow-x-auto px-3">
                {TABS.map((t) => (
                  <Tabs.Tab key={t.value} value={t.value} className="whitespace-nowrap">
                    {t.label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>

              <div className="p-5">
                <Tabs.Panel value="overview">
                  <OverviewTab v={view} />
                </Tabs.Panel>

                <Tabs.Panel value="schedule">
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500">
                      Payments clear the oldest unpaid installment first. Inside an installment the penalty is paid
                      first, then the interest, then the principal.
                    </p>
                    <CustomTable<InstallmentState>
                      size="sm"
                      data={view.installments}
                      columns={scheduleColumns}
                      pagination={false}
                      defaultSort={null}
                      exportCsv
                      exportFileName={`${view.loanNo}-schedule`}
                    />
                  </div>
                </Tabs.Panel>

                <Tabs.Panel value="payments">
                  <CustomTable<PaymentRow>
                    size="sm"
                    data={paymentRows}
                    columns={paymentColumns}
                    pagination={false}
                    defaultSort={{ accessor: 'date', direction: 'desc' }}
                    noRecordText="No payments recorded yet"
                    exportCsv
                    exportFileName={`${view.loanNo}-payments`}
                  />
                </Tabs.Panel>

                <Tabs.Panel value="penalties">
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500">
                      A late penalty is charged once on each late installment: the amount still owing on it times the
                      penalty rate of {view.penaltyRate}%. Running the charge again never charges the same installment
                      twice.
                    </p>

                    {toCharge.length > 0 && view.state !== 'CLOSED' && (
                      <Alert
                        color="yellow"
                        variant="light"
                        icon={<i className="fa fa-exclamation-triangle" aria-hidden="true" />}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Text size="sm">
                            {toCharge.length} late {toCharge.length === 1 ? 'installment has' : 'installments have'} not
                            been charged yet, about {formatTzs(toCharge.reduce((s, p) => s + p.amount, 0))} in total. The
                            daily job charges them at 06:30 UTC, or you can do it now.
                          </Text>
                          <Button size="compact-xs" radius="xs" onClick={accrue}>
                            Charge now
                          </Button>
                        </div>
                      </Alert>
                    )}

                    <CustomTable<PenaltyRow>
                      size="sm"
                      data={penaltyRows}
                      columns={penaltyColumns}
                      pagination={false}
                      defaultSort={{ accessor: 'date', direction: 'desc' }}
                      noRecordText="No penalties have been charged"
                    />
                  </div>
                </Tabs.Panel>

                <Tabs.Panel value="activity">
                  <Timeline v={view} />
                </Tabs.Panel>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      <PaymentDialog
        opened={payOpen && view.state !== 'CLOSED'}
        loan={view}
        usedReferences={usedReferences}
        onClose={closePay}
        onSubmit={record}
      />
    </DashboardLayout>
  )
}