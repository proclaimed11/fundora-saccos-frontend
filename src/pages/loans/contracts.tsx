import { AppIcon } from '../../components/appIcon'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { ActionIcon, Alert, Badge, Button, Drawer, Menu, Text } from '@mantine/core'
import { DashboardLayout } from '../../components/layout/dashboardLayout'
import { StatWidget } from '../../components/statsWidgets'
import { CustomTable, type CustomTableColumn } from '../../components/customTable/customTable'
import { formatTzs } from '../../utils/format'
import { ContractConfirmDialog, SignedContractDialog } from './contractDialogs'
import { ContractReviewDialog } from './contractReviewDialog'
import {
  applications,
  contractFor,
  estimateInstallment,
  methodLabel,
  totalRepayable,
  type ContractRow,
  type LoanApplication,
} from './loanApplicationsData'

// our own rule, the API has no deadline: warn when a contract waits longer than this at one stage
const LATE_AFTER_DAYS = 7

const CARD = 'rounded-md bg-white shadow-[0_10px_30px_rgba(76,87,125,0.12)]'

/* ---------- stages ---------- */

type Stage = 'READY' | 'GENERATED' | 'SENT' | 'SIGNED' | 'LOAN'
type DialogKind = 'generate' | 'review' | 'upload' | 'loan'

const STAGES: { key: Stage; label: string; icon: string; color: string; badge: string }[] = [
  { key: 'READY', label: 'Ready to generate', icon: 'file-text', color: '#8e44ad', badge: 'green' },
  { key: 'GENERATED', label: 'To be sent', icon: 'mail', color: '#45bdfc', badge: 'violet' },
  { key: 'SENT', label: 'Awaiting signature', icon: 'hourglass', color: '#e08a1e', badge: 'blue' },
  { key: 'SIGNED', label: 'Signed', icon: 'pen-line', color: '#39d128', badge: 'teal' },
  { key: 'LOAN', label: 'Loan created', icon: 'hand-coins', color: '#0077b5', badge: 'brand' },
]

const STAGE_ORDER = STAGES.map((s) => s.key)
const STAGE = Object.fromEntries(STAGES.map((s) => [s.key, s])) as Record<Stage, (typeof STAGES)[number]>

// the single main action for each stage
const NEXT: Record<Stage, { kind: DialogKind | null; label: string; icon: string; hint: string }> = {
  READY: { kind: 'generate', label: 'Generate contract', icon: 'file-text', hint: 'The application is approved. Generate the contract to continue.' },
  GENERATED: { kind: 'review', label: 'Review and send', icon: 'eye', hint: 'Review the generated contract, then send it to the borrower by email.' },
  SENT: { kind: 'upload', label: 'Upload signed copy', icon: 'upload', hint: 'Waiting for the borrower to sign and return the hard copy. Upload the scan when it arrives.' },
  SIGNED: { kind: 'loan', label: 'Create loan', icon: 'hand-coins', hint: 'The signed copy is on file. Create the loan to move on to disbursement.' },
  LOAN: { kind: null, label: 'View application', icon: 'external-link', hint: 'The loan has been created and is waiting for disbursement. Disburse it to release the money.' },
}

function stageOf(a: LoanApplication): Stage | null {
  if (a.status === 'APPROVED') return 'READY'
  if (a.status === 'LOAN_CREATED') return 'LOAN'
  const c = contractFor(a)
  if (!c) return null
  return c.status === 'SIGNED' ? 'SIGNED' : c.status === 'SENT' ? 'SENT' : 'GENERATED'
}

/* ---------- time helpers ---------- */

const today = () => dayjs().format('YYYY-MM-DD')
const daysSince = (date: string) => dayjs().diff(dayjs(date), 'day')
const ago = (n: number) => (n <= 0 ? 'today' : n === 1 ? 'yesterday' : `${n} days ago`)

// the date the contract entered its current stage
function sinceOf(c: ContractRow | null, stage: Stage): string | null {
  if (!c) return null
  if (stage === 'GENERATED') return c.generated
  if (stage === 'SENT') return c.sent
  if (stage === 'SIGNED') return c.signed
  return null
}

