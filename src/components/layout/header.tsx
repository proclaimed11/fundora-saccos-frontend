import { AppIcon } from '../appIcon'
import { ActionIcon } from '@mantine/core'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { NavSearch } from './navSearch'
import type { Crumb } from './pageHeader'

type HeaderProps = {
  /** icon-only sidebar on large screens, the logo block shrinks to match it */
  collapsed: boolean
  breadcrumbs?: Crumb[]
  onMenuClick: () => void
  onNavigate: (key: string) => void
}

// white icon buttons contrast clearly against the green bar
const ICON_BTN = 'text-white hover:bg-white/15'

export function Header({ collapsed, breadcrumbs, onMenuClick, onNavigate }: HeaderProps) {
  return (
    <header className="relative z-30 flex h-12 shrink-0 items-center bg-top-header text-white">
      {/* logo block: the same width as the sidebar below it, so the two line up */}
      <div
        className={`relative flex shrink-0 items-center px-3 transition-[width] duration-200 lg:justify-start lg:px-4 ${
          collapsed ? 'lg:w-14 lg:justify-center lg:px-0' : 'lg:w-56'
        }`}
      >
        <img
          src={logo}
          alt="Company logo"
          className={`h-10 w-32 max-w-full object-cover brightness-0 invert transition-opacity lg:w-36 ${
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
                  {i > 0 && <AppIcon name="chevron-right" className="shrink-0 text-white/50" size={14} />}
                  {crumb.to && !isLast ? (
                    <Link
                      to={crumb.to}
                      className="inline-flex min-w-0 items-center text-white/80 no-underline transition-colors hover:text-white"
                    >
                      {i === 0 && <AppIcon name="home" className="mr-1 block shrink-0" size={14} />}
                      <span className="truncate">{crumb.label}</span>
                    </Link>
                  ) : (
                    <span
                      aria-current={isLast ? 'page' : undefined}
                      className={`min-w-0 truncate ${isLast ? 'flex-1 text-white' : 'text-white'}`}
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

      {/* right side */}
      <div className="relative z-10 ml-auto flex shrink-0 items-center gap-1 px-3">
        <ActionIcon variant="subtle" size="lg" className={ICON_BTN} aria-label="Messages">
          <AppIcon name="mail" />
        </ActionIcon>

        <ActionIcon variant="subtle" size="lg" className={`relative ${ICON_BTN}`} aria-label="Notifications">
          <AppIcon name="bell" />
          {/* SAMPLE ONLY: show this dot when there are unread notifications */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-400 ring-2 ring-top-header" />
        </ActionIcon>

      </div>
    </header>
  )
}