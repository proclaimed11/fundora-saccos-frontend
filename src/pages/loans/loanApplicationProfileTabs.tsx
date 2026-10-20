import { Alert, Badge, Button, Stepper, Text } from '@mantine/core'
import dayjs from 'dayjs'
import { CustomTable, type CustomTableColumn } from '../../components/customTable/customTable'
import { formatTzs } from '../../utils/format'
import {
  RANK,
  STATUS,
  activityFor,
  approvalsFor,
  collateralsFor,
  contractFor,
  creditFor,
  estimateInstallment,
  guarantorsFor,
  methodLabel,
  scheduleFor,
  totalRepayable,
  type InstallmentRow,
  type LoanApplication,
} from './loanApplicationsData'
import { useNavigate } from 'react-router-dom'

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

function Empty({ children }: { children: string }) {
  return (
    <div className="rounded-md border border-dashed border-gray-200 px-4 py-5 text-center text-xs text-gray-500">
      {children}
    </div>
  )
}

const PILL_COLOR: Record<string, string> = {
  VERIFIED: 'green',
  APPROVED: 'green',
  APPROVE: 'green',
  PENDING: 'gray',
  REJECTED: 'red',
  REJECT: 'red',
  GENERATED: 'violet',
  SENT: 'blue',
  SIGNED: 'teal',
}

function Pill({ value }: { value: string }) {
  return (
    <Badge variant="light" color={PILL_COLOR[value] ?? 'gray'} radius="sm" size="sm">
      {value.charAt(0) + value.slice(1).toLowerCase()}
    </Badge>
  )
}

