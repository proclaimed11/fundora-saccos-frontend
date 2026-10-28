import { AppIcon } from '../../components/appIcon'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Text, TextInput } from '@mantine/core'
import logo from '../../assets/logo.png'

const EMAIL = /^\S+@\S+\.\S+$/

export function ForgotPassword() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()

    const value = email.trim()
    if (!value) {
      setError('Enter your email address')
      return
    }
    if (!EMAIL.test(value)) {
      setError('Enter a valid email address')
      return
    }
    // UI only: this address is here so the "Email not found" message can be previewed
    if (value.toLowerCase() === 'unknown@example.com') {
      setError('Email not found')
      return
    }

    setLoading(true)
    try {
      // TODO: POST /api/auth/forgot-password { email }
      //       the API emails a 6-digit code that expires after 5 minutes and works once
      await new Promise((resolve) => setTimeout(resolve, 600))
      setSent(true)
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
            <AppIcon name="key-round" size={24} strokeWidth={1.5} />
          </div>
          <Text size="md" fw={600} mt="sm">
            Forgot your password?
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            {sent
              ? 'Check your inbox for the reset code.'
              : 'Enter your email and we will send you a 6-digit code to reset it.'}
          </Text>
        </div>

        {sent ? (
          <div className="space-y-4">
            <Alert color="green" variant="light" icon={<AppIcon name="circle-check" />}>
              <Text size="sm">
                A password reset code has been sent to <span className="font-medium">{email.trim()}</span>.
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                The code expires in 5 minutes and works once.
              </Text>
            </Alert>

            <Button
              fullWidth
              leftSection={<AppIcon name="mail" />}
              onClick={() => navigate('/reset-password', { state: { email: email.trim() } })}
            >
              I have the code
            </Button>

            <Button
              fullWidth
              variant="subtle"
              color="gray"
              onClick={() => {
                setSent(false)
                setEmail('')
              }}
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4">
            <TextInput
              label="Email"
              placeholder="you@fundora.co.tz"
              type="email"
              autoComplete="email"
              autoFocus
              leftSection={<AppIcon name="mail" />}
              value={email}
              onChange={(e) => {
                setEmail(e.currentTarget.value)
                setError(undefined)
              }}
              error={error}
            />

            <Button type="submit" fullWidth loading={loading}>
              Send reset code
            </Button>
          </form>
        )}

        <div className="mt-5 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-xs text-brand-dark no-underline hover:underline"
          >
            <AppIcon name="arrow-left" size={12} />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}