import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Skeleton, Text } from '@mantine/core'
import { AppIcon } from './appIcon'

type ErrorStateProps = {
  title?: string
  message?: string
  onRetry?: () => void
  /** smaller padding, for a card instead of a whole page */
  compact?: boolean
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this. Check your connection and try again.',
  onRetry,
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center ${compact ? 'px-4 py-8' : 'px-6 py-16'}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
        <AppIcon name="triangle-alert" size={22} strokeWidth={1.5} />
      </div>
      <div className="mt-3 text-base font-medium text-gray-800">{title}</div>
      <Text size="sm" c="dimmed" mt={4} maw={380}>
        {message}
      </Text>
      {onRetry && (
        <Button mt="md" size="xs" variant="default" leftSection={<AppIcon name="refresh-cw" />} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

export function LoadingState({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      <Skeleton height={32} width={240} radius="sm" />
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} height={44} radius="sm" />
      ))}
    </div>
  )
}

type PageStateProps = {
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  rows?: number
  children: ReactNode
}

// wraps the main content of a page: a skeleton while loading, an error panel when the call failed.
// In development, add ?preview=loading or ?preview=error to the address to see both states.
export function PageState({ loading = false, error = null, onRetry, rows = 6, children }: PageStateProps) {
  const [params] = useSearchParams()
  const preview = import.meta.env.DEV ? params.get('preview') : null

  if (loading || preview === 'loading') return <LoadingState rows={rows} />
  if (error || preview === 'error') return <ErrorState message={error ?? undefined} onRetry={onRetry} />
  return <>{children}</>
}