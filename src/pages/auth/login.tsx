import { AppIcon } from '../../components/appIcon'
import { useState, type FormEvent } from 'react'
import { Button, PasswordInput, Text, TextInput } from '@mantine/core'
import logo from '../../assets/logo.png'

type LoginProps = {
  /** called with the entered credentials, throw an Error to show a message */
  onLogin?: (email: string, password: string) => Promise<void> | void
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await onLogin?.(email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-content-background p-4">
      <div className="w-full max-w-sm rounded-md border-t-4 border-brand bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <img src={logo} alt="Company logo" className="mx-auto mb-4 h-12 w-auto" />
          <Text size="xl" fw={700} c="brand.8">
            Project-Tracker
          </Text>
          <Text size="sm" c="dimmed">
            Sign in to your account
          </Text>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Email"
            placeholder="you@company.com"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            leftSection={<AppIcon name="mail" />}
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            leftSection={<AppIcon name="lock-keyhole" />}
          />

          {error && (
            <Text size="xs" c="red">
              {error}
            </Text>
          )}

          <Button type="submit" fullWidth loading={loading}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  )
}