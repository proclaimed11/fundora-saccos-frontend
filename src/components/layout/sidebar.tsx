import { AppIcon } from '../appIcon'
import { ActionIcon, Menu, ScrollArea, Text, UnstyledButton } from '@mantine/core'
import { navSections } from './navItems'

type SidebarUser = { name: string; role: string }

type SidebarProps = {
  active: string
  onChange: (key: string) => void
  /** mobile drawer state, ignored on large screens */
  open: boolean
  onClose: () => void
  /** icon-only rail, large screens only */
  collapsed: boolean
  user: SidebarUser
  onSettings?: () => void
  onLogout?: () => void
}

const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export function Sidebar({
  active,
  onChange,
  open,
  onClose,
  collapsed,
  user,
  onSettings,
  onLogout,
}: SidebarProps) {
  return (
    <>
      {/* backdrop, small screens only */}
      {open && (
        <div
          className="fixed inset-x-0 bottom-0 top-12 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* lg:relative + lg:z-20 keeps the sidebar layered above the page content */}
      <aside
        className={`fixed bottom-0 left-0 top-12 z-40 flex w-56 shrink-0 flex-col overflow-hidden bg-white transition-[width,transform] duration-200 lg:relative lg:inset-auto lg:z-20 lg:h-full lg:translate-x-0 ${
          collapsed ? 'lg:w-14' : 'lg:w-56'
        } ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* user */}
        <div
          className={`relative flex shrink-0 flex-col items-center border-b border-gray-100 px-4 py-5 text-center ${
            collapsed ? 'lg:px-1 lg:py-3' : ''
          }`}
        >
          <Menu position="bottom-end" shadow="md" width={180} withArrow>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                size="sm"
                className="absolute right-2 top-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                aria-label="Account settings menu"
              >
                <AppIcon name="settings" />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<AppIcon name="settings" />} onClick={onSettings}>
                Settings
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<AppIcon name="log-out" />} onClick={onLogout}>
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full bg-brand-subtle text-xl font-medium text-brand-dark ${
              collapsed ? 'lg:h-9 lg:w-9 lg:text-sm' : ''
            }`}
          >
            {initials(user.name)}
          </div>
          <div className={collapsed ? 'lg:hidden' : ''}>
            <div className="mt-3 text-sm font-medium text-brand-dark">{user.name}</div>
            <div className="text-xs text-gray-500">{user.role}</div>
          </div>
        </div>

        {/* thin scrollbar that only appears while scrolling */}
        <ScrollArea
          type="scroll"
          scrollbarSize={6}
          scrollHideDelay={600}
          className="min-h-0 flex-1"
          styles={{
            scrollbar: { background: 'transparent' },
            thumb: { background: 'var(--color-sidebar-highlight)' },
          }}
        >
          <nav className="flex flex-col pb-4">
            {navSections.map((section) => (
              <div key={section.label} className="mt-3 first:mt-2">
                {/* group label, replaced by a thin divider when the rail is collapsed */}
                <Text
                  size="xs"
                  className={`px-5 pb-1 text-gray-400 ${collapsed ? 'lg:hidden' : ''}`}
                >
                  {section.label}
                </Text>
                {collapsed && <div className="mx-3 mb-1 hidden border-t border-gray-100 lg:block" />}

                {section.items.map((item) => {
                  const isActive = item.key === active
                  return (
                    <UnstyledButton
                      key={item.key}
                      onClick={() => onChange(item.key)}
                      aria-current={isActive ? 'page' : undefined}
                      title={item.label}
                      className={`relative ml-0 flex w-full items-center gap-3 rounded-none px-5 py-2 text-left transition-colors ${
                        collapsed ? 'lg:justify-center lg:px-0' : ''
                      } ${
                        isActive
                          ? 'bg-sidebar-highlight text-brand-dark'
                          : 'text-gray-600 hover:bg-sidebar-highlight hover:text-gray-600'
                      }`}
                    >
                      <AppIcon name={item.icon} className="w-4 text-center" />
                      <Text size="sm" className={collapsed ? 'lg:hidden' : ''}>
                        {item.label}
                      </Text>
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 left-0 w-1 bg-sidebar-indicator"
                        />
                      )}
                    </UnstyledButton>
                  )
                })}
              </div>
            ))}
          </nav>
        </ScrollArea>
      </aside>
    </>
  )
}