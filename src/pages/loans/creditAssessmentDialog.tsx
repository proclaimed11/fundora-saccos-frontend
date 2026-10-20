import { useState } from 'react'
import { Button, Checkbox, Modal, NumberInput, SimpleGrid, Text, Textarea } from '@mantine/core'
import { formatTzs } from '../../utils/format'
import type { CreditRow } from './loanApplicationsData'

export type CreditResult = Omit<CreditRow, 'assessedBy'>

type Props = {
  opened: boolean
  /** false when the application was submitted with credit assessment switched off */
  required: boolean
  applicantName: string
  /** estimated monthly installment, shown next to the cash flow */
  installment: number
  onClose: () => void
  /** null means the check was switched off, so it was skipped */
  onDone: (result: CreditResult | null) => void
}

type FieldErrors = { income?: string; expenses?: string }

export function CreditAssessmentDialog({
  opened,
  required,
  applicantName,
  installment,
  onClose,
  onDone,
}: Props) {
  const [income, setIncome] = useState<number | ''>('')
  const [expenses, setExpenses] = useState<number | ''>('')
  const [hasPending, setHasPending] = useState(false)
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})

  const cashFlow = income !== '' && expenses !== '' ? income - expenses : null

  const reset = () => {
    setIncome('')
    setExpenses('')
    setHasPending(false)
    setNotes('')
    setErrors({})
  }

  const close = () => {
    reset()
    onClose()
  }

  const run = () => {
    if (!required) {
      // TODO: POST /api/loan-origination/applications/{applicationId}/credit-assessment { assessedBy, notes }
      reset()
      onDone(null)
      return
    }

    const found: FieldErrors = {}
    if (income === '' || income <= 0) found.income = 'Enter the monthly income'
    if (expenses === '' || expenses < 0) found.expenses = 'Enter the monthly expenses'
    setErrors(found)
    if (income === '' || expenses === '' || Object.keys(found).length > 0) return

    const flow = income - expenses
    // TODO: POST /api/loan-origination/applications/{applicationId}/credit-assessment
    //       { income, expenses, hasPendingPayments: hasPending, assessedBy, notes }
    // The API returns the decision. This placeholder approves when the cash flow covers the
    // estimated installment, replace it with the decision from the response.
    const decision = flow >= installment ? 'APPROVE' : 'REJECT'
    reset()
    onDone({ decision, income, expenses, cashFlow: flow, notes })
  }

  return (
    <Modal opened={opened} onClose={close} title="Credit assessment" centered>
      <div className="space-y-4">
        {required ? (
          <>
            <Text size="sm">
              Enter {applicantName}'s monthly figures. Existing debts are included automatically.
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <NumberInput
                label="Monthly income"
                size="sm"
                prefix="TZS "
                thousandSeparator=","
                hideControls
                allowNegative={false}
                value={income}
                onChange={(v) => {
                  setIncome(v === '' ? '' : Number(v))
                  setErrors((e) => ({ ...e, income: undefined }))
                }}
                error={errors.income}
              />
              <NumberInput
                label="Monthly expenses"
                size="sm"
                prefix="TZS "
                thousandSeparator=","
                hideControls
                allowNegative={false}
                value={expenses}
                onChange={(v) => {
                  setExpenses(v === '' ? '' : Number(v))
                  setErrors((e) => ({ ...e, expenses: undefined }))
                }}
                error={errors.expenses}
              />
            </SimpleGrid>
            <Checkbox
              label="Applicant has pending payments"
              checked={hasPending}
              onChange={(e) => setHasPending(e.currentTarget.checked)}
            />
          </>
        ) : (
          <Text size="sm">
            Credit assessment is switched off for this application, so no income or expenses are needed.
            Continue to approval for {applicantName}?
          </Text>
        )}

        <Textarea
          label="Notes (optional)"
          size="sm"
          autosize
          minRows={2}
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
        />

        {required && (
          <div className="grid grid-cols-2 gap-3 rounded-md bg-gray-50 px-4 py-3">
            <div>
              <div className="text-xs text-gray-500">Monthly cash flow</div>
              <div className="text-sm font-medium text-gray-800">
                {cashFlow === null ? '—' : formatTzs(cashFlow)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Est. monthly installment</div>
              <div className="text-sm font-medium text-gray-800">{formatTzs(installment)}</div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button size="xs" radius="xs" variant="default" onClick={close}>
            Cancel
          </Button>
          <Button size="xs" radius="xs" onClick={run}>
            {required ? 'Run assessment' : 'Continue to approval'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}