function noteFor(a: LoanApplication, stage: Stage) {
  const c = contractFor(a)
  const since = sinceOf(c, stage)
  const days = since ? daysSince(since) : 0
  const late = stage !== 'LOAN' && !!since && days > LATE_AFTER_DAYS

  switch (stage) {
    case 'READY':
      return { text: 'Approved', sub: 'Contract not created yet', late: false }
    case 'GENERATED':
      return { text: `Generated ${ago(days)}`, sub: 'Not sent yet', late }
    case 'SENT':
      return { text: `Sent ${ago(days)}`, sub: 'Waiting for the signed copy', late }
    case 'SIGNED':
      return { text: `Signed ${ago(days)}`, sub: 'Ready to create the loan', late }
    default:
      return { text: c?.signed ? `Signed ${dayjs(c.signed).format('MMM D, YYYY')}` : 'Signed', sub: 'Loan created', late: false }
  }
}

// a table row: the application plus the two derived values the column filters read
type Row = LoanApplication & { stage: Stage; since: string | null }

// options for the Progress filter
const stageOptions = STAGES.map((s) => ({ value: s.key, label: s.label }))

// the date the contract entered its current stage, read by the Timeline date filter
function timelineDate(a: LoanApplication, stage: Stage): string | null {
  const c = contractFor(a)
  // SAMPLE ONLY: the approval date comes from the approvals API later, this matches the activity timeline
  if (stage === 'READY') return dayjs(a.created).add(2, 'day').format('YYYY-MM-DD')
  if (stage === 'LOAN') return c?.signed ?? null
  return sinceOf(c, stage)
}

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

function StageBadge({ stage }: { stage: Stage }) {
  return (
    <Badge variant="light" color={STAGE[stage].badge} radius="sm" size="sm">
      {STAGE[stage].label}
    </Badge>
  )
}

