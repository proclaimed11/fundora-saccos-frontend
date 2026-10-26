import { AppIcon } from '../../components/appIcon'
import { useState } from 'react'
import dayjs from 'dayjs'
import { ActionIcon, Alert, Badge, Button, Modal, NumberInput, Select, Text, TextInput, Textarea } from '@mantine/core'
import { formatTzs } from '../../utils/format'
import { ACCOUNT_TYPE, ACCOUNT_TYPES, type Account } from './accountingData'

export type JournalEntryLine = { accountCode: string; entryType: 'DEBIT' | 'CREDIT'; amount: number }
export type JournalEntryInput = { date: string; description: string; lines: JournalEntryLine[] }

type Props = {
  opened: boolean
  accounts: Account[]
  onClose: () => void
  onSubmit: (input: JournalEntryInput) => void
}

// one row of the entry, an account with either a debit or a credit amount
type DraftLine = { uid: number; accountCode: string | null; debit: number | ''; credit: number | '' }

type Errors = Partial<Record<'date' | 'description' | 'balance', string>>

let nextUid = 1
const blank = (patch: Partial<DraftLine> = {}): DraftLine => ({
  uid: nextUid++,
  accountCode: null,
  debit: '',
  credit: '',
  ...patch,
})

// quick starts for the usual non-loan entries, the account that is not CASH is left for you to choose
const TEMPLATES = [
  { label: 'Expense paid', description: 'Expense paid for ', lines: () => [blank(), blank({ accountCode: 'CASH' })] },
  { label: 'Income received', description: 'Income received from ', lines: () => [blank({ accountCode: 'CASH' }), blank()] },
  { label: 'Reimbursement received', description: 'Reimbursement received for ', lines: () => [blank({ accountCode: 'CASH' }), blank()] },
  { label: 'Fine paid', description: 'Fine paid for ', lines: () => [blank(), blank({ accountCode: 'CASH' })] },
]

const num = (v: number | '') => (v === '' ? 0 : v)
const round2 = (x: number) => Math.round(x * 100) / 100

