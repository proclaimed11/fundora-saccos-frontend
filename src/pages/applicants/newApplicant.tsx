import { AppIcon } from '../../components/appIcon'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  FileInput,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Stepper,
  Text,
  TextInput,
} from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { DateInput } from '@mantine/dates'
import { DashboardLayout } from '../../components/layout/dashboardLayout'

type FormValues = {
  firstName: string
  middleName: string
  lastName: string
  gender: string
  dateOfBirth: string
  phone: string
  email: string
  nationality: string
  address: string
  occupation: string
  locationName: string
  locationPin: string
  isReturning: boolean
  nidaNumber: string
  tinNumber: string
  nidaDocument: File | null
  idScan: File | null
}

type StringKey = {
  [K in keyof FormValues]: FormValues[K] extends string ? K : never
}[keyof FormValues]

type Errors = Partial<Record<keyof FormValues, string>>

const emptyValues: FormValues = {
  firstName: '',
  middleName: '',
  lastName: '',
  gender: '',
  dateOfBirth: '',
  phone: '',
  email: '',
  nationality: '',
  address: '',
  occupation: '',
  locationName: '',
  locationPin: '',
  isReturning: false,
  nidaNumber: '',
  tinNumber: '',
  nidaDocument: null,
  idScan: null,
}

const statusLabels: Record<string, string> = {
  PENDING_OTP: 'Pending OTP',
  PENDING_KYC: 'Pending KYC',
}

const EMAIL = /^\S+@\S+\.\S+$/
const PHONE = /^0\d{9}$/

function validate(step: number, v: FormValues): Errors {
  const e: Errors = {}
  const need = (key: StringKey, message: string) => {
    if (!v[key].trim()) e[key] = message
  }

  if (step === 0) {
    need('firstName', 'Enter the first name')
    need('lastName', 'Enter the last name')
    need('gender', 'Select a gender')
    need('dateOfBirth', 'Enter the date of birth')
    need('nationality', 'Enter the nationality')
    if (!v.phone.trim()) e.phone = 'Enter a phone number'
    else if (!PHONE.test(v.phone.trim())) e.phone = 'Enter 10 digits starting with 0'
    if (!v.email.trim()) e.email = 'Enter an email address'
    else if (!EMAIL.test(v.email.trim())) e.email = 'Enter a valid email address'
  }

  if (step === 1) {
    need('address', 'Enter the address')
    need('occupation', 'Enter the occupation')
    need('locationName', 'Enter the location name')
    need('locationPin', 'Enter the location pin')
  }

  if (step === 2) {
    need('nidaNumber', 'Enter the NIDA number')
    if (!v.nidaDocument) e.nidaDocument = 'Upload the NIDA document'
    if (!v.idScan) e.idScan = 'Upload the ID scan'
  }

  return e
}