// three dots: generated, sent, signed
function Dots({ stage }: { stage: Stage }) {
  const done = { READY: 0, GENERATED: 1, SENT: 2, SIGNED: 3, LOAN: 3 }[stage]
  const labels = ['Generated', 'Sent', 'Signed']
  return (
    <div className="flex items-center" aria-hidden="true">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center">
          <span title={label} className={`h-2.5 w-2.5 rounded-full ${i < done ? 'bg-brand' : 'bg-gray-200'}`} />
          {i < labels.length - 1 && <span className={`h-0.5 w-6 ${i < done - 1 ? 'bg-brand' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  )
}

/* ---------- review drawer ---------- */

type DrawerBodyProps = {
  application: LoanApplication
  onAct: (a: LoanApplication) => void
  onPreview: (a: LoanApplication) => void
  onOpenApplication: (a: LoanApplication) => void
  onDisburse: (a: LoanApplication) => void
}

function DrawerBody({ application: a, onAct, onPreview, onOpenApplication, onDisburse }: DrawerBodyProps) {
  const [copied, setCopied] = useState(false)
  const stage = stageOf(a)
  const contract = contractFor(a)
  if (!stage) return null

  const next = NEXT[stage]
  const installment = Math.round(estimateInstallment(a))
  // SAMPLE ONLY: the real link comes from the API
  const link = contract ? `${window.location.origin}/verify/${contract.contractNo}` : ''

  const doneCount = { READY: 1, GENERATED: 2, SENT: 3, SIGNED: 4, LOAN: 5 }[stage]
  const steps = [
    { label: 'Application approved', date: null as string | null },
    { label: 'Contract generated', date: contract?.generated ?? null },
    { label: 'Sent to borrower', date: contract?.sent ?? null },
    { label: 'Signed copy uploaded', date: contract?.signed ?? null },
    { label: 'Loan created', date: null as string | null },
  ]

  const copy = () => {
    navigator.clipboard?.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tiles = [
    { label: 'Principal', value: formatTzs(a.requestedAmount) },
    { label: 'Est. monthly installment', value: formatTzs(installment) },
    { label: 'Est. total repayable', value: formatTzs(Math.round(totalRepayable(a))) },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <StageBadge stage={stage} />
        <Text size="xs" c="dimmed">
          {contract?.contractNo ?? a.applicationNo} · Loan officer {a.loanOfficer}
        </Text>
      </div>

      {/* what to do next */}
      <div className="rounded-md border border-green-200 bg-green-50/60 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-green-800">Next step</div>
        <p className="mt-1 text-sm text-gray-700">{next.hint}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="xs"
            radius="xs"
            variant={next.kind ? 'filled' : 'default'}
            leftSection={<AppIcon name={next.icon} />}
            onClick={() => onAct(a)}
          >
            {next.label}
          </Button>
          {stage === 'LOAN' && (
            <Button
              size="xs"
              radius="xs"
              leftSection={<AppIcon name="banknote" />}
              onClick={() => onDisburse(a)}
            >
              Disburse
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-md bg-gray-50 px-4 py-3">
            <div className="text-xs text-gray-500">{t.label}</div>
            <div className="text-base font-medium text-gray-800">{t.value}</div>
          </div>
        ))}
      </div>

      {/* progress */}
      <div>
        <SectionTitle>Progress</SectionTitle>
        <ol className="mt-2">
          {steps.map((s, i) => {
            const done = i < doneCount
            const current = i === doneCount && stage !== 'LOAN'
            return (
              <li key={s.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                      done
                        ? 'bg-brand text-white'
                        : current
                          ? 'border-2 border-brand bg-white text-brand'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {done ? <AppIcon name="check" /> : i + 1}
                  </span>
                  {i < steps.length - 1 && (
                    <span className={`my-1 w-px flex-1 ${i < doneCount - 1 ? 'bg-brand' : 'bg-gray-200'}`} />
                  )}
                </div>
                <div className="flex flex-1 items-start justify-between gap-3 pb-4">
                  <span className={`text-sm ${done || current ? 'font-medium text-gray-800' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                  <span className="shrink-0 text-xs text-gray-400">
                    {done && s.date ? dayjs(s.date).format('MMM D, YYYY') : current ? 'Next' : ''}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      <div>
        <SectionTitle>Contract details</SectionTitle>
        <Field label="Contract number" value={contract?.contractNo ?? 'Not created yet'} />
        <Field label="Application" value={a.applicationNo} />
        <Field label="Interest" value={`${a.interestRate}% per year · ${methodLabel(a.interestMethod)}`} />
        <Field label="Tenure" value={`${a.tenure} months`} />
        <Field label="Penalty rate" value={`${a.penaltyRate}%`} />
      </div>

      {contract && (
        <div>
          <SectionTitle>Documents</SectionTitle>
          <ul className="mt-2 space-y-2">
            <li className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2.5">
              <AppIcon name="file-text" className="text-xl text-gray-400"  size={20} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-800">Loan contract</div>
                <div className="truncate text-xs text-gray-500">{contract.contractNo}.pdf</div>
              </div>
              <Button
                size="compact-xs"
                variant="subtle"
                color="brand"
                leftSection={<AppIcon name="eye" />}
                onClick={() => onPreview(a)}
              >
                Preview
              </Button>
              <Button size="compact-xs" variant="subtle" color="brand" leftSection={<AppIcon name="printer" />}>
                Print
              </Button>
            </li>
            {contract.signed ? (
              <li className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2.5">
                <AppIcon name="file-image" className="text-xl text-gray-400"  size={20} />
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
                <AppIcon name="file-image" className="text-xl text-gray-300"  size={20} />
                <div className="min-w-0 flex-1 text-xs text-gray-500">Signed copy not uploaded yet</div>
              </li>
            )}
          </ul>

          <div className="mt-3 rounded-md bg-gray-50 px-3 py-2.5">
            <div className="text-xs text-gray-500">Verification link</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-xs text-gray-700">{link}</span>
              <Button
                size="compact-xs"
                variant={copied ? 'light' : 'default'}
                color={copied ? 'green' : undefined}
                leftSection={<AppIcon name={copied ? 'check' : 'clipboard'} />}
                onClick={copy}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div className="mt-1 text-[11px] text-gray-400">Anyone with the link can check whether this contract is signed.</div>
          </div>
        </div>
      )}

      <Button
        size="xs"
        radius="xs"
        variant="default"
        leftSection={<AppIcon name="external-link" />}
        onClick={() => onOpenApplication(a)}
      >
        View full application
      </Button>
    </div>
  )
}

/* ---------- page ---------- */

type Notice = { text: string; next?: { label: string; kind: DialogKind; id: number } } | null
type DialogState = { kind: DialogKind; id: number } | null

export function ContractsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()

  // arriving from the Approvals page after the final approval
  const approvedId = (location.state as { approvedId?: number } | null)?.approvedId

  const [filter, setFilter] = useState<Stage | 'ALL'>('ALL')
  const [dialog, setDialog] = useState<DialogState>(null)
  // UI only: actions change the contracts for this session, nothing is saved yet
  const [overrides, setOverrides] = useState<Record<number, Partial<LoanApplication>>>(() =>
    approvedId ? { [approvedId]: { status: 'APPROVED' } } : {},
  )
  const [notice, setNotice] = useState<Notice>(() => {
    const approved = applications.find((a) => a.id === approvedId)
    return approved ? { text: `${approved.applicantName}'s application is approved. Generate the contract to continue.` } : null
  })

  const all = useMemo(() => applications.map((a) => ({ ...a, ...overrides[a.id] })), [overrides])
  const items = useMemo(() => all.filter((a) => stageOf(a) !== null), [all])

  const counts = Object.fromEntries(
    STAGES.map((s) => [s.key, items.filter((a) => stageOf(a) === s.key).length]),
  ) as Record<Stage, number>

  // contracts that have waited too long at one stage and need a nudge
  const lateSent = items.filter((a) => stageOf(a) === 'SENT' && noteFor(a, 'SENT').late)

  const visible = useMemo(() => {
    const list = filter === 'ALL' ? items : items.filter((a) => stageOf(a) === filter)
    return [...list].sort(
      (x, y) =>
        STAGE_ORDER.indexOf(stageOf(x)!) - STAGE_ORDER.indexOf(stageOf(y)!) || x.created.localeCompare(y.created),
    )
  }, [items, filter])

  const rows = useMemo<Row[]>(
  () =>
    visible.map((a) => {
      const stage = stageOf(a)!
      return { ...a, stage, since: timelineDate(a, stage) }
    }),
  [visible],
)

  // /loan-contracts?contract=9 opens the drawer for application 9
  const openId = params.get('contract')
  const selected = openId ? (items.find((a) => String(a.id) === openId) ?? null) : null
  const open = (a: LoanApplication) => setParams({ contract: String(a.id) }, { replace: true })
  const close = () => setParams({}, { replace: true })

  // success banners fade away on their own
  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 9000)
    return () => clearTimeout(t)
  }, [notice])

  const patch = (id: number, p: Partial<LoanApplication>) =>
    setOverrides((o) => ({ ...o, [id]: { ...o[id], ...p } }))

  // keep the new stage in view when a stage filter is on
  const follow = (stage: Stage) => setFilter((f) => (f === 'ALL' ? f : stage))

  // the main button of a row or the drawer
  const act = (a: LoanApplication) => {
    const stage = stageOf(a)
    if (!stage) return
    const kind = NEXT[stage].kind
    if (kind) setDialog({ kind, id: a.id })
    else navigate(`/loan-applications/${a.id}`)
  }

  // Loan created -> open the Loans page with the disburse dialog for this application