function Timeline({ application, limit }: { application: LoanApplication; limit?: number }) {
  const events = activityFor(application).slice(0, limit)
  return (
    <ul className="space-y-4">
      {events.map((e) => (
        <li key={e.title} className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <i className={`fa ${e.icon}`} aria-hidden="true" />
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

export function OverviewTab({ application }: { application: LoanApplication }) {
  const tiles = [
    { label: 'Requested amount', value: formatTzs(application.requestedAmount) },
    { label: 'Est. monthly installment', value: formatTzs(Math.round(estimateInstallment(application))) },
    { label: 'Est. total repayable', value: formatTzs(Math.round(totalRepayable(application))) },
  ]

  return (
    <div className="space-y-6">
      <Stepper
        active={STATUS[application.status].step}
        size="xs"
        color={application.status === 'REJECTED' ? 'red' : 'brand'}
      >
        <Stepper.Step label="Submitted" />
        <Stepper.Step label="Credit" />
        <Stepper.Step label="Approval" />
        <Stepper.Step label="Contract" />
        <Stepper.Step label="Loan" />
      </Stepper>

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
          <SectionTitle>Loan terms</SectionTitle>
          <Field label="Interest method" value={methodLabel(application.interestMethod)} />
          <Field label="Interest rate" value={`${application.interestRate}% per year`} />
          <Field label="Tenure" value={`${application.tenure} months`} />
          <Field label="Penalty rate" value={`${application.penaltyRate}%`} />
        </div>
        <div>
          <SectionTitle>Recent activity</SectionTitle>
          <div className="mt-3">
            <Timeline application={application} limit={3} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function RequirementsTab({ application }: { application: LoanApplication }) {
  const guarantors = guarantorsFor(application)
  const collaterals = collateralsFor(application)
  const credit = creditFor(application)
  const installment = Math.round(estimateInstallment(application))
  const totalValue = collaterals.reduce((sum, c) => sum + c.value, 0)
  const shortfall = credit ? Math.max(0, installment - credit.cashFlow) : 0

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <div>
          <SectionTitle>{guarantors.length > 1 ? `Guarantors (${guarantors.length})` : 'Guarantors'}</SectionTitle>
          {!application.guarantorRequired ? (
            <Empty>A guarantor is not required for this application.</Empty>
          ) : guarantors.length === 0 ? (
            <Empty>No guarantor has been added yet.</Empty>
          ) : (
            <ul className="mt-2 space-y-2">
              {guarantors.map((g) => (
                <li key={g.id} className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2.5">
                  <i className="fa fa-user-o w-6 text-center text-xl text-gray-400" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-800">{g.name}</div>
                    <div className="text-xs text-gray-500">
                      {g.relationship} · {g.phone}
                    </div>
                  </div>
                  <Pill value={g.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <SectionTitle>{collaterals.length > 1 ? `Collateral (${collaterals.length} assets)` : 'Collateral'}</SectionTitle>
          {!application.collateralRequired ? (
            <Empty>Collateral is not required for this application.</Empty>
          ) : collaterals.length === 0 ? (
            <Empty>No collateral has been added yet.</Empty>
          ) : (
            <>
              <ul className="mt-2 space-y-2">
                {collaterals.map((c) => (
                  <li key={c.id} className="rounded-md border border-gray-200 px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <i className="fa fa-shield w-6 text-center text-xl text-gray-400" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-800">{c.type}</div>
                        <div className="truncate text-xs text-gray-500">
                          {c.description} · {formatTzs(c.value)}
                        </div>
                      </div>
                      <Pill value={c.status} />
                    </div>
                    <div className="mt-2 flex items-center gap-2 border-t border-gray-100 pt-2 text-xs">
                      <i
                        className={`fa fa-file-pdf-o ${c.document ? 'text-gray-400' : 'text-gray-300'}`}
                        aria-hidden="true"
                      />
                      {c.document ? (
                        <>
                          <span className="min-w-0 flex-1 truncate text-gray-600">{c.document}</span>
                          <Button size="compact-xs" variant="subtle" color="brand">
                            View
                          </Button>
                        </>
                      ) : (
                        <span className="text-gray-400">No document uploaded</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
                <span className="text-gray-500">Total value</span>
                <span className="font-medium text-gray-800">
                  {formatTzs(totalValue)}{' '}
                  <span className="text-xs font-normal text-gray-500">
                    ({Math.round((totalValue / application.requestedAmount) * 100)}% of the loan)
                  </span>
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <SectionTitle>Credit assessment</SectionTitle>
        {!application.creditAssessmentRequired ? (
          <Empty>Credit assessment is switched off for this application.</Empty>
        ) : !credit ? (
          <Empty>The credit assessment has not been run yet.</Empty>
        ) : (
          <div className="space-y-3">
            {credit.decision === 'REJECT' && (
              <Alert
                color="red"
                variant="light"
                title="Credit assessment failed"
                icon={<i className="fa fa-times-circle" aria-hidden="true" />}
              >
                <Text size="sm">
                  {shortfall > 0
                    ? `Monthly cash flow of ${formatTzs(credit.cashFlow)} does not cover the estimated installment of ${formatTzs(installment)}. It is short by ${formatTzs(shortfall)}.`
                    : credit.notes}
                </Text>
                <Text size="sm" mt={6}>
                  The application was rejected and did not go to approval.
                </Text>
              </Alert>
            )}
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 py-2.5 text-sm">
                <span className="text-gray-500">Decision</span>
                <Pill value={credit.decision} />
              </div>
              <Field label="Monthly income" value={formatTzs(credit.income)} />
              <Field label="Monthly expenses" value={formatTzs(credit.expenses)} />
              <Field label="Cash flow" value={formatTzs(credit.cashFlow)} />
              <Field label="Est. monthly installment" value={formatTzs(installment)} />
              <Field label="Assessed by" value={credit.assessedBy} />
              <Field label="Notes" value={credit.notes} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function ApprovalsTab({ application }: { application: LoanApplication }) {
  const navigate = useNavigate()
  const approvals = approvalsFor(application)

  // only applications that reached the approval stage appear on the Approvals page
  const inApprovalStage =
    application.status === 'CREDIT_APPROVED' ||
    application.status === 'PENDING_APPROVAL' ||
    (application.status !== 'REJECTED' && RANK[application.status] >= 3)

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionTitle>Approval hierarchy</SectionTitle>
          <p className="mb-3 text-xs text-gray-500">
            Each level must approve in order. A rejection at any level stops the application.
          </p>
        </div>
        {inApprovalStage && (
          <Button
            size="xs"
            radius="xs"
            variant="default"
            leftSection={<i className="fa fa-external-link" aria-hidden="true" />}
            onClick={() => navigate(`/loan-approvals?review=${application.id}`)}
          >
            Open in Approvals
          </Button>
        )}
      </div>

      {!inApprovalStage && (
        <p className="mb-3 text-xs text-gray-400">This application has not reached the approval stage yet.</p>
      )}

      <ul className="space-y-2">
        {approvals.map((a) => (
          <li key={a.levelNo} className="flex items-start gap-3 rounded-md border border-gray-200 px-3 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
              {a.levelNo}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-800">{a.levelName}</div>
              <div className="text-xs text-gray-500">Required role: {a.role}</div>
              {a.by && (
                <div className="mt-1 text-xs text-gray-500">
                  {a.by}
                  {a.comments ? ` · "${a.comments}"` : ''}
                </div>
              )}
            </div>
            <Pill value={a.decision} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ContractTab({ 
    application, onUploadSigned 
      }
    : { 
       application: LoanApplication
       onUploadSigned?: () => void
    }) {
  const contract = contractFor(application)

  if (!contract) {
    return (
      <Empty>
        {application.status === 'APPROVED'
          ? 'The application is approved. Use "Generate contract" to create the contract.'
          : 'A contract is created once the application is approved.'}
      </Empty>
    )
  }

  // 3 means every contract step is done
  const step = { GENERATED: 1, SENT: 2, SIGNED: 3 }[contract.status]

  const hint = {
    GENERATED: 'Next step: send the contract to the borrower by email.',
    SENT: 'Waiting for the borrower to print, sign and return it. Then upload the signed copy.',
    SIGNED:
      application.status === 'LOAN_CREATED'
        ? 'The loan has been created.'
        : 'The signed copy is on file. Next step: create the loan.',
  }[contract.status]

  return (
    <div className="space-y-6">
      <Stepper active={step} size="xs" color="brand">
        <Stepper.Step label="Generated" />
        <Stepper.Step label="Sent" />
        <Stepper.Step label="Signed" />
      </Stepper>

      <Alert color="blue" variant="light" icon={<i className="fa fa-info-circle" aria-hidden="true" />}>
        <Text size="sm">{hint}</Text>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <SectionTitle>Contract</SectionTitle>
          <div className="flex items-center justify-between border-b border-gray-100 py-2.5 text-sm">
            <span className="text-gray-500">Status</span>
            <Pill value={contract.status} />
          </div>
          <Field label="Contract number" value={contract.contractNo} />
          <Field label="Principal" value={formatTzs(application.requestedAmount)} />
          <Field label="Generated" value={dayjs(contract.generated).format('MMM D, YYYY')} />
          <Field
            label="Sent to borrower"
            value={contract.sent ? dayjs(contract.sent).format('MMM D, YYYY') : 'Not yet'}
          />
          <Field
            label="Signed"
            value={contract.signed ? dayjs(contract.signed).format('MMM D, YYYY') : 'Not yet'}
          />
        </div>

        <div>
          <SectionTitle>Documents</SectionTitle>
          <ul className="mt-2 space-y-2">
            <li className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2.5">
              <i className="fa fa-file-pdf-o text-xl text-gray-400" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-800">Loan contract</div>
                <div className="truncate text-xs text-gray-500">{contract.contractNo}.pdf</div>
              </div>
              <Button size="compact-xs" variant="subtle" color="brand">
                Print
              </Button>
            </li>
            {contract.signed ? (
              <li className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2.5">
                <i className="fa fa-file-image-o text-xl text-gray-400" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-800">Signed copy</div>
                  <div className="truncate text-xs text-gray-500">{contract.contractNo}-signed.pdf</div>
                </div>
                <Button size="compact-xs" variant="subtle" color="brand">
                  View
                </Button>
              </li>
            ) : (
                <li className="flex items-center gap-3 rounded-md border border-dashed border-gray-200 px-3 py-2.5">
                    <i className="fa fa-file-image-o text-xl text-gray-300" aria-hidden="true" />
                    <div className="min-w-0 flex-1 text-xs text-gray-500">Signed copy not uploaded yet</div>
                    {contract.status === 'SENT' && (
                    <Button
                        size="compact-xs"
                        radius="xs"
                        leftSection={<i className="fa fa-upload" aria-hidden="true" />}
                        onClick={onUploadSigned}
                    >
                        Upload signed contract
                    </Button>
                    )}
                </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

const scheduleColumns: CustomTableColumn<InstallmentRow>[] = [
  { accessor: 'installmentNo', header: 'No.', width: 70 },
  { accessor: 'dueDate', header: 'Due date', type: 'date' },
  { accessor: 'principal', header: 'Principal', render: (r) => <Text size="sm">{formatTzs(r.principal)}</Text>, exportValue: (r) => r.principal },
  { accessor: 'interest', header: 'Interest', render: (r) => <Text size="sm">{formatTzs(r.interest)}</Text>, exportValue: (r) => r.interest },
  { accessor: 'total', header: 'Installment', render: (r) => <Text size="sm" fw={500}>{formatTzs(r.total)}</Text>, exportValue: (r) => r.total },
  { accessor: 'balance', header: 'Balance', render: (r) => <Text size="sm">{formatTzs(r.balance)}</Text>, exportValue: (r) => r.balance },
]

export function ScheduleTab({ application }: { application: LoanApplication }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        This is an estimate from the requested terms. The real schedule is generated when the loan is
        disbursed.
      </p>
      <CustomTable<InstallmentRow>
        size="sm"
        data={scheduleFor(application)}
        columns={scheduleColumns}
        pagination={false}
        defaultSort={null}
        exportCsv
        exportFileName={`${application.applicationNo}-schedule`}
      />
    </div>
  )
}

export function ActivityTab({ application }: { application: LoanApplication }) {
  return <Timeline application={application} />
}