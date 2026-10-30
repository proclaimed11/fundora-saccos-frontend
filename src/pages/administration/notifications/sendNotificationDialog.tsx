import { AppIcon } from '../../../components/appIcon'
import { useEffect, useState } from 'react'
import { Alert, Button, Modal, Select, SimpleGrid, Text, TextInput, Textarea } from '@mantine/core'
import { applicants, type Applicant } from '../../applicants/applicantsData'
import { LOANS } from '../../loans/loanApplicationsData'
import { CHANNEL, type NotificationChannel } from './notificationsData'

export type SendNotificationInput = {
  applicantId: number | null
  loanId: number | null
  channel: NotificationChannel
  recipient: string
  message: string
}

type Props = {
  opened: boolean
  onClose: () => void
  onSubmit: (input: SendNotificationInput) => void
}

type Errors = Partial<Record<'recipient' | 'message', string>>

const EMAIL = /^\S+@\S+\.\S+$/
const PHONE = /^(\+255|0)\d{9}$/
const MAX = 500
const SMS_PART = 160

const CHANNEL_OPTIONS = (Object.keys(CHANNEL) as NotificationChannel[]).map((k) => ({
  value: k,
  label: CHANNEL[k].label,
}))

const APPLICANT_OPTIONS = applicants.map((a) => ({ value: String(a.id), label: `${a.name} · ${a.applicantNo}` }))

// quick starts, the name and loan number are filled in for you
const TEMPLATES = [
  {
    label: 'Repayment reminder',
    text: (name: string, loan: string) =>
      `Dear ${name}, your installment${loan ? ` on ${loan}` : ''} is due soon. Please pay on time to avoid a penalty.`,
  },
  {
    label: 'Overdue notice',
    text: (name: string, loan: string) =>
      `Dear ${name}, your installment${loan ? ` on ${loan}` : ''} is overdue. Please make a payment as soon as possible.`,
  },
  {
    label: 'Payment received',
    text: (name: string, loan: string) =>
      `Dear ${name}, we received your payment${loan ? ` on ${loan}` : ''}. Thank you.`,
  },
  {
    label: 'Contract ready',
    text: (name: string) =>
      `Dear ${name}, your loan contract is ready. Please print it, sign it and return the hard copy to our office.`,
  },
]

const addressFor = (a: Applicant | undefined, channel: NotificationChannel) =>
  a ? (channel === 'EMAIL' ? a.email : a.phone) : ''

