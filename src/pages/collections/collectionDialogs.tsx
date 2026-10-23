import { AppIcon } from '../../components/appIcon'
import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Modal, Select, SimpleGrid, Text, TextInput, Textarea } from '@mantine/core'
import { formatTzs } from '../../utils/format'
import { CURRENT_USER } from '../loans/disbursementDialog'
import { NPL_STYLE, type LoanView } from '../loans/loanApplicationsData'
import { ACTIVITY_LABEL, COLLECTORS, OUTCOME, type ActivityOutcome, type ActivityType } from './collectionsData'

const TYPE_OPTIONS = (Object.keys(ACTIVITY_LABEL) as ActivityType[]).map((k) => ({
  value: k,
  label: ACTIVITY_LABEL[k],
}))

const OUTCOME_OPTIONS = (Object.keys(OUTCOME) as ActivityOutcome[]).map((k) => ({
  value: k,
  label: OUTCOME[k].label,
}))

/* ---------- log an activity ---------- */

export type ActivityInput = { type: ActivityType; outcome: ActivityOutcome; description: string }

type LogProps = {
  opened: boolean
  caseNo: string
  borrower: string
  onClose: () => void
  onSubmit: (input: ActivityInput) => void
}

type LogErrors = Partial<Record<'outcome' | 'description', string>>

export function LogActivityDialog({ opened, caseNo, borrower, onClose, onSubmit }: LogProps) {
  const [type, setType] = useState<ActivityType>('PHONE_CALL')
  const [outcome, setOutcome] = useState<ActivityOutcome | null>(null)
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<LogErrors>({})

  const reset = () => {
    setType('PHONE_CALL')
    setOutcome(null)
    setDescription('')
    setErrors({})
  }

  const close = () => {
    reset()
    onClose()
  }

  const submit = () => {
    const found: LogErrors = {}
    if (!outcome) found.outcome = 'Select how the contact went'
    if (!description.trim()) found.description = 'Write what was said or done'
    setErrors(found)
    if (Object.keys(found).length > 0 || !outcome) return

    // TODO: POST /api/collections-workflow/cases/{caseId}/activities { activityType, description, performedBy, outcome }
    onSubmit({ type, outcome, description: description.trim() })
    reset()
  }

  return (
    <Modal opened={opened} onClose={close} title="Log activity" centered>
      <div className="space-y-4">
        <Text size="sm">
          Record the contact you made with {borrower} on case <span className="font-medium">{caseNo}</span>.
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Select
            label="Type of contact"
            size="sm"
            data={TYPE_OPTIONS}
            allowDeselect={false}
            value={type}
            onChange={(v) => setType((v as ActivityType | null) ?? 'PHONE_CALL')}
          />
          <Select
            label="Outcome"
            placeholder="How did it go"
            size="sm"
            data={OUTCOME_OPTIONS}
            allowDeselect={false}
            value={outcome}
            onChange={(v) => {
              setOutcome(v as ActivityOutcome | null)
              setErrors((e) => ({ ...e, outcome: undefined }))
            }}
            error={errors.outcome}
          />
        </SimpleGrid>

        <Textarea
          label="What happened"
          placeholder="Reminded the borrower of the overdue installment"
          size="sm"
          autosize
          minRows={3}
          value={description}
          onChange={(e) => {
            setDescription(e.currentTarget.value)
            setErrors((x) => ({ ...x, description: undefined }))
          }}
          error={errors.description}
        />

        <TextInput label="Logged by" description="You, from your session" size="sm" readOnly value={CURRENT_USER} />

        {outcome === 'PAID' && (
          <Alert color="yellow" variant="light" icon={<AppIcon name="triangle-alert" />}>
            <Text size="xs">
              This only logs the conversation. It does not record any money. Record the payment on the Payments page so
              the loan balance updates and the case can be closed.
            </Text>
          </Alert>
        )}

        <div className="flex justify-end gap-2">
          <Button size="xs" variant="default" onClick={close}>
            Cancel
          </Button>
          <Button size="xs" leftSection={<AppIcon name="check" />} onClick={submit}>
            Log activity
          </Button>
        </div>
      </div>
    </Modal>
  )
}

/* ---------- close or escalate (a note is needed) ---------- */

type RemarksProps = {
  opened: boolean
  title: string
  message: string
  confirmLabel: string
  color?: string
  placeholder?: string
  onClose: () => void
  onSubmit: (remarks: string) => void
}

