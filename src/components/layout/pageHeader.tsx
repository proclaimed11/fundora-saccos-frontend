import type { ReactNode } from 'react'
import { Text } from '@mantine/core'

export type Crumb = { label: string; to?: string }

export type PageHeaderProps = {
  /** 'Dashboard' or a breadcrumb like ['Invoice', 'New'] */
  title: string | string[]
  /** small muted text below the title, can include styled elements */
  subtitle?: ReactNode
  /** trail shown above the title, the last item is the current page */
  breadcrumbs?: Crumb[]
  /** anything: buttons, a menu, a date filter. Shown at the right end */
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const parts = Array.isArray(title) ? title : [title]

  return (
    // Same color as the top header, so the two read as one band.
    // Leave space below the title row for the content to overlap.
    <div className="flex shrink-0 items-start justify-between gap-4 bg-page-header px-4 pb-8 pt-0">
      <div className="min-w-0">
        <Text size="md" c="white" className="leading-none">
          {parts.map((part, i) => (
            <span key={`${part}-${i}`}>
              {i > 0 && <span className="mx-1.5 text-white/50">/</span>}
              <span className={i === parts.length - 1 ? 'font-semibold text-white' : 'text-white/80'}>
                {part}
              </span>
            </span>
          ))}
        </Text>

        {subtitle && (
          <Text size="xs" c="white" mt={6} className="truncate">
            {subtitle}
          </Text>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}