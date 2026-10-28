import { AppIcon } from '../../components/appIcon'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, PasswordInput, Text, TextInput } from '@mantine/core'
import logo from '../../assets/logo.png'

type LoginProps = {
  /** called with the entered credentials, throw an Error to show a message */
  onLogin?: (username: string, password: string) => Promise<void> | void
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim() || !password) {
      setError('Enter your username and password')
      return
    }

    setLoading(true)
    try {
      await onLogin?.(username.trim(), password)
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
          <img
            src={logo}
            alt="Fundora Saccos"
            className="mx-auto mb-2 h-20 w-56 max-w-full object-cover"
          />
          <Text size="sm" c="dimmed">
            Sign in to your account
          </Text>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <TextInput
            label="Username"
            placeholder="Your username"
            autoComplete="username"
            value={username}
            onChange={(e) => {
              setUsername(e.currentTarget.value)
              setError(null)
            }}
            leftSection={<AppIcon name="user-round" />}
          />

          <div>
            <PasswordInput
              label="Password"
              placeholder="Your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.currentTarget.value)
                setError(null)
              }}
              leftSection={<AppIcon name="lock-keyhole" />}
            />
            <div className="mt-1.5 text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-brand-dark no-underline hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

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