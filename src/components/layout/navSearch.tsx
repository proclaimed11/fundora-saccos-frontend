import { AppIcon } from '../appIcon'
import { ActionIcon, Kbd, Text, UnstyledButton } from '@mantine/core'
import {
  Spotlight,
  spotlight,
  type SpotlightActionGroupData,
} from '@mantine/spotlight'
import { navSections } from './navItems'

const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)

// thin-stroke search icon, lower strokeWidth for a lighter line
function SearchIcon({ size = 14, strokeWidth = 1.5 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

export function NavSearch({ onNavigate }: { onNavigate: (key: string) => void }) {
  const actions: SpotlightActionGroupData[] = navSections.map((section) => ({
    group: section.label,
    actions: section.items.map((item) => ({
      id: item.key,
      label: item.label,
      description: section.label, // also makes typing "finance" find the finance pages
      leftSection: <AppIcon name={item.icon} className="w-4 text-center" />,
      onClick: () => onNavigate(item.key),
    })),
  }))

  return (
    <>
      {/* wide screens: search box look-alike on the green bar */}
      <UnstyledButton
        onClick={() => spotlight.open()}
        aria-label="Search"
        className="hidden w-full max-w-md items-center gap-2 rounded-md bg-white/15 px-3 py-1.5 text-white transition-colors hover:bg-white/25 sm:flex"
      >
        <SearchIcon />
        <Text size="xs" inherit className="flex-1 text-left text-white/80">
          Search or jump to…
        </Text>
        <Kbd size="xs" className="border-0 bg-white/20 text-white">
          {isMac ? '⌘ K' : 'Ctrl K'}
        </Kbd>
      </UnstyledButton>

      {/* small screens: icon only */}
      <ActionIcon
        variant="subtle"
        size="lg"
        className="text-white hover:bg-white/15 sm:hidden"
        aria-label="Search"
        onClick={() => spotlight.open()}
      >
        <SearchIcon size={18} />
      </ActionIcon>

      <Spotlight
        actions={actions}
        shortcut="mod + K"
        highlightQuery
        scrollable
        maxHeight={360}
        nothingFound="Nothing found"
        searchProps={{
          leftSection: <SearchIcon size={16} />,
          placeholder: 'Search or jump to…',
        }}
      />
    </>
  )
}