export function NewApplicantPage() {
  const navigate = useNavigate()
  const goBack = () => navigate('/applicants')

  const [active, setActive] = useState(0)
  const [values, setValues] = useState<FormValues>(emptyValues)
  const [errors, setErrors] = useState<Errors>({})

  const [applicantNo, setApplicantNo] = useState('')
  const [status, setStatus] = useState('PENDING_OTP')
  const [destination, setDestination] = useState('')
  const [destError, setDestError] = useState<string>()
  const [otpSent, setOtpSent] = useState(false)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<string>()
  const [verified, setVerified] = useState(false)

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  // props shared by every plain text field
  const text = (key: StringKey) => ({
    size: 'sm' as const,
    value: values[key],
    onChange: (e: ChangeEvent<HTMLInputElement>) => set(key, e.currentTarget.value),
    error: errors[key],
  })

  function next() {
    const found = validate(active, values)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    if (active < 2) setActive(active + 1)
    else register()
  }

  function register() {
    // TODO: call the register endpoint with `values` here
    setApplicantNo(`APP-${Date.now()}`)
    setStatus('PENDING_OTP')
    setDestination(values.email.trim())
    setActive(3)
  }

  function sendCode() {
    if (!EMAIL.test(destination.trim())) {
      setDestError('Enter a valid email address')
      return
    }
    setDestError(undefined)
    // TODO: call the send-OTP endpoint here
    setOtpSent(true)
  }

  function verifyCode() {
    if (!/^\d{6}$/.test(code)) {
      setCodeError('Enter the 6-digit code')
      return
    }
    setCodeError(undefined)
    // TODO: call the verify-OTP endpoint here
    setVerified(true)
    setStatus('PENDING_KYC')
  }

  function startOver() {
    setValues(emptyValues)
    setErrors({})
    setApplicantNo('')
    setStatus('PENDING_OTP')
    setDestination('')
    setDestError(undefined)
    setOtpSent(false)
    setCode('')
    setCodeError(undefined)
    setVerified(false)
    setActive(0)
  }

  // Enter does the sensible next thing on every step
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (active < 3) next()
    else if (!otpSent) sendCode()
    else if (!verified) verifyCode()
  }

  return (
    <DashboardLayout
        title="New applicant"
        subtitle="Register new applicants by filling all necessary details"
        breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Applicants', to: '/applicants' },
        { label: 'New applicant' },
        ]}
        actions={
                // inactive for now: no click handler until the form is built
            <Button
                size="xs"
                radius="xs"
                color="red"
                leftSection={<AppIcon name="user-round-x" />}
                >
                Cancel registration
            </Button>
        }
    >
    <div className="rounded-md bg-white p-6 shadow-[0_10px_30px_rgba(76,87,125,0.12)]">
        <Stepper
          active={verified ? 4 : active}
          size="xs"
          color="green"
          allowNextStepsSelect={false}
          onStepClick={(i) => {
            if (active < 3 && i < active) setActive(i)
          }}
          mb="xl"
        >
          <Stepper.Step label="Personal" />
          <Stepper.Step label="Address" />
          <Stepper.Step label="Identity" />
          <Stepper.Step label="Verify" />
        </Stepper>

        <form onSubmit={handleSubmit} noValidate>
          {active === 0 && (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput label="First name" placeholder="John" {...text('firstName')} />
              <TextInput label="Middle name (optional)" {...text('middleName')} />
              <TextInput label="Last name" placeholder="Doe" {...text('lastName')} />
              <Select
                label="Gender"
                placeholder="Select gender"
                size="sm"
                data={['Male', 'Female']}
                allowDeselect={false}
                value={values.gender || null}
                onChange={(v) => set('gender', v ?? '')}
                error={errors.gender}
              />
              <DateInput
                label="Date of birth"
                placeholder="Pick a date"
                size="sm"
                valueFormat="MMM D, YYYY"
                defaultLevel="decade"
                maxDate={new Date()}
                value={values.dateOfBirth || null}
                onChange={(v) => set('dateOfBirth', v ?? '')}
                error={errors.dateOfBirth}
              />
              <TextInput
                label="Phone"
                placeholder="0700000000"
                maxLength={10}
                inputMode="tel"
                {...text('phone')}
              />
              <TextInput label="Email" type="email" placeholder="john@example.com" {...text('email')} />
              <TextInput label="Nationality" placeholder="Tanzanian" {...text('nationality')} />
            </SimpleGrid>
          )}

          {active === 1 && (
            <Stack gap="md">
              <TextInput label="Address" placeholder="123 Street" {...text('address')} />
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput label="Occupation" placeholder="Software engineer" {...text('occupation')} />
                <TextInput
                  label="Location name"
                  placeholder="Dar es Salaam City Center"
                  {...text('locationName')}
                />
                <TextInput label="Location pin" placeholder="TZ-DOM-001" {...text('locationPin')} />
              </SimpleGrid>
              <div className="rounded-md border border-gray-200 px-3 py-2.5">
                <Checkbox
                  label="Returning applicant"
                  description="Has been through KYC before. A valid record from the last 12 months lets them skip full KYC."
                  checked={values.isReturning}
                  onChange={(e) => set('isReturning', e.currentTarget.checked)}
                />
              </div>
            </Stack>
          )}

          {active === 2 && (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput label="NIDA number" placeholder="NIDA123" {...text('nidaNumber')} />
              <TextInput label="TIN number (optional)" placeholder="TIN123" {...text('tinNumber')} />
              <FileInput
                label="NIDA document"
                placeholder="Upload PDF or image"
                size="sm"
                accept="application/pdf,image/*"
                clearable
                leftSection={<AppIcon name="upload" />}
                value={values.nidaDocument}
                onChange={(f) => set('nidaDocument', f)}
                error={errors.nidaDocument}
              />
              <FileInput
                label="ID scan"
                placeholder="Upload JPG or PNG"
                size="sm"
                accept="image/*"
                clearable
                leftSection={<AppIcon name="upload" />}
                value={values.idScan}
                onChange={(f) => set('idScan', f)}
                error={errors.idScan}
              />
            </SimpleGrid>
          )}

          {active === 3 && (
            <Stack gap="md">
              <Alert
                color="green"
                variant="light"
                title="Applicant registered"
                icon={<AppIcon name="circle-check" />}
              >
                <Group gap="xs">
                  <Text size="sm" fw={500}>
                    {applicantNo}
                  </Text>
                  <Badge
                    color={verified ? 'yellow' : 'gray'}
                    variant="light"
                    radius="sm"
                    tt="none"
                  >
                    {statusLabels[status] ?? status}
                  </Badge>
                </Group>
              </Alert>

              {!verified && (
                <>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Select
                      label="Send code by"
                      size="sm"
                      data={[{ value: 'EMAIL', label: 'Email' }]}
                      value="EMAIL"
                      allowDeselect={false}
                      readOnly
                    />
                    <TextInput
                      label="Send to"
                      placeholder="john@example.com"
                      size="sm"
                      value={destination}
                      onChange={(e) => {
                        setDestination(e.currentTarget.value)
                        setDestError(undefined)
                      }}
                      error={destError}
                    />
                  </SimpleGrid>

                  {!otpSent ? (
                    <div>
                      <Button
                        type="submit"
                        color="green"
                        leftSection={<AppIcon name="mail" />}
                      >
                        Send code
                      </Button>
                    </div>
                  ) : (
                    <Stack gap="sm">
                      <Text size="sm" c="dimmed">
                        Code sent to {destination.trim()}. It expires in 5 minutes and works once.
                      </Text>
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
                      <Group gap="xs">
                        <Button type="submit" color="green">
                          Verify code
                        </Button>
                        <Button type="button" variant="subtle" color="gray" onClick={sendCode}>
                          Resend code
                        </Button>
                      </Group>
                    </Stack>
                  )}
                </>
              )}

              {verified && (
                <>
                  <Alert
                    color="green"
                    variant="light"
                    title="Code verified"
                    icon={<AppIcon name="shield" />}
                  >
                    <Text size="sm">
                      The applicant is now pending KYC and will appear in KYC review.
                    </Text>
                  </Alert>
                  <Group gap="xs">
                    <Button type="button" variant="default" onClick={goBack}>
                      Back to applicants
                    </Button>
                    <Button type="button" color="green" onClick={startOver}>
                      Register another
                    </Button>
                  </Group>
                </>
              )}
            </Stack>
          )}

          {active < 3 && (
            <Group justify="space-between" mt="xl" pt="md" className="border-t border-gray-200">
              {active > 0 ? (
                <Button
                  type="button"
                  variant="default"
                  leftSection={<AppIcon name="arrow-left" />}
                  onClick={() => setActive(active - 1)}
                >
                  Back
                </Button>
              ) : (
                <span />
              )}
              <Button type="submit" color="green">
                {active === 2 ? 'Register applicant' : 'Next'}
              </Button>
            </Group>
          )}
        </form>
      </div>
    </DashboardLayout>
  )
}