const disburse = (a: LoanApplication) =>
  navigate(`/loan-disbursements?disburse=${a.id}`, { state: { createdId: a.id } })

  const dialogApp = dialog ? all.find((a) => a.id === dialog.id) : undefined

  const complete = () => {
    if (!dialog || !dialogApp) return
    const { kind, id } = dialog
    const name = dialogApp.applicantName

    if (kind === 'generate') {
      // TODO: POST /api/loan-origination/applications/{applicationId}/generate-contract
      patch(id, { status: 'CONTRACT_GENERATED', contractSentAt: null, contractSignedAt: null })
      setNotice({
        text: `Contract generated for ${name}. Review it before sending.`,
        next: { label: 'Review and send', kind: 'review', id },
      })
      follow('GENERATED')
      // open the review window straight away
      setDialog({ kind: 'review', id })
      return
    }

    if (kind === 'review') {
      // TODO: POST /api/loan-origination/contracts/{contractId}/send
      patch(id, { contractSentAt: today() })
      setNotice({ text: `Contract sent to ${name}. It now shows as awaiting signature.` })
      follow('SENT')
    } else if (kind === 'upload') {
      // TODO: POST /api/loan-origination/contracts/{contractId}/sign (multipart file)
      patch(id, { status: 'CONTRACT_SIGNED', contractSignedAt: today() })
      setNotice({ text: `Signed contract uploaded for ${name}.`, next: { label: 'Create loan', kind: 'loan', id } })
      follow('SIGNED')
    } else {
      // TODO: POST /api/loan-origination/contracts/{contractId}/create-loan
      patch(id, { status: 'LOAN_CREATED' })
      setNotice({ text: `Loan created for ${name}. It is now waiting for disbursement.` })
      follow('LOAN')
    }
    setDialog(null)
  }

  const confirm =
    dialogApp && dialog && (dialog.kind === 'generate' || dialog.kind === 'loan')
      ? {
          generate: {
            title: 'Generate contract',
            message: `Create the loan contract for ${dialogApp.applicantName} using ${formatTzs(dialogApp.requestedAmount)} at ${dialogApp.interestRate}% a year over ${dialogApp.tenure} months?`,
            label: 'Generate',
          },
          loan: {
            title: 'Create loan',
            message: 'Create the loan from the signed contract? It will then wait for disbursement.',
            label: 'Create loan',
          },
        }[dialog.kind]
      : null

  const columns: CustomTableColumn<Row>[] = [
    {
      accessor: 'applicantName',
      header: 'Borrower',
      render: (a) => (
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-gray-800">{a.applicantName}</div>
          <div className="truncate text-xs text-gray-500">{contractFor(a)?.contractNo ?? a.applicationNo}</div>
        </div>
      ),
      exportValue: (a) => `${a.applicantName} (${contractFor(a)?.contractNo ?? a.applicationNo})`,
    },
    {
      accessor: 'requestedAmount',
      header: 'Amount',
      render: (a) => (
        <div>
          <div className="whitespace-nowrap text-sm font-medium text-gray-800">{formatTzs(a.requestedAmount)}</div>
          <div className="text-xs text-gray-500">
            {a.tenure} months · {methodLabel(a.interestMethod)}
          </div>
        </div>
      ),
      exportValue: (a) => a.requestedAmount,
    },
    {
      accessor: 'stage', // was 'status', the filter now reads the stage you display
      header: 'Progress',
      sortable: false,
      render: (a) => (
        <div className="space-y-1.5">
          <Dots stage={a.stage} />
          <StageBadge stage={a.stage} />
        </div>
      ),
      exportValue: (a) => STAGE[a.stage].label,
    },
    {
      accessor: 'since', // was 'contractSentAt', the filter now reads the date shown in the cell
      header: 'Timeline',
      sortable: false,
      render: (a) => {
        const n = noteFor(a, a.stage)
        return (
          <div>
            <div className={`whitespace-nowrap text-sm ${n.late ? 'font-medium text-amber-600' : 'text-gray-800'}`}>
              {n.late && <AppIcon name="triangle-alert" className="mr-1" />}
              {n.text}
            </div>
            <div className="whitespace-nowrap text-xs text-gray-500">{n.sub}</div>
          </div>
        )
      },
      exportValue: (a) => noteFor(a, a.stage).text,
    },
    {
      // the ⋮ menu holds every action; "id" is only used as the accessor
      accessor: 'id',
      header: 'Actions',
      sortable: false,
      align: 'right',
      width: 80,
      render: (a) => {
        const stage = stageOf(a)!
        const next = NEXT[stage]
        return (
          // stop the click so the row doesn't also open the drawer
          <div onClick={(e) => e.stopPropagation()}>
            <Menu position="bottom-end" shadow="md" width={220}>
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  aria-label={`Actions for ${a.applicationNo}`}
                >
                  <AppIcon name="ellipsis-vertical" />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                {/* the main action for this stage */}
                <Menu.Item
                  fw={500}
                  leftSection={<AppIcon name={next.icon} />}
                  onClick={() => act(a)}
                >
                  {next.label}
                </Menu.Item>

                {/* only once the loan is created */}
                {stage === 'LOAN' && (
                  <Menu.Item
                    fw={500}
                    leftSection={<AppIcon name="banknote" />}
                    onClick={() => disburse(a)}
                  >
                    Disburse
                  </Menu.Item>
                )}

                <Menu.Divider />

                <Menu.Item
                  leftSection={<AppIcon name="eye" />}
                  onClick={() => open(a)}
                >
                  View details
                </Menu.Item>

                {/* a contract exists from the "To be sent" stage onward */}
                {stage !== 'READY' && (
                  <Menu.Item
                    leftSection={<AppIcon name="file-text" />}
                    onClick={() => setDialog({ kind: 'review', id: a.id })}
                  >
                    Preview contract
                  </Menu.Item>
                )}

                {/* at the Loan created stage the main action already opens the application */}
                {next.kind && (
                  <Menu.Item
                    leftSection={<AppIcon name="external-link" />}
                    onClick={() => navigate(`/loan-applications/${a.id}`)}
                  >
                    View application
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          </div>
        )
      },
    },
  ]

  return (
    <DashboardLayout
      title="Contracts"
      subtitle="Generate, send and collect signed loan contracts"
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Loans' }, { label: 'Contracts' }]}
    >
      <div className="space-y-4">
        {/* success banner with a shortcut to the next step */}
        {notice && (
          <Alert
            color="green"
            variant="light"
            withCloseButton
            onClose={() => setNotice(null)}
            icon={<AppIcon name="circle-check" />}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Text size="sm">{notice.text}</Text>
              {notice.next && (
                <Button
                  size="compact-xs"
                  radius="xs"
                  onClick={() => {
                    setDialog({ kind: notice.next!.kind, id: notice.next!.id })
                    setNotice(null)
                  }}
                >
                  {notice.next.label}
                </Button>
              )}
            </div>
          </Alert>
        )}

        {/* contracts waiting too long for a signature */}
        {lateSent.length > 0 && (
          <Alert color="yellow" variant="light" icon={<AppIcon name="triangle-alert" />}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Text size="sm">
                {lateSent.length} {lateSent.length === 1 ? 'contract has' : 'contracts have'} been waiting for a
                signature for over {LATE_AFTER_DAYS} days.
              </Text>
              <Button size="compact-xs" radius="xs" variant="default" onClick={() => setFilter('SENT')}>
                Show them
              </Button>
            </div>
          </Alert>
        )}

        {/* the pipeline: counts and filters in one, click a card to filter the table */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {STAGES.map((s) => (
            <div key={s.key} className={`rounded-md transition ${filter === s.key ? 'ring-2 ring-brand' : ''}`}>
              <StatWidget
                value={counts[s.key]}
                label={s.label}
                icon={s.icon}
                color={s.color}
              />
            </div>
          ))}
        </div>

        {/* the table */}
        <div className={`${CARD} p-4`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <Text size="sm" fw={600}>
              {filter === 'ALL' ? 'All contracts' : STAGE[filter].label}
              <span className="ml-2 font-normal text-gray-400">{visible.length}</span>
            </Text>
            {filter !== 'ALL' && (
              <Button size="compact-xs" variant="subtle" color="gray" onClick={() => setFilter('ALL')}>
                Show all stages
              </Button>
            )}
          </div>

          <CustomTable<Row>
            size="md"
            data={rows}                       // was `visible`
            columns={columns}
            filters={{ stage: stageOptions, since: 'date' }}   // new
            searchInput
            searchPlaceholder="Search borrower or application"
            searchKeys={['applicationNo', 'applicantName', 'loanOfficer']}
            defaultSort={null}
            noRecordText="No contracts in this stage"
            onRowClick={(row) => open(row)}
            exportCsv
            exportFileName="contracts"
            print
            printTitle="Contracts"
          />
        </div>
      </div>

      {/* review drawer */}
      <Drawer opened={!!selected} onClose={close} position="right" size="lg" title={selected?.applicantName ?? ''}>
        {selected && (
          <DrawerBody
            application={selected}
            onAct={act}
            onPreview={(a) => setDialog({ kind: 'review', id: a.id })}
            onOpenApplication={(a) => navigate(`/loan-applications/${a.id}`)}
            onDisburse={disburse}
          />
        )}
      </Drawer>

      {/* generate and create loan share one confirm dialog */}
      <ContractConfirmDialog
        opened={!!confirm}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={confirm?.label ?? ''}
        onClose={() => setDialog(null)}
        onConfirm={complete}
      />

      {/* the contract review window, sending happens from here */}
      <ContractReviewDialog
        opened={dialog?.kind === 'review'}
        application={dialogApp ?? null}
        canSend={!!dialogApp && stageOf(dialogApp) === 'GENERATED'}
        onClose={() => setDialog(null)}
        onSend={complete}
      />

      <SignedContractDialog
        opened={dialog?.kind === 'upload'}
        contractNo={dialogApp ? (contractFor(dialogApp)?.contractNo ?? '') : ''}
        onClose={() => setDialog(null)}
        onUploaded={complete}
      />
    </DashboardLayout>
  )
}