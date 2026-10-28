import { AppIcon } from '../../components/appIcon'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, PasswordInput, Text, TextInput } from '@mantine/core'
import logo from '../../assets/logo.png'

const EMAIL = /^\S+@\S+\.\S+$/

// the API requires at least 8 characters (minPasswordLength in /api/security/settings)
const MIN_LENGTH = 8

type LocationState = { email?: string } | null
type Errors = Partial<Record<'email' | 'code' | 'password' | 'confirm', string>>

export function ResetPassword() {
  const navigate = useNavigate()
  const state = useLocation().state as LocationState

  const [email, setEmail] = useState(state?.email ?? '')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const clear = (key: keyof Errors) => setErrors((e) => ({ ...e, [key]: undefined }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()

    const found: Errors = {}
    const value = email.trim()

    if (!value) found.email = 'Enter your email address'
    else if (!EMAIL.test(value)) found.email = 'Enter a valid email address'

    if (!/^\d{6}$/.test(code)) found.code = 'Enter the 6-digit code'

    if (password.length < MIN_LENGTH) found.password = `New password must be at least ${MIN_LENGTH} characters`
    if (!found.password && confirm !== password) found.confirm = 'The two passwords do not match'

    // UI only: these codes are here so the API error messages can be previewed
    if (!found.code && code === '000000') found.code = 'Invalid reset code'
    if (!found.code && code === '111111') found.code = 'Reset code has expired'

    setErrors(found)
    if (Object.keys(found).length > 0) return

    setLoading(true)
    try {
      // TODO: POST /api/auth/reset-password { email, code, newPassword }
      //       the code expires after 5 minutes and works once
      await new Promise((resolve) => setTimeout(resolve, 600))
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-content-background p-4">
      <div className="w-full max-w-sm rounded-md border-t-4 border-brand bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <img
            src={logo}
            alt="Fundora Saccos"
            className="mx-auto mb-2 h-20 w-56 max-w-full object-cover"
          />
          <div className="mx-auto mt-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-subtle text-brand-dark">
            <AppIcon name={done ? 'circle-check' : 'lock-keyhole'} size={24} strokeWidth={1.5} />
          </div>
          <Text size="md" fw={600} mt="sm">
            {done ? 'Password reset' : 'Set a new password'}
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            {done
              ? 'You can now sign in with your new password.'
              : 'Enter the code from your email and choose a new password.'}
          </Text>
        </div>

        {done ? (
          <div className="space-y-4">
            <Alert color="green" variant="light" icon={<AppIcon name="circle-check" />}>
              <Text size="sm">Password reset successfully.</Text>
            </Alert>
            <Button fullWidth onClick={() => navigate('/login', { replace: true })}>
              Go to sign in
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4">
            <TextInput
              label="Email"
              placeholder="you@fundora.co.tz"
              type="email"
              autoComplete="email"
              leftSection={<AppIcon name="mail" />}
              value={email}
              onChange={(e) => {
                setEmail(e.currentTarget.value)
                clear('email')
              }}
              error={errors.email}
            />

            <TextInput
              label="6-digit code"
              description="Expires 5 minutes after it was sent and works once"
              placeholder="000000"
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              autoFocus={!!state?.email}
              styles={{ input: { letterSpacing: 8, textAlign: 'center', fontSize: 18 } }}
              value={code}
              onChange={(e) => {
                setCode(e.currentTarget.value.replace(/\D/g, ''))
                clear('code')
              }}
              error={errors.code}
            />

            <PasswordInput
              label="New password"
              description={`At least ${MIN_LENGTH} characters`}
              placeholder="New password"
              autoComplete="new-password"
              leftSection={<AppIcon name="lock-keyhole" />}
              value={password}
              onChange={(e) => {
                setPassword(e.currentTarget.value)
                clear('password')
                clear('confirm')
              }}
              error={errors.password}
            />

            <PasswordInput
              label="Confirm new password"
              placeholder="Repeat the new password"
              autoComplete="new-password"
              leftSection={<AppIcon name="lock-keyhole" />}
              value={confirm}
              onChange={(e) => {
                setConfirm(e.currentTarget.value)
                clear('confirm')
              }}
              error={errors.confirm}
            />

            <Button type="submit" fullWidth loading={loading}>
              Reset password
            </Button>
          </form>
        )}

        <div className="mt-5 flex items-center justify-between text-xs">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-brand-dark no-underline hover:underline"
          >
            <AppIcon name="arrow-left" size={12} />
            Back to sign in
          </Link>
          {!done && (
            <Link to="/forgot-password" className="text-brand-dark no-underline hover:underline">
              Send a new code
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}