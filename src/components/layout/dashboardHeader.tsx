import type { ReactNode } from 'react'
import { ActionIcon, Menu, Text } from '@mantine/core'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { AppIcon } from '../appIcon'
import { NavSearch } from './navSearch'

export type Crumb = { label: string; to?: string }

export type DashboardHeaderProps = {
  title: string | string[]
  subtitle?: ReactNode
  breadcrumbs?: Crumb[]
  actions?: ReactNode
  collapsed: boolean
  onMenuClick: () => void
  onNavigate: (key: string) => void
  sidebar: ReactNode
  overlap?: boolean
  children: ReactNode
}

const ICON_BTN = 'text-slate-700 hover:bg-emerald-950/5'

const SAMPLE_NOTIFICATIONS = [
  { icon: 'file-text', title: 'New loan application', detail: 'A new application is ready for review.', time: '5 min ago' },
  { icon: 'circle-check', title: 'Repayment received', detail: 'A borrower payment was recorded.', time: '1 hour ago' },
  { icon: 'clock', title: 'Approval required', detail: 'Loan applications are waiting for your review.', time: 'Today' },
]

export function DashboardHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  collapsed,
  onMenuClick,
  onNavigate,
  sidebar,
  overlap = true,
  children,
}: DashboardHeaderProps) {
  const parts = Array.isArray(title) ? title : [title]

  return (
    <div className="botanical-header-skin flex h-screen flex-col bg-gray-100">
      <header className="relative z-30 flex h-12 shrink-0 items-center text-slate-700">
        <div
          className={`relative flex shrink-0 items-center px-3 transition-[width] duration-200 lg:justify-start lg:px-4 ${
            collapsed ? 'lg:w-14 lg:justify-center lg:px-0' : 'lg:w-56'
          }`}
        >
          <img
            src={logo}
            alt="Company logo"
            className={`h-9 w-28 max-w-full object-cover transition-opacity lg:w-32 ${
              collapsed ? 'lg:pointer-events-none lg:opacity-0' : ''
            }`}
          />
          <ActionIcon
            variant="subtle"
            size="lg"
            className={`absolute right-0 top-1/2 hidden -translate-y-1/2 ${ICON_BTN} lg:flex`}
            aria-label="Toggle sidebar"
            onClick={onMenuClick}
          >
            <AppIcon name="menu" />
          </ActionIcon>
        </div>

        <ActionIcon
          variant="subtle"
          size="lg"
          className={`${ICON_BTN} lg:hidden`}
          aria-label="Toggle sidebar"
          onClick={onMenuClick}
        >
          <AppIcon name="menu" />
        </ActionIcon>

        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className={`min-w-0 flex-1 overflow-hidden px-2 ${
              collapsed
                ? 'xl:max-w-[calc(50vw_-_13.5rem)]'
                : 'xl:max-w-[calc(50vw_-_24rem)]'
            }`}
          >
            <ol className="flex min-w-0 items-center gap-1.5 overflow-hidden text-xs">
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1
                return (
                  <li
                    key={`${crumb.label}-${i}`}
                    className={`flex min-w-0 items-center gap-1.5 ${
                      isLast ? 'flex-1' : 'shrink-0'
                    }`}
                  >
                    {i > 0 && (
                      <AppIcon name="chevron-right" className="shrink-0 text-slate-400" size={14} />
                    )}
                    {crumb.to && !isLast ? (
                      <Link
                        to={crumb.to}
                        className="inline-flex min-w-0 items-center text-slate-600 no-underline transition-colors hover:text-slate-900"
                      >
                        {i === 0 && <AppIcon name="home" className="mr-1 block shrink-0" size={14} />}
                        <span className="truncate">{crumb.label}</span>
                      </Link>
                    ) : (
                      <span
                        aria-current={isLast ? 'page' : undefined}
                        className={`min-w-0 truncate ${
                          isLast ? 'flex-1 font-medium text-slate-800' : 'text-slate-700'
                        }`}
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

        <div className="ml-auto flex min-w-0 shrink-0 items-center xl:absolute xl:left-1/2 xl:ml-0 xl:-translate-x-1/2">
          <NavSearch onNavigate={onNavigate} />
        </div>

        <div className="relative z-10 ml-auto flex shrink-0 items-center gap-1 px-3">
          <ActionIcon variant="subtle" size="lg" className={ICON_BTN} aria-label="Messages">
            <AppIcon name="mail" />
          </ActionIcon>

          <Menu position="bottom-end" shadow="md" width={320} withArrow>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                size="lg"
                className={`relative ${ICON_BTN}`}
                aria-label="Notifications, 3 unread"
              >
                <AppIcon name="bell" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
                  3
                </span>
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown className="overflow-hidden border border-brand/20 p-0">
              <div className="border-b border-brand/15 bg-brand-subtle px-4 py-3">
                <Text size="sm" fw={600} className="text-brand-dark">
                  Notifications
                </Text>
                <Text size="xs" className="text-brand">
                  3 new updates
                </Text>
              </div>
              <div className="divide-y divide-brand/10">
                {SAMPLE_NOTIFICATIONS.map((notification) => (
                  <div key={notification.title} className="flex gap-3 px-4 py-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-brand">
                      <AppIcon name={notification.icon} size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Text size="xs" fw={600} className="text-slate-800">
                          {notification.title}
                        </Text>
                        <Text size="xs" className="shrink-0 text-slate-400">
                          {notification.time}
                        </Text>
                      </div>
                      <Text size="xs" className="mt-1 text-slate-600">
                        {notification.detail}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-brand/15 px-4 py-2 text-center">
                <Text size="xs" fw={500} className="text-brand">
                  Sample notifications
                </Text>
              </div>
            </Menu.Dropdown>
          </Menu>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {sidebar}
        <div className="flex min-w-0 flex-1 flex-col overflow-auto">
          <div className="relative z-10 flex shrink-0 items-start justify-between gap-4 px-4 pb-11 pt-0">
            <div className="min-w-0">
              <Text size="md" c="dark.7" className="leading-none">
                {parts.map((part, i) => (
                  <span key={`${part}-${i}`}>
                    {i > 0 && <span className="mx-1.5 text-slate-400">/</span>}
                    <span className={i === parts.length - 1 ? 'font-semibold text-slate-800' : 'text-slate-600'}>
                      {part}
                    </span>
                  </span>
                ))}
              </Text>

              {subtitle && (
                <Text size="xs" c="dimmed" mt={6} className="truncate">
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

          <div className="flex-1 bg-content-background">
            <main className={`relative z-10 px-4 pb-4 ${overlap ? '-mt-8' : 'mt-4'}`}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
