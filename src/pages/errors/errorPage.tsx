import type { ReactNode } from 'react'
import { Text } from '@mantine/core'
import { AppIcon } from '../../components/appIcon'
import logo from '../../assets/logo.png'

type ErrorPageProps = {
  /** big label above the title, like 404 */
  code: string
  /** an icon name registered in appIcon.tsx */
  icon: string
  title: string
  message: string
  /** the buttons */
  children: ReactNode
}

// the same card as the sign-in pages, so these screens feel part of the app
export function ErrorPage({ code, icon, title, message, children }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-content-background p-4">
      <div className="w-full max-w-md rounded-md border-t-4 border-brand bg-white p-8 text-center shadow-sm">
        <img src={logo} alt="Fundora Saccos" className="mx-auto mb-4 h-20 w-56 max-w-full object-cover" />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-subtle text-brand-dark">
          <AppIcon name={icon} size={28} strokeWidth={1.5} />
        </div>

        <div className="mt-4 text-5xl font-semibold tracking-wide text-gray-300">{code}</div>
        <Text size="lg" fw={600} mt="xs">
          {title}
        </Text>
        <Text size="sm" c="dimmed" mt={6}>
          {message}
        </Text>

        <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div>
      </div>
    </div>
  )
}