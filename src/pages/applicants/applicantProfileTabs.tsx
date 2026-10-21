import { AppIcon } from '../../components/appIcon'
import { Badge, Button, Stepper, Text } from '@mantine/core'
import dayjs from 'dayjs'
import { CustomTable, type CustomTableColumn } from '../../components/customTable/customTable'
import { formatTzs } from '../../utils/format'
import { STATUS, activityFor, loansFor, nidaFor, type Applicant, type LoanRow } from './applicantsData'

/* ---------- small helpers ---------- */

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

function Timeline({ applicant, limit }: { applicant: Applicant; limit?: number }) {
  const events = activityFor(applicant).slice(0, limit)
  return (
    <ul className="space-y-4">
      {events.map((e) => (
        <li key={e.title} className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <AppIcon name={e.icon} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between gap-3">
              <span className="text-sm font-medium text-gray-800">{e.title}</span>
              <span className="shrink-0 text-xs text-gray-400">
                {dayjs(e.date).format('MMM D, YYYY')}
              </span>
            </div>
            <div className="text-xs text-gray-500">{e.detail}</div>
          </div>
        </li>
      ))}
    </ul>
  )
}

/* ---------- tabs ---------- */

export function OverviewTab({ applicant }: { applicant: Applicant }) {
  const loans = loansFor(applicant)
  const active = loans.filter((l) => l.status === 'Active')
  const outstanding = active.reduce((sum, l) => sum + l.outstanding, 0)

  const tiles = [
    { label: 'Applications', value: loans.length },
    { label: 'Active loans', value: active.length },
    { label: 'Outstanding', value: formatTzs(outstanding) },
  ]

  return (
    <div className="space-y-6">
      <Stepper
        active={STATUS[applicant.status].step}
        size="xs"
        color={applicant.status === 'REJECTED' ? 'red' : 'brand'}
      >
        <Stepper.Step label="Registered" />
        <Stepper.Step label="OTP verified" />
        <Stepper.Step label="KYC approved" />
      </Stepper>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-md bg-gray-50 px-4 py-3">
            <div className="text-xs text-gray-500">{t.label}</div>
            <div className="text-xl font-medium text-gray-800">{t.value}</div>
          </div>
        ))}
      </div>

      <div>
        <SectionTitle>Recent activity</SectionTitle>
        <div className="mt-3">
          <Timeline applicant={applicant} limit={3} />
        </div>
      </div>
    </div>
  )
}

export function KycTab({ applicant, onReview }: { applicant: Applicant; onReview?: () => void }) {
  const approvedOn = dayjs(applicant.registered).add(1, 'day')
  const documents = [
    { name: 'NIDA document', file: 'nida-document.pdf', icon: 'file-text' },
    { name: 'ID scan', file: 'id-scan.jpg', icon: 'file-image' },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <SectionTitle>KYC status</SectionTitle>
        <div className="flex items-center justify-between border-b border-gray-100 py-2.5 text-sm">
          <span className="text-gray-500">Status</span>
          <Badge variant="light" color={STATUS[applicant.status].color} radius="sm" size="sm">
            {STATUS[applicant.status].label}
          </Badge>
        </div>
        <Field label="Type" value={applicant.isReturning ? 'Returning' : 'New'} />
        {applicant.status === 'KYC_APPROVED' && (
          <Field label="Valid until" value={approvedOn.add(12, 'month').format('MMM D, YYYY')} />
        )}
        <Field label="NIDA number" value={nidaFor(applicant)} />
        <Field label="TIN number" value="TIN123" />
        {applicant.status === 'PENDING_KYC' && (
          <div className="mt-3 flex gap-2">
            <Button
              size="xs"
              leftSection={<AppIcon name="contact-round" />}
              onClick={onReview}
            >
              Review KYC
            </Button>
          </div>
        )}
      </div>

      <div>
        <SectionTitle>Documents</SectionTitle>
        <ul className="mt-2 space-y-2">
          {documents.map((d) => (
            <li key={d.name} className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2.5">
              <AppIcon name={d.icon} className="text-xl text-gray-400"  size={20} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-800">{d.name}</div>
                <div className="truncate text-xs text-gray-500">{d.file}</div>
              </div>
              <Button size="compact-xs" variant="subtle" color="brand">
                View
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function FinancialTab() {
  const debts = [
    { lender: 'CRDB Bank', balance: 800000, monthly: 90000 },
    { lender: 'Vodacom M-Pawa', balance: 150000, monthly: 25000 },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <SectionTitle>Financial profile</SectionTitle>
        <Field label="Employment type" value="Employed" />
        <Field label="Employer" value="Acme Tech Ltd" />
        <Field label="Monthly income" value={formatTzs(2500000)} />
        <Field label="Monthly expenses" value={formatTzs(1200000)} />
        <Field label="Dependants" value="2" />
      </div>

      <div>
        <SectionTitle>Existing debts</SectionTitle>
        <ul className="mt-2 space-y-2">
          {debts.map((d) => (
            <li key={d.lender} className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2.5 text-sm">
              <div>
                <div className="font-medium text-gray-800">{d.lender}</div>
                <div className="text-xs text-gray-500">{formatTzs(d.monthly)} per month</div>
              </div>
              <span className="font-medium text-gray-800">{formatTzs(d.balance)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function AccountsTab() {
  const accounts = [
    { type: 'Mobile money', provider: 'M-Pesa', number: '0700 000 000', primary: true },
    { type: 'Bank account', provider: 'CRDB Bank', number: '0150 •••• 4821', primary: false },
  ]

  return (
    <div>
      <SectionTitle>Member accounts</SectionTitle>
      <p className="mb-3 text-xs text-gray-500">Accounts that approved loans are paid into.</p>
      <ul className="space-y-2">
        {accounts.map((a) => (
          <li key={a.number} className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-3">
            <AppIcon name={a.type === 'Bank account' ? 'landmark' : 'smartphone'} className="w-6 text-center text-xl text-gray-400"  size={24} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-800">{a.provider}</div>
              <div className="text-xs text-gray-500">
                {a.type} · {a.number}
              </div>
            </div>
            {a.primary && (
              <Badge variant="light" color="brand" radius="sm" size="sm">
                Primary
              </Badge>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

const loanColumns: CustomTableColumn<LoanRow>[] = [
  { accessor: 'ref', header: 'Reference' },
  { accessor: 'product', header: 'Product' },
  {
    accessor: 'amount',
    header: 'Amount',
    render: (r) => <Text size="sm">{formatTzs(r.amount)}</Text>,
  },
  {
    accessor: 'status',
    header: 'Status',
    render: (r) => (
      <Badge variant="light" color={r.status === 'Active' ? 'green' : 'yellow'} radius="sm" size="sm">
        {r.status}
      </Badge>
    ),
  },
  { accessor: 'date', header: 'Date', type: 'date' },
]

export function LoansTab({ applicant }: { applicant: Applicant }) {
  return (
    <CustomTable<LoanRow>
      size="sm"
      data={loansFor(applicant)}
      columns={loanColumns}
      pagination={false}
      defaultSort={{ accessor: 'date', direction: 'desc' }}
      noRecordText="No loans or applications yet"
    />
  )
}

export function ActivityTab({ applicant }: { applicant: Applicant }) {
  return <Timeline applicant={applicant} />
}