import { AppIcon } from '../../components/appIcon'
import { useEffect, useState } from 'react'
import { Alert, Button, Modal, NumberInput, Select, SimpleGrid, Text, TextInput } from '@mantine/core'
import {
  ACCOUNT_RANGE,
  ACCOUNT_TYPE,
  ACCOUNT_TYPES,
  isSystemAccount,
  nextAccountNo,
  rangeLabel,
  type Account,
  type AccountType,
} from './accountingData'
import { METHOD_LABEL, type PaymentMethod } from '../loans/loanApplicationsData'

export type AccountInput = {
  accountNo: number
  accountCode: string
  accountName: string
  accountTypeName: AccountType
  openingBalance: number
  paymentMethod: PaymentMethod | null
}

type Props = {
  opened: boolean
  /** null means a new account is being created */
  account: Account | null
  /** codes that already exist, a code can only be used once */
  existingCodes: string[]
  /** numbers that already exist, a number can only be used once */
  existingNumbers: number[]
  onClose: () => void
  onSubmit: (input: AccountInput) => void
}

type Errors = Partial<Record<'no' | 'code' | 'name' | 'type', string>>

const CODE = /^[A-Z0-9_]+$/

const METHOD_OPTIONS = (Object.keys(METHOD_LABEL) as PaymentMethod[]).map((k) => ({ value: k, label: METHOD_LABEL[k] }))
const TYPE_OPTIONS = ACCOUNT_TYPES.map((t) => ({ value: t, label: ACCOUNT_TYPE[t].label }))

export function AccountDialog({ opened, account, existingCodes, existingNumbers, onClose, onSubmit }: Props) {
  const editing = account !== null
  const system = account ? isSystemAccount(account) : false

  const [no, setNo] = useState<number | ''>('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType | null>(null)
  const [opening, setOpening] = useState<number | ''>(0)
    const [method, setMethod] = useState<PaymentMethod | null>(null)
  const [errors, setErrors] = useState<Errors>({})

  // start from the account being edited, or from an empty form
  useEffect(() => {
    if (!opened) return
    setNo(account?.accountNo ?? '')
    setCode(account?.accountCode ?? '')
    setName(account?.accountName ?? '')
    setType(account?.accountTypeName ?? null)
    setOpening(account?.openingBalance ?? 0)
        setMethod(account?.paymentMethod ?? null)
    setErrors({})
  }, [opened, account])

  const close = () => {
    setErrors({})
    onClose()
  }

  const submit = () => {
    const found: Errors = {}
    const c = code.trim()

    if (!type) found.type = 'Select the account type'

    if (no === '') found.no = 'Enter the account number'
    else if (!Number.isInteger(no)) found.no = 'Enter a whole number'
    else if (type && (no < ACCOUNT_RANGE[type].from || no > ACCOUNT_RANGE[type].to)) {
      found.no = `${ACCOUNT_TYPE[type].label} accounts use ${rangeLabel(type)}`
    } else if (existingNumbers.some((x) => x !== account?.accountNo && x === no)) {
      found.no = 'This number is already used by another account'
    }

    if (!c) found.code = 'Enter the account code'
    else if (!CODE.test(c)) found.code = 'Use capital letters, numbers and underscores only'
    else if (existingCodes.some((x) => x !== account?.accountCode && x === c)) {
      found.code = 'This code is already used by another account'
    }

    if (!name.trim()) found.name = 'Enter the account name'

    setErrors(found)
    if (Object.keys(found).length > 0 || !type || no === '') return

    // TODO: POST /api/chart-of-accounts, or PUT /api/chart-of-accounts/{id} when editing
    //       { accountCode, accountName, accountTypeName, openingBalance, currentBalance }
    //       The account number is not in the API yet, it needs a new field on the account.
    onSubmit({
      accountNo: no,
      accountCode: c,
      accountName: name.trim(),
      accountTypeName: type,
      openingBalance: opening === '' ? 0 : opening,
      paymentMethod: type === 'ASSET' ? method : null,
    })
  }

  return (
    <Modal opened={opened} onClose={close} title={editing ? 'Edit account' : 'New account'} centered>
      <div className="space-y-4">
        {system && (
          <Alert color="yellow" variant="light" icon={<AppIcon name="lock-keyhole" />}>
            <Text size="xs">
              This is a system account. The GL posting workflows look it up by its code, so the code and type stay
              fixed. You can still rename it.
            </Text>
          </Alert>
        )}

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Select
            label="Account type"
            description={type ? `Normal balance: ${ACCOUNT_TYPE[type].normal}` : 'Decides how the balance behaves'}
            placeholder="Select type"
            size="sm"
            data={TYPE_OPTIONS}
            allowDeselect={false}
            disabled={system}
            value={type}
            onChange={(v) => {
              const t = v as AccountType | null
              setType(t)
              setErrors((x) => ({ ...x, type: undefined, no: undefined }))
              // a new account gets the next free number of that type
              if (!editing && t) setNo(nextAccountNo(t, existingNumbers) ?? '')
            }}
            error={errors.type}
          />
          <NumberInput
            label="Account number"
            description={type ? `${ACCOUNT_TYPE[type].label} accounts use ${rangeLabel(type)}` : 'Pick the type first'}
            placeholder="1050"
            size="sm"
            hideControls
            allowNegative={false}
            allowDecimal={false}
            value={no}
            onChange={(v) => {
              setNo(v === '' ? '' : Number(v))
              setErrors((x) => ({ ...x, no: undefined }))
            }}
            error={errors.no}
          />
          <TextInput
            label="Account code"
            description="Unique, capital letters, no spaces"
            placeholder="SUSPENSE"
            size="sm"
            readOnly={system}
            disabled={system}
            value={code}
            onChange={(e) => {
              setCode(e.currentTarget.value.toUpperCase().replace(/\s+/g, '_'))
              setErrors((x) => ({ ...x, code: undefined }))
            }}
            error={errors.code}
          />
          <TextInput
            label="Account name"
            placeholder="Suspense Account"
            size="sm"
            value={name}
            onChange={(e) => {
              setName(e.currentTarget.value)
              setErrors((x) => ({ ...x, name: undefined }))
            }}
            error={errors.name}
          />
        </SimpleGrid>

                {type === 'ASSET' && (
          <Select
            label="Payment account (optional)"
            description="Choose this if the company pays from or receives money into this account. It then appears in the payment and disbursement forms."
            placeholder="Not a payment account"
            size="sm"
            clearable
            data={METHOD_OPTIONS}
            value={method}
            onChange={(v) => setMethod(v as PaymentMethod | null)}
          />
        )}

        <NumberInput
          label="Opening balance"
          description={
            editing
              ? 'Set when the account was created. The current balance changes through GL postings.'
              : 'The balance at the start of the accounting period. The current balance starts at the same amount.'
          }
          size="sm"
          prefix="TZS "
          thousandSeparator=","
          hideControls
          allowNegative={false}
          readOnly={editing}
          disabled={editing}
          value={opening}
          onChange={(v) => setOpening(v === '' ? '' : Number(v))}
        />

        <div className="flex justify-end gap-2">
          <Button size="xs" variant="default" onClick={close}>
            Cancel
          </Button>
          <Button size="xs" leftSection={<AppIcon name="check" />} onClick={submit}>
            {editing ? 'Save changes' : 'Create account'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}