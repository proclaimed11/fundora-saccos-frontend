import { AppIcon } from '../../components/appIcon'
import { useEffect, useState } from 'react'
import { Alert, Button, Checkbox, Modal, Select, Text, TextInput } from '@mantine/core'
import { BANK_PROVIDERS, MOBILE_PROVIDERS, type ApplicantAccount } from './applicantsData'

export type AccountInput = Omit<ApplicantAccount, 'id'>

type Props = {
  opened: boolean
  /** null means a new account is being added */
  account: ApplicantAccount | null
  /** numbers already on this applicant, a number can only be used once */
  existingNumbers: string[]
  onClose: () => void
  onSubmit: (input: AccountInput) => void
}

type Errors = Partial<Record<'provider' | 'number', string>>

const TYPE_OPTIONS = [
  { value: 'MOBILE_MONEY', label: 'Mobile money' },
  { value: 'BANK_TRANSFER', label: 'Bank account' },
]

const MOBILE = /^0\d{9}$/
const BANK = /^\d{8,16}$/

export function MemberAccountDialog({ opened, account, existingNumbers, onClose, onSubmit }: Props) {
  const editing = account !== null
  const [method, setMethod] = useState<AccountInput['method']>('MOBILE_MONEY')
  const [provider, setProvider] = useState<string | null>(null)
  const [number, setNumber] = useState('')
  const [primary, setPrimary] = useState(false)
  const [errors, setErrors] = useState<Errors>({})

  useEffect(() => {
    if (!opened) return
    setMethod(account?.method ?? 'MOBILE_MONEY')
    setProvider(account?.provider ?? null)
    setNumber(account?.number ?? '')
    setPrimary(account?.primary ?? false)
    setErrors({})
  }, [opened, account])

  const isMobile = method === 'MOBILE_MONEY'
  const clear = (key: keyof Errors) => setErrors((e) => ({ ...e, [key]: undefined }))

  const submit = () => {
    const found: Errors = {}
    const n = number.replace(/\s+/g, '')

    if (!provider) found.provider = isMobile ? 'Select the mobile money provider' : 'Select the bank'
    if (!n) found.number = isMobile ? 'Enter the phone number' : 'Enter the account number'
    else if (isMobile && !MOBILE.test(n)) found.number = 'Enter 10 digits starting with 0'
    else if (!isMobile && !BANK.test(n)) found.number = 'Enter 8 to 16 digits'
    else if (existingNumbers.some((x) => x !== account?.number && x === n)) found.number = 'This account is already added'

    setErrors(found)
    if (Object.keys(found).length > 0 || !provider) return

    // TODO: POST /api/member-accounts, or PUT /api/member-accounts/{id} when editing (applicantId + fields from the model)
    onSubmit({ method, provider, number: n, primary })
  }

  return (
    <Modal opened={opened} onClose={onClose} title={editing ? 'Edit account' : 'Add account'} centered>
      <div className="space-y-4">
        <Select
          label="Account type"
          size="sm"
          data={TYPE_OPTIONS}
          allowDeselect={false}
          value={method}
          onChange={(v) => {
            setMethod((v as AccountInput['method']) ?? 'MOBILE_MONEY')
            setProvider(null)
            setErrors({})
          }}
        />
        <Select
          label={isMobile ? 'Provider' : 'Bank'}
          placeholder={isMobile ? 'Select provider' : 'Select bank'}
          size="sm"
          searchable
          data={isMobile ? MOBILE_PROVIDERS : BANK_PROVIDERS}
          allowDeselect={false}
          value={provider}
          onChange={(v) => {
            setProvider(v)
            clear('provider')
          }}
          error={errors.provider}
        />
        <TextInput
          label={isMobile ? 'Phone number' : 'Account number'}
          placeholder={isMobile ? '0713222111' : '0150004821'}
          size="sm"
          inputMode="numeric"
          maxLength={isMobile ? 10 : 16}
          value={number}
          onChange={(e) => {
            setNumber(e.currentTarget.value)
            clear('number')
          }}
          error={errors.number}
        />

        <div className="rounded-md border border-gray-200 px-3 py-2.5">
          <Checkbox
            label="Primary account"
            description="Chosen first when a loan is disbursed"
            checked={primary}
            disabled={account?.primary}
            onChange={(e) => setPrimary(e.currentTarget.checked)}
          />
        </div>

        <Alert color="blue" variant="light" icon={<AppIcon name="info" />}>
          <Text size="xs">
            Loans can only be paid into an account that belongs to the borrower. These accounts appear in the
            Paid to list on the Disbursements page.
          </Text>
        </Alert>

        <div className="flex justify-end gap-2">
          <Button size="xs" variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button size="xs" leftSection={<AppIcon name="check" />} onClick={submit}>
            {editing ? 'Save changes' : 'Add account'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}