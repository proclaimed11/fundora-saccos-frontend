import { AppIcon } from '../../components/appIcon'
import { useState } from 'react'
import dayjs from 'dayjs'
import { Alert, Button, Modal, NumberInput, Select, SimpleGrid, Text, TextInput } from '@mantine/core'
import { formatTzs } from '../../utils/format'
import { CURRENT_USER, JournalPreview } from './disbursementDialog'
import {
  COMPANY_ACCOUNTS,
  METHOD_LABEL,
  allocatePayment,
  paymentJournalFor,
  type LoanView,
  type PaymentMethod,
} from './loanApplicationsData'

export type PaymentInput = { amount: number; method: PaymentMethod; reference: string; receivedBy: string }

type Props = {
  opened: boolean
  loan: LoanView | null
  /** references already recorded, a reference can only be used once */
  usedReferences: string[]
  onClose: () => void
  onSubmit: (input: PaymentInput) => void
}

type Errors = Partial<Record<'amount' | 'reference' | 'account', string>>

const METHOD_OPTIONS = (Object.keys(METHOD_LABEL) as PaymentMethod[]).map((k) => ({
  value: k,
  label: METHOD_LABEL[k],
}))

const n = (x: number) => (x === 0 ? '—' : x.toLocaleString('en-US'))

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-800">{value}</span>
    </div>
  )
}

