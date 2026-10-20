import { AppIcon } from '../appIcon'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
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

// Default Mantine buttons are brand green, which would vanish on the green band.
// Inside the actions area the primary color becomes a deeper green. Red and other colors are untouched.
const ACTIONS_VARS = {
  '--mantine-primary-color-filled': '#1c7011',
  '--mantine-primary-color-filled-hover': '#145209',
} as CSSProperties

export function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  const parts = Array.isArray(title) ? title : [title]

  return (
    // same color as the top header, so the two read as one band.
    // pb-16 leaves space below the title row for the content to overlap
    <div className="flex shrink-0 items-start justify-between gap-4 bg-brand px-4 pb-16 pt-4">
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs">
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1
                return (
                  <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
                    {i > 0 && <AppIcon name="chevron-right" className="text-white/50" />}
                    {crumb.to && !isLast ? (
                      <Link
                        to={crumb.to}
                        className="inline-flex items-center text-white/80 no-underline transition-colors hover:text-white"
                      >
                        {i === 0 && <AppIcon name="home" className="mr-1 block shrink-0" size={14} />}
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        aria-current={isLast ? 'page' : undefined}
                        className={isLast ? 'text-white' : 'text-white/80'}
                      >
                        {crumb.label}
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        )}

        <Text size="lg" c="white" className="leading-none">
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
          <Text size="sm" c="white" mt={6} className="truncate opacity-90">
            {subtitle}
          </Text>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2" style={ACTIONS_VARS}>
          {actions}
        </div>
      )}
    </div>
  )
}