export function SendNotificationDialog({ opened, onClose, onSubmit }: Props) {
  const [applicantId, setApplicantId] = useState<string | null>(null)
  const [loanId, setLoanId] = useState<string | null>(null)
  const [channel, setChannel] = useState<NotificationChannel>('EMAIL')
  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Errors>({})

  useEffect(() => {
    if (!opened) return
    setApplicantId(null)
    setLoanId(null)
    setChannel('EMAIL')
    setRecipient('')
    setMessage('')
    setErrors({})
  }, [opened])

  const applicant = applicants.find((a) => String(a.id) === applicantId)
  const loans = applicant ? LOANS.filter((l) => l.applicantId === applicant.id) : []
  const loan = loans.find((l) => String(l.id) === loanId)

  const pickApplicant = (v: string | null) => {
    setApplicantId(v)
    setLoanId(null)
    const a = applicants.find((x) => String(x.id) === v)
    if (a) setRecipient(addressFor(a, channel))
    setErrors((e) => ({ ...e, recipient: undefined }))
  }

  const pickChannel = (v: string | null) => {
    const next = (v as NotificationChannel | null) ?? 'EMAIL'
    setChannel(next)
    // an email and a phone number are not interchangeable
    setRecipient(addressFor(applicant, next))
    setErrors((e) => ({ ...e, recipient: undefined }))
  }

  const submit = () => {
    const found: Errors = {}
    const to = recipient.trim()
    const text = message.trim()

    if (!to) found.recipient = channel === 'EMAIL' ? 'Enter the email address' : 'Enter the phone number'
    else if (channel === 'EMAIL' && !EMAIL.test(to)) found.recipient = 'Enter a valid email address'
    else if (channel === 'SMS' && !PHONE.test(to.replace(/\s+/g, ''))) found.recipient = 'Use 0700000000 or +255700000000'

    if (!text) found.message = 'Write the message'
    else if (text.length < 5) found.message = 'The message is too short'

    setErrors(found)
    if (Object.keys(found).length > 0) return

    onSubmit({ applicantId: applicant?.id ?? null, loanId: loan?.id ?? null, channel, recipient: to, message: text })
  }

  const parts = Math.max(1, Math.ceil(message.length / SMS_PART))

  return (
    <Modal opened={opened} onClose={onClose} title="Send notification" size={900} centered>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Select
              label="Borrower (optional)"
              description="Links the message to a borrower"
              placeholder="Search a borrower"
              size="sm"
              searchable
              clearable
              nothingFoundMessage="No borrower found"
              data={APPLICANT_OPTIONS}
              value={applicantId}
              onChange={pickApplicant}
            />
            <Select
              label="Loan (optional)"
              description={applicant ? 'One of their loans' : 'Pick a borrower first'}
              placeholder="No loan"
              size="sm"
              clearable
              disabled={loans.length === 0}
              data={loans.map((l) => ({ value: String(l.id), label: l.loanNo }))}
              value={loanId}
              onChange={setLoanId}
            />
            <Select
              label="Channel"
              size="sm"
              data={CHANNEL_OPTIONS}
              allowDeselect={false}
              value={channel}
              onChange={pickChannel}
            />
            <TextInput
              label={channel === 'EMAIL' ? 'Email address' : 'Phone number'}
              placeholder={channel === 'EMAIL' ? 'john@example.com' : '0700000000'}
              size="sm"
              value={recipient}
              onChange={(e) => {
                setRecipient(e.currentTarget.value)
                setErrors((x) => ({ ...x, recipient: undefined }))
              }}
              error={errors.recipient}
            />
          </SimpleGrid>

          <div>
            <Text size="xs" c="dimmed" mb={6}>
              Start from a template
            </Text>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <Button
                  key={t.label}
                  type="button"
                  size="compact-xs"
                  variant="light"
                  onClick={() => {
                    setMessage(t.text(applicant?.name.split(' ')[0] ?? 'customer', loan?.loanNo ?? ''))
                    setErrors((x) => ({ ...x, message: undefined }))
                  }}
                >
                  {t.label}
                </Button>
              ))}
            </div>
          </div>

          <Textarea
            label="Message"
            size="sm"
            autosize
            minRows={4}
            maxLength={MAX}
            value={message}
            onChange={(e) => {
              setMessage(e.currentTarget.value)
              setErrors((x) => ({ ...x, message: undefined }))
            }}
            error={errors.message}
          />
          <div className="-mt-2 text-right text-[11px] text-gray-400">
            {message.length}/{MAX}
            {channel === 'SMS' && message.length > 0 && ` · ${parts} SMS`}
          </div>

          <Alert color="blue" variant="light" icon={<AppIcon name="info" />}>
            <Text size="xs">
              The message is saved and marked as sent. No live email or SMS service is connected yet, so nothing
              leaves the system until one is set up on the backend.
            </Text>
          </Alert>
        </div>

        {/* what will be sent */}
        <div>
          <Text size="sm" fw={600} mb={6}>
            Preview
          </Text>
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
              <AppIcon name={CHANNEL[channel].icon} />
              <span className="truncate">
                {CHANNEL[channel].label} to {recipient.trim() || 'the recipient'}
              </span>
            </div>
            <div
              className={
                channel === 'SMS'
                  ? 'max-w-[260px] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm shadow-sm'
                  : 'rounded bg-white p-4 text-sm shadow-sm'
              }
            >
              <p className="whitespace-pre-line break-words text-gray-700">
                {message.trim() || 'Your message appears here'}
              </p>
            </div>
          </div>
          {applicant && (
            <Text size="xs" c="dimmed" mt={8}>
              Linked to {applicant.name}
              {loan ? ` · ${loan.loanNo}` : ''}
            </Text>
          )}
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-4">
        <Button size="xs" variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button size="xs" leftSection={<AppIcon name="send" />} onClick={submit}>
          Send
        </Button>
      </div>
    </Modal>
  )
}