export function PaymentDialog({ opened, loan: v, usedReferences, onClose, onSubmit }: Props) {
  const [amount, setAmount] = useState<number | ''>('')
  const [method, setMethod] = useState<PaymentMethod>('MOBILE_MONEY')
  const [accountId, setAccountId] = useState<string | null>(null)
  const [reference, setReference] = useState('')
  const [errors, setErrors] = useState<Errors>({})

  if (!v) return <Modal opened={false} onClose={onClose} />

  // the preview never goes past the balance, a bigger amount is rejected on submit
  const preview = amount !== '' && amount > 0 ? allocatePayment(Math.min(amount, v.outstanding), v.installments) : null
  const allocated = preview ? preview.allocations.reduce((s, a) => s + a.penalty + a.interest + a.principal, 0) : 0
  const remaining = v.outstanding - allocated

  // the company accounts that match the chosen payment method (where the money comes IN)
  const accountOptions = COMPANY_ACCOUNTS.filter((a) => a.method === method).map((a) => ({
    value: String(a.id),
    label: a.name,
  }))
  const account = COMPANY_ACCOUNTS.find((a) => String(a.id) === accountId)

  // how the payment splits into penalty, interest and principal, used for the journal entry
  const split = preview
    ? {
        penalty: preview.allocations.reduce((s, a) => s + a.penalty, 0),
        interest: preview.allocations.reduce((s, a) => s + a.interest, 0),
        principal: preview.allocations.reduce((s, a) => s + a.principal, 0),
      }
    : null
  const journal = split ? paymentJournalFor(split, account) : []

  // quick amounts so the cashier doesn't have to work them out
  const shortcuts = [
    v.next && { label: 'Next installment', value: v.next.outstanding },
    v.overdueAmount > 0 && { label: 'Past due', value: v.overdueAmount },
    { label: 'Full balance', value: v.outstanding },
  ].filter((s): s is { label: string; value: number } => !!s)

  const reset = () => {
    setAmount('')
    setMethod('MOBILE_MONEY')
    setAccountId(null)
    setReference('')
    setErrors({})
  }

  const close = () => {
    reset()
    onClose()
  }

  const submit = () => {
    const found: Errors = {}
    const ref = reference.trim()

    if (amount === '' || amount <= 0) found.amount = 'Amount must be greater than zero'
    else if (amount > v.outstanding) {
      // the API accepts it but keeps no record of the extra money, so it is stopped here
      found.amount = `More than the outstanding balance of ${formatTzs(v.outstanding)}`
    }

    if (!account) found.account = 'Select the account the money was received into'

    if (method !== 'CASH' && !ref) found.reference = 'Enter the transaction reference'
    else if (ref && usedReferences.some((r) => r.toLowerCase() === ref.toLowerCase())) {
      found.reference = 'This reference is already recorded'
    }

    setErrors(found)
    if (Object.keys(found).length > 0 || amount === '') return

    // TODO: the "received into" account is not in the payment API yet, the ledger entry for the
    //       payment would be posted from the response (see the GL posting endpoints)
    onSubmit({ amount, method, reference: ref, receivedBy: CURRENT_USER })
    reset()
  }

  return (
    <Modal opened={opened} onClose={close} title="Record payment" size={940} centered>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* the form */}
        <div className="space-y-4">
          <div>
            <NumberInput
              label="Amount received"
              placeholder="472,798"
              size="sm"
              prefix="TZS "
              thousandSeparator=","
              hideControls
              allowNegative={false}
              value={amount}
              onChange={(val) => {
                setAmount(val === '' ? '' : Number(val))
                setErrors((e) => ({ ...e, amount: undefined }))
              }}
              error={errors.amount}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {shortcuts.map((s) => (
                <Button
                  key={s.label}
                  type="button"
                  size="compact-xs"
                  variant="light"
                  onClick={() => {
                    setAmount(s.value)
                    setErrors((e) => ({ ...e, amount: undefined }))
                  }}
                >
                  {s.label} · {formatTzs(s.value)}
                </Button>
              ))}
            </div>
          </div>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Select
              label="Payment method"
              size="sm"
              data={METHOD_OPTIONS}
              allowDeselect={false}
              value={method}
              onChange={(val) => {
                setMethod((val as PaymentMethod) ?? 'MOBILE_MONEY')
                // the accounts depend on the method, so the choice starts again
                setAccountId(null)
                setErrors((e) => ({ ...e, reference: undefined, account: undefined }))
              }}
            />
            <Select
              label="Received into"
              description="The company account the money came into"
              placeholder="Select account"
              size="sm"
              allowDeselect={false}
              data={accountOptions}
              value={accountId}
              onChange={(val) => {
                setAccountId(val)
                setErrors((e) => ({ ...e, account: undefined }))
              }}
              error={errors.account}
            />
            <TextInput
              label={method === 'CASH' ? 'Reference (optional for cash)' : 'Transaction reference'}
              placeholder="PMT-00045"
              size="sm"
              value={reference}
              onChange={(e) => {
                setReference(e.currentTarget.value)
                setErrors((x) => ({ ...x, reference: undefined }))
              }}
              error={errors.reference}
            />
            <TextInput
              label="Payment date"
              description="The system records today's date"
              size="sm"
              readOnly
              value={dayjs().format('MMM D, YYYY')}
            />
            <TextInput label="Received by" description="You, from your session" size="sm" readOnly value={CURRENT_USER} />
          </SimpleGrid>

          <Alert color="blue" variant="light" icon={<AppIcon name="info" />}>
            <Text size="xs">
              The money goes to the oldest unpaid installment first. Inside each installment it pays the penalty, then
              the interest, then the principal. This only records the payment, no money is moved by this system.
            </Text>
          </Alert>
        </div>

        {/* what will happen */}
        <div className="space-y-4">
          <div>
            <Text size="sm" fw={600} mb={4}>
              Loan
            </Text>
            <Row label="Borrower" value={v.applicantName} />
            <Row label="Loan" value={v.loanNo} />
            <Row label="Outstanding" value={formatTzs(v.outstanding)} />
            {v.overdueAmount > 0 && <Row label="Past due" value={formatTzs(v.overdueAmount)} />}
            {v.next && (
              <Row
                label="Next due"
                value={`${dayjs(v.next.dueDate).format('MMM D, YYYY')} · ${formatTzs(v.next.outstanding)}`}
              />
            )}
          </div>

          <div>
            <Text size="sm" fw={600} mb={4}>
              How this payment is applied
            </Text>

            {!preview ? (
              <div className="rounded-md border border-dashed border-gray-200 px-3 py-5 text-center text-xs text-gray-500">
                Enter an amount to see which installments it clears.
              </div>
            ) : (
              <div className="rounded-md border border-gray-200">
                <div className="grid grid-cols-[minmax(0,1fr)_62px_62px_62px] gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                  <span>Installment</span>
                  <span className="text-right">Penalty</span>
                  <span className="text-right">Interest</span>
                  <span className="text-right">Principal</span>
                </div>
                {preview.allocations.map((a) => {
                  const s = v.installments.find((i) => i.installmentNo === a.installmentNo)!
                  const cleared = s.outstanding - (a.penalty + a.interest + a.principal) <= 0
                  return (
                    <div
                      key={a.installmentNo}
                      className="grid grid-cols-[minmax(0,1fr)_62px_62px_62px] gap-2 border-b border-gray-100 px-3 py-2 text-xs last:border-b-0"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-gray-800">
                          #{a.installmentNo} · {dayjs(s.dueDate).format('MMM D')}
                        </div>
                        <div className={cleared ? 'text-green-600' : 'text-amber-600'}>
                          {cleared ? 'Cleared' : 'Partly paid'}
                        </div>
                      </div>
                      <span className="text-right text-gray-800">{n(a.penalty)}</span>
                      <span className="text-right text-gray-800">{n(a.interest)}</span>
                      <span className="text-right text-gray-800">{n(a.principal)}</span>
                    </div>
                  )
                })}
                <div className="border-t border-gray-100 px-3 py-1.5 text-[11px] text-gray-400">Amounts in TZS</div>
              </div>
            )}
          </div>

          {/* the ledger entry this payment will create */}
          <div>
            <Text size="sm" fw={600} mb={4}>
              Journal entry
            </Text>
            {journal.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-200 px-3 py-5 text-center text-xs text-gray-500">
                Enter an amount to see the ledger entry.
              </div>
            ) : (
              <>
                <JournalPreview lines={journal} />
                <Text size="xs" c="dimmed" mt={6}>
                  The money comes into your account (debit). What the borrower owes goes down (credit): principal
                  reduces the loan receivable, interest and penalty are recorded as income.
                </Text>
              </>
            )}
          </div>

          {preview && (
            <div className="rounded-md bg-gray-50 px-4 py-3">
              <div className="text-xs text-gray-500">Outstanding after this payment</div>
              <div className="text-lg font-medium text-gray-800">{formatTzs(remaining)}</div>
            </div>
          )}

          {preview && remaining === 0 && (
            <Alert color="green" variant="light" icon={<AppIcon name="circle-check" />}>
              <Text size="xs">This clears every installment, so the loan will be closed.</Text>
            </Alert>
          )}
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-4">
        <Button size="xs" variant="default" onClick={close}>
          Cancel
        </Button>
        <Button
          size="xs"
          leftSection={<AppIcon name="check" />}
          onClick={submit}
        >
          Record payment
        </Button>
      </div>
    </Modal>
  )
}