export function RemarksDialog({ opened, title, message, confirmLabel, color, placeholder, onClose, onSubmit }: RemarksProps) {
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState<string>()

  const close = () => {
    setRemarks('')
    setError(undefined)
    onClose()
  }

  const submit = () => {
    if (!remarks.trim()) {
      setError('Add a short note')
      return
    }
    onSubmit(remarks.trim())
    setRemarks('')
    setError(undefined)
  }

  return (
    <Modal opened={opened} onClose={close} title={title} centered>
      <div className="space-y-4">
        <Text size="sm">{message}</Text>
        <Textarea
          label="Remarks"
          placeholder={placeholder}
          size="sm"
          autosize
          minRows={3}
          value={remarks}
          onChange={(e) => {
            setRemarks(e.currentTarget.value)
            setError(undefined)
          }}
          error={error}
        />
        <div className="flex justify-end gap-2">
          <Button size="xs" variant="default" onClick={close}>
            Cancel
          </Button>
          <Button size="xs" color={color} onClick={submit}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

/* ---------- open a case by hand ---------- */

export type OpenCaseInput = { loanId: number; assignedTo: string; remarks: string }

type OpenProps = {
  opened: boolean
  /** loans that are overdue and have no open case */
  loans: LoanView[]
  initialLoanId: number | null
  onClose: () => void
  onSubmit: (input: OpenCaseInput) => void
}

type OpenErrors = Partial<Record<'loan' | 'assignee', string>>

export function OpenCaseDialog({ opened, loans, initialLoanId, onClose, onSubmit }: OpenProps) {
  const [loanId, setLoanId] = useState<string | null>(null)
  const [assignee, setAssignee] = useState<string | null>(CURRENT_USER)
  const [remarks, setRemarks] = useState('')
  const [errors, setErrors] = useState<OpenErrors>({})

  // coming from a row starts with that loan already chosen
  useEffect(() => {
    if (opened) setLoanId(initialLoanId ? String(initialLoanId) : null)
  }, [opened, initialLoanId])

  const loan = loans.find((l) => String(l.id) === loanId)

  const reset = () => {
    setLoanId(null)
    setAssignee(CURRENT_USER)
    setRemarks('')
    setErrors({})
  }

  const close = () => {
    reset()
    onClose()
  }

  const submit = () => {
    const found: OpenErrors = {}
    if (!loan) found.loan = 'Select the overdue loan'
    if (!assignee) found.assignee = 'Select who will follow it up'
    setErrors(found)
    if (Object.keys(found).length > 0 || !loan || !assignee) return

    // TODO: POST /api/collections-workflow/loans/{loanId}/open-case { assignedTo, remarks }
    onSubmit({ loanId: loan.id, assignedTo: assignee, remarks: remarks.trim() })
    reset()
  }

  return (
    <Modal opened={opened} onClose={close} title="Open collection case" centered>
      <div className="space-y-4">
        <Select
          label="Loan"
          description="Only loans that are overdue and have no open case are listed"
          placeholder="Search by borrower or loan number"
          size="sm"
          searchable
          nothingFoundMessage="No overdue loans without a case"
          data={loans.map((l) => ({
            value: String(l.id),
            label: `${l.applicantName} · ${l.loanNo} · ${l.overdueDays} days overdue`,
          }))}
          allowDeselect={false}
          value={loanId}
          onChange={(v) => {
            setLoanId(v)
            setErrors((e) => ({ ...e, loan: undefined }))
          }}
          error={errors.loan}
        />

        {loan && (
          <div className="rounded-md bg-gray-50 px-4 py-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Overdue</span>
              <span className="font-medium text-red-600">{loan.overdueDays} days</span>
            </div>
            <div className="mt-1 flex justify-between gap-4">
              <span className="text-gray-500">Past due</span>
              <span className="font-medium text-gray-800">{formatTzs(loan.overdueAmount)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-4">
              <span className="text-gray-500">Class</span>
              <Badge variant="outline" color={NPL_STYLE[loan.classification].color} radius="sm" size="sm">
                {loan.isNpl ? 'NPL · ' : ''}
                {NPL_STYLE[loan.classification].label}
              </Badge>
            </div>
          </div>
        )}

        <Select
          label="Assigned to"
          description="The collector who follows this case up"
          size="sm"
          data={COLLECTORS}
          allowDeselect={false}
          value={assignee}
          onChange={(v) => {
            setAssignee(v)
            setErrors((e) => ({ ...e, assignee: undefined }))
          }}
          error={errors.assignee}
        />

        <Textarea
          label="Remarks (optional)"
          placeholder="First follow-up call scheduled"
          size="sm"
          autosize
          minRows={2}
          value={remarks}
          onChange={(e) => setRemarks(e.currentTarget.value)}
        />

        <Alert color="blue" variant="light" icon={<AppIcon name="info" />}>
          <Text size="xs">
            The daily job opens a case for every overdue loan on its own at 07:15 UTC. Opening one by hand just does it
            ahead of time. A loan can only have one open case at a time.
          </Text>
        </Alert>

        <div className="flex justify-end gap-2">
          <Button size="xs" variant="default" onClick={close}>
            Cancel
          </Button>
          <Button size="xs" leftSection={<AppIcon name="check" />} onClick={submit}>
            Open case
          </Button>
        </div>
      </div>
    </Modal>
  )
}