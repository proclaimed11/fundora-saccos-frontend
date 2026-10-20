import { Alert, Badge, Progress, Text } from '@mantine/core'
import dayjs from 'dayjs'
import { formatTzs } from '../../utils/format'
import type { ExistingLoan } from './loanApplicationsData'

type Props = {
  applicantName: string
  loans: ExistingLoan[]
  /** the unpaid loan restriction has been overridden, so the loans are shown as a warning only */
  overridden?: boolean
}

export function ExistingLoansPanel({ applicantName, loans, overridden = false }: Props) {
  const unpaid = loans.filter((l) => l.outstanding > 0)
  const paidCount = loans.length - unpaid.length

  if (unpaid.length === 0) {
    return (
      <Alert
        color="green"
        variant="light"
        title="No unpaid loans"
        icon={<i className="fa fa-check-circle" aria-hidden="true" />}
      >
        <Text size="sm">
          {applicantName} has no loan still being repaid
          {paidCount > 0 &&
            `, and ${paidCount} previous ${paidCount === 1 ? 'loan was' : 'loans were'} fully paid`}
          . They can take a new loan.
        </Text>
      </Alert>
    )
  }

  return (
    <div className="space-y-3">
      {overridden ? (
        <Alert
          color="yellow"
          variant="light"
          title="Unpaid loan restriction overridden"
          icon={<i className="fa fa-exclamation-triangle" aria-hidden="true" />}
        >
          <Text size="sm">
            {applicantName} still owes on {unpaid.length} {unpaid.length === 1 ? 'loan' : 'loans'}, but this
            check is being skipped for this application.
          </Text>
        </Alert>
      ) : (
        <Alert
          color="red"
          variant="light"
          title="Unpaid loans found"
          icon={<i className="fa fa-times-circle" aria-hidden="true" />}
        >
          <Text size="sm">
            {applicantName} still owes on {unpaid.length} {unpaid.length === 1 ? 'loan' : 'loans'}. A new
            loan can't be issued until {unpaid.length === 1 ? 'it is' : 'they are'} fully paid.
          </Text>
        </Alert>
      )}

      <ul className="space-y-2">
        {unpaid.map((l) => {
          const paidPct = Math.round(((l.amount - l.outstanding) / l.amount) * 100)
          const overdue = l.status === 'OVERDUE'

          return (
            <li key={l.id} className="rounded-md border border-gray-200 px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-800">{l.ref}</div>
                  <div className="text-xs text-gray-500">
                    {l.product} · {formatTzs(l.amount)} disbursed
                  </div>
                </div>
                <Badge variant="light" color={overdue ? 'red' : 'yellow'} radius="sm" size="sm">
                  {overdue ? `Overdue · ${l.daysOverdue} days` : 'Active'}
                </Badge>
              </div>

              <Progress value={paidPct} color={overdue ? 'red' : 'brand'} size="xs" radius="xl" mt="sm" />
              <div className="mt-1 text-[11px] text-gray-500">{paidPct}% paid</div>

              <div className="mt-2 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                <div>
                  <div className="text-gray-400">Outstanding</div>
                  <div className="font-medium text-gray-800">{formatTzs(l.outstanding)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Monthly installment</div>
                  <div className="font-medium text-gray-800">{formatTzs(l.installment)}</div>
                </div>
                <div>
                  <div className="text-gray-400">{overdue ? 'Was due' : 'Next due'}</div>
                  <div className={`font-medium ${overdue ? 'text-red-600' : 'text-gray-800'}`}>
                    {l.nextDue ? dayjs(l.nextDue).format('MMM D, YYYY') : '—'}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}