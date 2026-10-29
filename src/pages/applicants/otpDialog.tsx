import { AppIcon } from '../../components/appIcon'
import { useEffect, useState } from 'react'
import { Alert, Button, Modal, Text, TextInput } from '@mantine/core'
import type { Applicant } from './applicantsData'

const EMAIL = /^\S+@\S+\.\S+$/

type Props = {
  /** the applicant waiting for OTP verification, null keeps the dialog closed */
  applicant: Applicant | null
  onClose: () => void
  /** called after the code is verified */
  onVerified: (applicant: Applicant) => void
}

export function SendOtpDialog({ applicant, onClose, onVerified }: Props) {
  const [destination, setDestination] = useState('')
  const [destError, setDestError] = useState<string>()
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<string>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setDestination(applicant?.email ?? '')
    setDestError(undefined)
    setSent(false)
    setCode('')
    setCodeError(undefined)
  }, [applicant])

  const send = async () => {
    if (!EMAIL.test(destination.trim())) {
      setDestError('Enter a valid email address')
      return
    }
    setDestError(undefined)
    setLoading(true)
    try {
      // TODO: POST /api/onboarding/otp/send { applicantId, channel: 'EMAIL', destination }
      await new Promise((resolve) => setTimeout(resolve, 500))
      setSent(true)
      setCode('')
      setCodeError(undefined)
    } finally {
      setLoading(false)
    }
  }

  const verify = async () => {
    if (!applicant) return
    if (!/^\d{6}$/.test(code)) {
      setCodeError('Enter the 6-digit code')
      return
    }
    // UI only: these codes are here so the API error messages can be previewed
    if (code === '000000') return setCodeError('Invalid OTP code')
    if (code === '111111') return setCodeError('OTP has expired')

    setLoading(true)
    try {
      // TODO: POST /api/onboarding/otp/verify { applicantId, code }, the applicant then moves to PENDING_KYC
      await new Promise((resolve) => setTimeout(resolve, 500))
      onVerified(applicant)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal opened={!!applicant} onClose={onClose} title="Verify applicant" centered>
      {applicant && (
        <div className="space-y-4">
          <div>
            <Text fw={600}>{applicant.name}</Text>
            <Text size="xs" c="dimmed">
              {applicant.applicantNo}
            </Text>
          </div>

          <TextInput
            label="Send the code to"
            description="The code goes by email. It expires in 5 minutes and works once."
            size="sm"
            leftSection={<AppIcon name="mail" />}
            disabled={sent}
            value={destination}
            onChange={(e) => {
              setDestination(e.currentTarget.value)
              setDestError(undefined)
            }}
            error={destError}
          />

          {!sent ? (
            <div className="flex justify-end gap-2">
              <Button size="xs" variant="default" onClick={onClose}>
                Cancel
              </Button>
              <Button size="xs" loading={loading} leftSection={<AppIcon name="mail" />} onClick={send}>
                Send code
              </Button>
            </div>
          ) : (
            <>
              <Alert color="green" variant="light" icon={<AppIcon name="circle-check" />}>
                <Text size="sm">OTP sent to {destination.trim()}.</Text>
              </Alert>

              <TextInput
                label="6-digit code"
                placeholder="000000"
                size="sm"
                w={240}
                maxLength={6}
                inputMode="numeric"
                styles={{ input: { letterSpacing: 6, textAlign: 'center', fontSize: 18 } }}
                value={code}
                onChange={(e) => {
                  setCode(e.currentTarget.value.replace(/\D/g, ''))
                  setCodeError(undefined)
                }}
                error={codeError}
              />

              <div className="flex flex-wrap justify-between gap-2">
                <Button size="xs" variant="subtle" color="gray" loading={loading} onClick={send}>
                  Resend code
                </Button>
                <div className="flex gap-2">
                  <Button size="xs" variant="default" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button size="xs" loading={loading} leftSection={<AppIcon name="check" />} onClick={verify}>
                    Verify code
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  )
}