import { useNavigate } from 'react-router-dom'
import { Badge, Button, Text } from '@mantine/core'
import { AppIcon } from '../appIcon'
import { visibleSections } from '../layout/navItems'
import { useRoles } from '../../pages/administration/roles/rolesContext'
import { useAuth } from '../../auth/authContext'
import { SAMPLE_NOTIFICATIONS } from '../../pages/administration/notifications/notificationsData'

const CARD = 'rounded-md bg-white shadow-[0_10px_30px_rgba(76,87,125,0.12)]'

// Dashboard is where the user already is, and Notifications is shown on its own line
const HIDDEN = ['dashboard', 'notifications']

// shown when a role has no dashboard widgets
export function HomeFallback() {
  const navigate = useNavigate()
  const { can, currentRole } = useRoles()
  const { logout, user } = useAuth()

  // the same sections and pages the sidebar shows for this role
  const sections = visibleSections(can)
    .map((s) => ({ ...s, items: s.items.filter((i) => !HIDDEN.includes(i.key)) }))
    .filter((s) => s.items.length > 0)

  // SAMPLE ONLY: the same sample notifications as the Notifications page
  const unread = SAMPLE_NOTIFICATIONS.filter((n) => n.status === 'SENT').length

  /* ---------- no pages at all, or no role ---------- */

  if (sections.length === 0) {
    const noRole = !currentRole
    return (
      <div className={`${CARD} flex flex-col items-center px-6 py-14 text-center`}>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-subtle text-brand-dark">
          <AppIcon name="lock-keyhole" size={26} strokeWidth={1.5} />
        </div>
        <div className="mt-3 text-base font-medium text-gray-800">
          {noRole ? 'Your account has no role assigned' : 'Your role has no access yet'}
        </div>
        <Text size="sm" c="dimmed" mt={4} maw={420}>
          {noRole
            ? 'You are signed in, but you cannot open any page until you are given a role.'
            : `The ${currentRole.name} role has no pages or dashboard widgets yet.`}{' '}
          Ask an Admin to check your role on the Users page.
        </Text>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button size="xs" variant="default" leftSection={<AppIcon name="circle-user-round" />} onClick={() => navigate('/account')}>
            My account
          </Button>
          <Button size="xs" color="red" variant="light" leftSection={<AppIcon name="log-out" />} onClick={logout}>
            Sign out
          </Button>
        </div>
      </div>
    )
  }

  /* ---------- has pages but no dashboard widgets ---------- */

  return (
    <div className="space-y-4">
      <div className={`${CARD} flex flex-wrap items-center justify-between gap-3 p-4`}>
        <div className="min-w-0">
          <div className="text-base font-semibold text-gray-800">Where would you like to start?</div>
          <Text size="xs" c="dimmed">
            Signed in as {user?.name} · {currentRole?.name}. Your role has no dashboard widgets, so here are the pages
            you can open.
          </Text>
        </div>
        <Button
          size="xs"
          variant="default"
          leftSection={<AppIcon name="bell" />}
          rightSection={
            unread > 0 ? (
              <Badge size="xs" circle color="brand">
                {unread}
              </Badge>
            ) : undefined
          }
          onClick={() => navigate('/notifications')}
        >
          Notifications
        </Button>
      </div>

      {sections.map((section) => (
        <div key={section.label} className={`${CARD} p-4`}>
          <Text size="sm" fw={600} mb="sm">
            {section.label}
          </Text>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {section.items.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.path)}
                className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-3 py-3 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-brand-dark">
                  <AppIcon name={item.icon} />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">{item.label}</span>
                <AppIcon name="chevron-right" className="shrink-0 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}