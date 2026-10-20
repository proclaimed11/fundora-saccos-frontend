import { AppIcon } from '../appIcon'
import { ActionIcon } from '@mantine/core'
import logo from '../../assets/logo.png'
import { NavSearch } from './navSearch'

type HeaderProps = {
  /** icon-only sidebar on large screens, the logo block shrinks to match it */
  collapsed: boolean
  onMenuClick: () => void
  onNavigate: (key: string) => void
}

// white icon buttons contrast clearly against the green bar
const ICON_BTN = 'text-white hover:bg-white/15'

export function Header({ collapsed, onMenuClick, onNavigate }: HeaderProps) {
  return (
    <header className="relative z-30 flex h-12 shrink-0 items-center bg-brand text-white">
      {/* logo block: the same width as the sidebar below it, so the two line up */}
      <div
        className={`flex shrink-0 items-center px-3 transition-[width] duration-200 lg:justify-start lg:px-4 ${
          collapsed ? 'lg:w-14 lg:justify-center lg:px-0' : 'lg:w-56'
        }`}
      >
        <img
          src={logo}
          alt="Company logo"
          className={`h-10 w-auto brightness-0 invert ${
            collapsed ? 'lg:h-8 lg:w-8 lg:object-cover lg:object-left' : ''
          }`}
        />
      </div>

      <ActionIcon
        variant="subtle"
        size="lg"
        className={ICON_BTN}
        aria-label="Toggle sidebar"
        onClick={onMenuClick}
      >
        <AppIcon name="menu" />
      </ActionIcon>

      {/* search: left-aligned box on wide screens, an icon at the right on small ones */}
      <div className="flex min-w-0 flex-1 justify-end px-3 sm:justify-start">
        <NavSearch onNavigate={onNavigate} />
      </div>

      {/* right side */}
      <div className="flex shrink-0 items-center gap-1 px-3">
        <ActionIcon variant="subtle" size="lg" className={ICON_BTN} aria-label="Messages">
          <AppIcon name="mail" />
        </ActionIcon>

        <ActionIcon variant="subtle" size="lg" className={`relative ${ICON_BTN}`} aria-label="Notifications">
          <AppIcon name="bell" />
          {/* SAMPLE ONLY: show this dot when there are unread notifications */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-400 ring-2 ring-brand" />
        </ActionIcon>

      </div>
    </header>
  )
}