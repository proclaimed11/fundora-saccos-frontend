import { AppIcon } from '../../components/appIcon'
import dayjs from 'dayjs'
import { Alert, Badge, Button, Drawer, Progress, Text } from '@mantine/core'
import { formatTzs } from '../../utils/format'
import type { WriteOffEntry } from '../collections/collectionsData'
import { LOAN_STATE, NPL_STYLE, type LoanView } from './loanApplicationsData'

type Props = {
  loan: LoanView | null
  writtenOff: WriteOffEntry | null
  canPay: boolean
  onClose: () => void
  onPay: (l: LoanView) => void
  onOpenLoan: (l: LoanView) => void
}

function Field({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`text-right text-gray-800 ${strong ? 'font-semibold' : 'font-medium'}`}>{value}</span>
    </div>
  )
}

export function LoanBalanceDrawer({ loan: l, writtenOff, canPay, onClose, onPay, onOpenLoan }: Props) {
  if (!l) return <Drawer opened={false} onClose={onClose} />

  // TODO: GET /api/payments-workflow/loans/{loanId}/balance { loan, installments, totalOutstanding, nextDueInstallment }
  const paidCount = l.installments.filter((s) => s.status === 'PAID').length
  const remaining = l.installments.length - paidCount
  const open = l.state !== 'CLOSED' && !writtenOff

  const tiles = [
    { label: 'Total outstanding', value: formatTzs(writtenOff ? 0 : l.outstanding) },
    { label: 'Past due', value: writtenOff || l.overdueAmount === 0 ? '—' : formatTzs(l.overdueAmount) },
    {
      label: l.next && !writtenOff ? `Next due · ${dayjs(l.next.dueDate).format('MMM D, YYYY')}` : 'Next installment',
      value: l.next && !writtenOff ? formatTzs(l.next.outstanding) : '—',
    },
  ]

  return (
    <Drawer opened onClose={onClose} position="right" size="md" title={`${l.loanNo} · ${l.applicantName}`}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          {writtenOff ? (
            <Badge variant="filled" color="dark" radius="sm" size="sm">
              Written off
            </Badge>
          ) : (
            <Badge variant="light" color={LOAN_STATE[l.state].color} radius="sm" size="sm">
              {LOAN_STATE[l.state].label}
            </Badge>
          )}
          {l.state === 'OVERDUE' && !writtenOff && (
            <Badge variant="outline" color={NPL_STYLE[l.classification].color} radius="sm" size="sm">
              {l.isNpl ? 'NPL · ' : ''}
              {NPL_STYLE[l.classification].label}
            </Badge>
          )}
        </div>

        {writtenOff && (
          <Alert color="red" variant="light" icon={<AppIcon name="triangle-alert" />}>
            <Text size="sm">
              Written off on {dayjs(writtenOff.date).format('MMM D, YYYY')} for {formatTzs(writtenOff.amount)}. The
              balance is zero and the loan takes no payments.
            </Text>
          </Alert>
        )}

        {l.state === 'OVERDUE' && !writtenOff && (
          <Alert color={l.isNpl ? 'red' : 'yellow'} variant="light" icon={<AppIcon name="triangle-alert" />}>
            <Text size="sm">
              {l.overdueDays} days overdue. {formatTzs(l.overdueAmount)} is past due.
            </Text>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-md bg-gray-50 px-4 py-3">
              <div className="text-xs text-gray-500">{t.label}</div>
              <div className="text-base font-medium text-gray-800">{t.value}</div>
            </div>
          ))}
        </div>

        <div>
          <Progress value={l.repaidPct} size="sm" radius="xl" color="brand" />
          <div className="mt-1 text-[11px] text-gray-500">
            {l.repaidPct}% repaid · {formatTzs(l.paid)} of {formatTzs(l.totalRepayable)}
          </div>
        </div>

        <div>
          <Text size="sm" fw={600} mb={4}>
            What is still owed
          </Text>
          <Field label="Principal" value={formatTzs(writtenOff ? 0 : l.outstandingPrincipal)} />
          <Field label="Interest" value={formatTzs(writtenOff ? 0 : l.outstandingInterest)} />
          <Field label="Penalty" value={formatTzs(writtenOff ? 0 : l.outstandingPenalty)} />
          <Field label="Total" value={formatTzs(writtenOff ? 0 : l.outstanding)} strong />
        </div>

        <div>
          <Text size="sm" fw={600} mb={4}>
            Installments
          </Text>
          <Field label="Paid" value={`${paidCount} of ${l.installments.length}`} />
          <Field label="Remaining" value={writtenOff ? '—' : String(remaining)} />
          <Field label="Matures" value={dayjs(l.maturity).format('MMM D, YYYY')} />
        </div>

        <div className="flex flex-wrap gap-2">
          {open && canPay && (
            <Button size="xs" leftSection={<AppIcon name="banknote" />} onClick={() => onPay(l)}>
              Record payment
            </Button>
          )}
          <Button size="xs" variant="default" leftSection={<AppIcon name="external-link" />} onClick={() => onOpenLoan(l)}>
            Open loan
          </Button>
        </div>
      </div>
    </Drawer>
  )
}