import { AppIcon } from '../../components/appIcon'
import { useState } from 'react'
import { Alert, Button, Checkbox, Modal, Text, Textarea } from '@mantine/core'

export type VerifyCheck = { label: string; description: string }
type Checks = [VerifyCheck, VerifyCheck]

// POST .../guarantors/{id}/verify { idVerified, exposureVerified, verifiedBy, remarks }
export const GUARANTOR_CHECKS: Checks = [
  { label: 'ID verified', description: "The guarantor's NIDA and identity were checked" },
  { label: 'Exposure verified', description: 'Existing guarantees and debts have been checked' },
]

// POST .../collaterals/{id}/verify { ownershipVerified, existingPledgeVerified, verifiedBy, remarks }
export const COLLATERAL_CHECKS: Checks = [
  { label: 'Ownership verified', description: 'The borrower owns this asset, the papers match' },
  { label: 'Existing pledge checked', description: "Confirmed it isn't already pledged elsewhere" },
]

type Props = {
  opened: boolean
  title: string
  /** who or what is being verified */
  subject: string
  checks: Checks
  onClose: () => void
  onVerified: (remarks: string) => void
}

export function VerifyDialog({ opened, title, subject, checks, onClose, onVerified }: Props) {
  const [first, setFirst] = useState(false)
  const [second, setSecond] = useState(false)
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState<string>()

  const reset = () => {
    setFirst(false)
    setSecond(false)
    setRemarks('')
    setError(undefined)
  }

  const close = () => {
    reset()
    onClose()
  }

  const submit = () => {
    if (!first || !second) {
      setError('Both checks must be confirmed before this can be marked verified.')
      return
    }
    // TODO: POST the verify endpoint with both flags, verifiedBy and remarks
    onVerified(remarks.trim())
    reset()
  }

  return (
    <Modal opened={opened} onClose={close} title={title} centered>
      <div className="space-y-4">
        <Text size="sm">
          Confirm the checks for <span className="font-medium">{subject}</span>.
        </Text>

        <div className="space-y-3 rounded-md bg-gray-50 px-3 py-3">
          <Checkbox
            label={checks[0].label}
            description={checks[0].description}
            checked={first}
            onChange={(e) => {
              setFirst(e.currentTarget.checked)
              setError(undefined)
            }}
          />
          <Checkbox
            label={checks[1].label}
            description={checks[1].description}
            checked={second}
            onChange={(e) => {
              setSecond(e.currentTarget.checked)
              setError(undefined)
            }}
          />
        </div>

        {error && (
          <Text size="sm" c="red">
            {error}
          </Text>
        )}

        <Textarea
          label="Remarks (optional)"
          size="sm"
          autosize
          minRows={2}
          value={remarks}
          onChange={(e) => setRemarks(e.currentTarget.value)}
        />

        <Alert color="blue" variant="light" icon={<AppIcon name="info" />}>
          <Text size="xs">It is only marked verified when both checks are ticked.</Text>
        </Alert>

        <div className="flex justify-end gap-2">
          <Button size="xs" variant="default" onClick={close}>
            Cancel
          </Button>
          <Button size="xs" leftSection={<AppIcon name="check" />} onClick={submit}>
            Mark as verified
          </Button>
        </div>
      </div>
    </Modal>
  )
}