export function JournalEntryDialog({ opened, accounts, onClose, onSubmit }: Props) {
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [description, setDescription] = useState('')
  const [lines, setLines] = useState<DraftLine[]>(() => [blank(), blank()])
  const [errors, setErrors] = useState<Errors>({})
  const [lineErrors, setLineErrors] = useState<Record<number, string>>({})

  // accounts grouped by type so a long chart is easy to scan
  const accountData = ACCOUNT_TYPES.map((t) => ({
    group: ACCOUNT_TYPE[t].label,
    items: accounts
      .filter((a) => a.accountTypeName === t)
      .sort((a, b) => a.accountNo - b.accountNo)
      .map((a) => ({ value: a.accountCode, label: `${a.accountCode} · ${a.accountName}` })),
  })).filter((g) => g.items.length > 0)

  const totalDebit = round2(lines.reduce((s, l) => s + num(l.debit), 0))
  const totalCredit = round2(lines.reduce((s, l) => s + num(l.credit), 0))
  const difference = round2(totalDebit - totalCredit)
  const balanced = totalDebit > 0 && difference === 0

  const usesLoanAccount = lines.some((l) => l.accountCode === 'LOAN_RECEIVABLE')

  const reset = () => {
    setDate(dayjs().format('YYYY-MM-DD'))
    setDescription('')
    setLines([blank(), blank()])
    setErrors({})
    setLineErrors({})
  }

  const close = () => {
    reset()
    onClose()
  }

  const patchLine = (uid: number, patch: Partial<DraftLine>) => {
    setLines((list) => list.map((l) => (l.uid === uid ? { ...l, ...patch } : l)))
    setLineErrors((e) => ({ ...e, [uid]: '' }))
    setErrors((e) => ({ ...e, balance: undefined }))
  }

  // typing an amount on one side clears the other side of that row.
  // With exactly two rows the other row mirrors it on the opposite side, the usual simple entry.
  const setAmount = (uid: number, side: 'debit' | 'credit', value: number | '') => {
    setLines((list) =>
      list.map((l) => {
        if (l.uid === uid) {
          return side === 'debit'
            ? { ...l, debit: value, credit: value === '' ? l.credit : '' }
            : { ...l, credit: value, debit: value === '' ? l.debit : '' }
        }
        if (list.length === 2) {
          return side === 'debit' ? { ...l, credit: value, debit: '' } : { ...l, debit: value, credit: '' }
        }
        return l
      }),
    )
    setLineErrors((e) => ({ ...e, [uid]: '' }))
    setErrors((e) => ({ ...e, balance: undefined }))
  }

  const addLine = () => setLines((list) => [...list, blank()])
  const removeLine = (uid: number) => setLines((list) => (list.length <= 2 ? list : list.filter((l) => l.uid !== uid)))

  const useTemplate = (t: (typeof TEMPLATES)[number]) => {
    setDescription((d) => (d.trim() ? d : t.description))
    setLines(t.lines())
    setErrors({})
    setLineErrors({})
  }

  const submit = () => {
    const found: Errors = {}
    const lineFound: Record<number, string> = {}

    if (!date) found.date = 'Enter the date of the entry'
    else if (dayjs(date).isAfter(dayjs(), 'day')) found.date = 'The date cannot be in the future'

    if (!description.trim()) found.description = 'Write what this entry is about'

    lines.forEach((l) => {
      if (!l.accountCode) lineFound[l.uid] = 'Select the account'
      else if (num(l.debit) > 0 === num(l.credit) > 0) lineFound[l.uid] = 'Enter either a debit or a credit amount'
    })

    if (Object.keys(lineFound).length === 0 && !balanced) {
      found.balance = 'Total debit and total credit must be equal'
    }

    setErrors(found)
    setLineErrors(lineFound)
    if (Object.keys(found).length > 0 || Object.keys(lineFound).length > 0) return

    // TODO: the API has no endpoint for manual entries yet, /api/gl-workflow only posts disbursements,
    //       payments and write-offs. It needs a new one, for example
    //       POST /api/gl-workflow/manual-entries { date, description, entries: [{ accountId, entryType, amount }] }
    //       and the same checks: balanced, at least two entries, accounts must exist.
    onSubmit({
      date,
      description: description.trim(),
      lines: lines.map((l) => ({
        accountCode: l.accountCode!,
        entryType: num(l.debit) > 0 ? 'DEBIT' : 'CREDIT',
        amount: num(l.debit) > 0 ? num(l.debit) : num(l.credit),
      })),
    })
    reset()
  }

  return (
    <Modal opened={opened} onClose={close} title="New journal entry" size={900} centered>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="light" color="grape" radius="sm" size="sm">
            Category: Other
          </Badge>
          <Text size="xs" c="dimmed">
            For anything that is not about a loan: expenses, fines, reimbursements and other income.
          </Text>
        </div>

        {/* quick starts */}
        <div>
          <Text size="xs" c="dimmed" mb={6}>
            Start from a common entry
          </Text>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <Button key={t.label} type="button" size="compact-xs" variant="light" onClick={() => useTemplate(t)}>
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
          <TextInput
            label="Date"
            type="date"
            size="sm"
            max={dayjs().format('YYYY-MM-DD')}
            value={date}
            onChange={(e) => {
              setDate(e.currentTarget.value)
              setErrors((x) => ({ ...x, date: undefined }))
            }}
            error={errors.date}
          />
          <Textarea
            label="Description"
            description="What this entry is about. It is required for every Other entry."
            placeholder="Office rent paid for October"
            size="sm"
            autosize
            minRows={2}
            value={description}
            onChange={(e) => {
              setDescription(e.currentTarget.value)
              setErrors((x) => ({ ...x, description: undefined }))
            }}
            error={errors.description}
          />
        </div>

        {/* the double entry */}
        <div className="overflow-x-auto">
          <div className="min-w-[640px] rounded-md border border-gray-200">
            <div className="grid grid-cols-[minmax(0,1fr)_150px_150px_36px] gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-gray-500">
              <span>Account</span>
              <span className="text-right">Debit</span>
              <span className="text-right">Credit</span>
              <span />
            </div>

            {lines.map((l) => (
              <div key={l.uid} className="border-b border-gray-100 px-3 py-2 last:border-b-0">
                <div className="grid grid-cols-[minmax(0,1fr)_150px_150px_36px] items-start gap-2">
                  <Select
                    aria-label="Account"
                    placeholder="Select account"
                    size="sm"
                    searchable
                    nothingFoundMessage="No account found"
                    allowDeselect={false}
                    data={accountData}
                    value={l.accountCode}
                    onChange={(v) => patchLine(l.uid, { accountCode: v })}
                  />
                  <NumberInput
                    aria-label="Debit amount"
                    placeholder="0"
                    size="sm"
                    thousandSeparator=","
                    hideControls
                    allowNegative={false}
                    decimalScale={2}
                    value={l.debit}
                    onChange={(v) => setAmount(l.uid, 'debit', v === '' ? '' : Number(v))}
                  />
                  <NumberInput
                    aria-label="Credit amount"
                    placeholder="0"
                    size="sm"
                    thousandSeparator=","
                    hideControls
                    allowNegative={false}
                    decimalScale={2}
                    value={l.credit}
                    onChange={(v) => setAmount(l.uid, 'credit', v === '' ? '' : Number(v))}
                  />
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    disabled={lines.length <= 2}
                    aria-label="Remove line"
                    onClick={() => removeLine(l.uid)}
                  >
                    <AppIcon name="trash" />
                  </ActionIcon>
                </div>
                {lineErrors[l.uid] && <div className="mt-1 text-xs text-red-600">{lineErrors[l.uid]}</div>}
              </div>
            ))}

            <div className="grid grid-cols-[minmax(0,1fr)_150px_150px_36px] items-center gap-2 border-t border-gray-200 bg-gray-50 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Button type="button" size="compact-xs" variant="default" leftSection={<AppIcon name="plus" />} onClick={addLine}>
                  Add line
                </Button>
                {totalDebit > 0 || totalCredit > 0 ? (
                  <Badge variant="light" color={balanced ? 'green' : 'red'} radius="sm" size="sm">
                    {balanced ? 'Balanced' : `Out by ${formatTzs(Math.abs(difference))}`}
                  </Badge>
                ) : null}
              </div>
              <span className="text-right text-sm font-medium text-gray-800">{formatTzs(totalDebit)}</span>
              <span className="text-right text-sm font-medium text-gray-800">{formatTzs(totalCredit)}</span>
              <span />
            </div>
          </div>
        </div>

        {errors.balance && <Text size="sm" c="red">{errors.balance}</Text>}

        {usesLoanAccount && (
          <Alert color="yellow" variant="light" icon={<AppIcon name="triangle-alert" />}>
            <Text size="xs">
              Loan Receivable is posted automatically from loan events (disbursements, payments and write-offs). Use this
              form only for entries that are not about a loan.
            </Text>
          </Alert>
        )}

        <Alert color="blue" variant="light" icon={<AppIcon name="info" />}>
          <Text size="xs">
            This is posted as a transaction of category Other and cannot be edited afterwards. A mistake is fixed with a
            reversing entry. Money is not moved by this system.
          </Text>
        </Alert>

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <Button size="xs" variant="default" onClick={close}>
            Cancel
          </Button>
          <Button size="xs" leftSection={<AppIcon name="check" />} onClick={submit}>
            Post entry
          </Button>
        </div>
      </div>
    </Modal>
  )
}