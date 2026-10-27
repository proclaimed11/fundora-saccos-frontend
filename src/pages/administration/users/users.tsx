import { AppIcon } from '../../../components/appIcon'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { ActionIcon, Alert, Badge, Button, Drawer, Menu, SegmentedControl, Text } from '@mantine/core'
import { DashboardLayout } from '../../../components/layout/dashboardLayout'
import { StatWidget } from '../../../components/statsWidgets'
import { CustomTable, type CustomTableColumn } from '../../../components/customTable/customTable'
import { ContractConfirmDialog } from '../../loans/contractDialogs'
import { CURRENT_USER } from '../../loans/disbursementDialog'
import { initials } from '../../applicants/applicantsData'
import { ResetPasswordDialog, UserDialog, type UserInput } from './userDialogs'
import { ROLES, ROLE_STYLE, SAMPLE_USERS, activityFor, type User } from './usersData'

const CARD = 'rounded-md bg-white shadow-[0_10px_30px_rgba(76,87,125,0.12)]'

type TabKey = 'all' | 'active' | 'inactive'
type Notice = { text: string; color: 'green' | 'blue' } | null
type DialogState = { kind: 'create' } | { kind: 'edit' | 'password' | 'status' | 'twofa'; id: number } | null

const TAB_EMPTY: Record<TabKey, string> = {
  all: 'No users yet',
  active: 'No active users',
  inactive: 'No inactive users',
}

const roleOptions = ROLES.map((r) => ({ value: r, label: r }))

/* ---------- small pieces ---------- */

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-800">{value}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text size="sm" fw={600} mb={4}>
      {children}
    </Text>
  )
}

function RoleBadge({ role }: { role: User['role'] }) {
  if (!role) {
    return (
      <Badge variant="light" color="yellow" radius="sm" size="sm">
        No role
      </Badge>
    )
  }
  return (
    <Badge variant="light" color={ROLE_STYLE[role].color} radius="sm" size="sm">
      {role}
    </Badge>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge variant="light" color={active ? 'green' : 'gray'} radius="sm" size="sm">
      {active ? 'Active' : 'Inactive'}
    </Badge>
  )
}

function Avatar({ name, size = 'h-8 w-8 text-xs' }: { name: string; size?: string }) {
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full bg-brand-subtle font-medium text-brand-dark ${size}`}>
      {initials(name)}
    </div>
  )
}

const lastSeen = (u: User) => (u.lastLogin ? dayjs(u.lastLogin).format('MMM D, YYYY') : 'Never')

/* ---------- user drawer ---------- */

type DrawerProps = {
  user: User
  blocked: string | null
  onEdit: (u: User) => void
  onReset: (u: User) => void
  onStatus: (u: User) => void
}

function UserDrawerBody({ user: u, blocked, onEdit, onReset, onStatus }: DrawerProps) {
  const tiles = [
    { label: 'Role', value: u.role ?? 'Not assigned' },
    { label: 'Two-factor', value: u.twoFactor ? 'On' : 'Off' },
    { label: 'Last sign-in', value: lastSeen(u) },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Avatar name={u.name} size="h-14 w-14 text-lg" />
        <div className="min-w-0">
          <div className="text-base font-medium text-gray-800">{u.name}</div>
          <div className="text-xs text-gray-500">@{u.username}</div>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <RoleBadge role={u.role} />
            <StatusBadge active={u.active} />
          </div>
        </div>
      </div>

      {!u.role && (
        <Alert color="yellow" variant="light" icon={<AppIcon name="triangle-alert" />}>
          <Text size="sm">This user has no role, so they cannot do anything yet. Edit the user to assign one.</Text>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-md bg-gray-50 px-4 py-3">
            <div className="text-xs text-gray-500">{t.label}</div>
            <div className="text-base font-medium text-gray-800">{t.value}</div>
          </div>
        ))}
      </div>

      <div>
        <SectionTitle>User details</SectionTitle>
        <Field label="Full name" value={u.name} />
        <Field label="Username" value={u.username} />
        <Field label="Email" value={u.email} />
        <Field label="Phone" value={u.phone} />
        <Field label="Approval level" value={u.role ? ROLE_STYLE[u.role].level : '—'} />
        <Field label="Created" value={dayjs(u.created).format('MMM D, YYYY')} />
      </div>

      <div>
        <SectionTitle>Recent activity</SectionTitle>
        <ul className="mt-3 space-y-4">
          {activityFor(u).map((e, i) => (
            <li key={`${e.title}-${i}`} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <AppIcon name={e.icon} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-3">
                  <span className="text-sm font-medium text-gray-800">{e.title}</span>
                  <span className="shrink-0 text-xs text-gray-400">{dayjs(e.date).format('MMM D, YYYY')}</span>
                </div>
                <div className="text-xs text-gray-500">{e.detail}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {blocked && (
        <Alert color="gray" variant="light" icon={<AppIcon name="lock-keyhole" />}>
          <Text size="sm">{blocked}</Text>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="xs" leftSection={<AppIcon name="pencil" />} onClick={() => onEdit(u)}>
          Edit
        </Button>
        <Button size="xs" variant="default" leftSection={<AppIcon name="key-round" />} onClick={() => onReset(u)}>
          Reset password
        </Button>
        <Button
          size="xs"
          color={u.active ? 'red' : undefined}
          variant="light"
          disabled={u.active && !!blocked}
          leftSection={<AppIcon name={u.active ? 'user-round-x' : 'circle-check'} />}
          onClick={() => onStatus(u)}
        >
          {u.active ? 'Deactivate' : 'Activate'}
        </Button>
      </div>
    </div>
  )
}

/* ---------- page ---------- */

export function UsersPage() {
  const [params, setParams] = useSearchParams()

  // UI only: changes made in this session, nothing is saved yet
  const [users, setUsers] = useState<User[]>(SAMPLE_USERS)
  const [tab, setTab] = useState<TabKey>('all')
  const [dialog, setDialog] = useState<DialogState>(null)
  const [notice, setNotice] = useState<Notice>(null)

  // success banners fade away on their own
  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 9000)
    return () => clearTimeout(t)
  }, [notice])

  const active = users.filter((u) => u.active)
  const inactive = users.filter((u) => !u.active)
  const noRole = users.filter((u) => !u.role)
  const tabData: Record<TabKey, User[]> = { all: users, active, inactive }

  // here `color` is the icon color
  const stats = [
    { label: 'Total Users', value: users.length, icon: 'users', color: '#45bdfc' },
    { label: 'Active Users', value: active.length, icon: 'circle-check', color: 'var(--app-brand)' },
    { label: 'Inactive Users', value: inactive.length, icon: 'circle-x', color: '#ef4444' },
    { label: 'Two-factor On', value: users.filter((u) => u.twoFactor).length, icon: 'shield', color: '#8e44ad' },
  ]

  // you cannot deactivate yourself or the last active Admin
  const blockReason = (u: User): string | null => {
    if (u.name === CURRENT_USER) return 'You cannot deactivate your own account.'
    if (u.role === 'Admin' && u.active && active.filter((x) => x.role === 'Admin').length <= 1) {
      return 'This is the last active Admin, so it cannot be deactivated.'
    }
    return null
  }

  // /users?user=2 opens the drawer for user 2
  const userParam = params.get('user')
  const selected = userParam ? (users.find((u) => String(u.id) === userParam) ?? null) : null
  const openView = (id: number) => setParams({ user: String(id) }, { replace: true })
  const closeView = () => setParams({}, { replace: true })

  const dialogUser = dialog && dialog.kind !== 'create' ? users.find((u) => u.id === dialog.id) : undefined

  /* ---------- actions ---------- */

  const save = (input: UserInput) => {
    if (dialog?.kind === 'create') {
      const id = Math.max(0, ...users.map((u) => u.id)) + 1
      const { password: _password, ...rest } = input
      setUsers((list) => [
        ...list,
        { id, ...rest, active: true, twoFactor: false, lastLogin: null, created: dayjs().format('YYYY-MM-DD') },
      ])
      setNotice({ color: 'green', text: `User ${input.name} was created.` })
    } else if (dialogUser) {
      const { password: _password, ...rest } = input
      setUsers((list) => list.map((u) => (u.id === dialogUser.id ? { ...u, ...rest } : u)))
      setNotice({ color: 'green', text: `User ${input.name} was updated.` })
    }
    setDialog(null)
  }

  const toggleStatus = () => {
    if (!dialogUser) return
    if (dialogUser.active && blockReason(dialogUser)) return
    setUsers((list) => list.map((u) => (u.id === dialogUser.id ? { ...u, active: !u.active } : u)))
    setNotice({
      color: 'blue',
      text: `${dialogUser.name} was ${dialogUser.active ? 'deactivated and can no longer sign in' : 'activated'}.`,
    })
    setDialog(null)
  }

  const toggleTwoFactor = () => {
    if (!dialogUser) return
    setUsers((list) => list.map((u) => (u.id === dialogUser.id ? { ...u, twoFactor: !u.twoFactor } : u)))
    setNotice({
      color: 'blue',
      text: `Two-factor sign-in is now ${dialogUser.twoFactor ? 'off' : 'on'} for ${dialogUser.name}.`,
    })
    setDialog(null)
  }

  const resetPassword = () => {
    if (!dialogUser) return
    setNotice({ color: 'green', text: `The password for ${dialogUser.name} was reset.` })
    setDialog(null)
  }

  // the drawer buttons close the drawer first, then open the dialog
  const fromDrawer = (kind: 'edit' | 'password' | 'status', u: User) => {
    closeView()
    setDialog({ kind, id: u.id })
  }

  /* ---------- columns ---------- */

  const columns: CustomTableColumn<User>[] = [
    {
      accessor: 'name',
      header: 'User',
      render: (u) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={u.name} />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-gray-800">{u.name}</div>
            <div className="truncate text-xs text-gray-500">{u.email}</div>
          </div>
        </div>
      ),
      exportValue: (u) => `${u.name} (${u.email})`,
    },
    {
      accessor: 'role',
      header: 'Role',
      render: (u) => (
        <div>
          <RoleBadge role={u.role} />
          {u.role && <div className="mt-0.5 text-[11px] text-gray-500">{ROLE_STYLE[u.role].level}</div>}
        </div>
      ),
      exportValue: (u) => u.role ?? 'No role',
    },
    {
      accessor: 'active',
      header: 'Status',
      sortable: false,
      render: (u) => <StatusBadge active={u.active} />,
      exportValue: (u) => (u.active ? 'Active' : 'Inactive'),
    },
    {
      accessor: 'twoFactor',
      header: 'Two-factor',
      sortable: false,
      render: (u) => (
        <Badge variant="outline" color={u.twoFactor ? 'green' : 'gray'} radius="sm" size="sm">
          {u.twoFactor ? 'On' : 'Off'}
        </Badge>
      ),
      exportValue: (u) => (u.twoFactor ? 'On' : 'Off'),
    },
    {
      accessor: 'lastLogin',
      header: 'Last sign-in',
      render: (u) => (
        <span className={`whitespace-nowrap text-sm ${u.lastLogin ? 'text-gray-800' : 'text-gray-400'}`}>{lastSeen(u)}</span>
      ),
      exportValue: (u) => u.lastLogin ?? '',
    },
    { accessor: 'created', header: 'Created', type: 'date' },
    {
      // the ⋮ menu holds every action; "id" is only used as the accessor
      accessor: 'id',
      header: 'Actions',
      sortable: false,
      align: 'right',
      width: 80,
      render: (u) => {
        const blocked = blockReason(u)
        return (
          // stop the click so the row doesn't also open the drawer
          <div onClick={(e) => e.stopPropagation()}>
            <Menu position="bottom-end" shadow="md" width={230}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="sm" aria-label={`Actions for ${u.name}`}>
                  <AppIcon name="ellipsis-vertical" />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item fw={500} leftSection={<AppIcon name="pencil" />} onClick={() => setDialog({ kind: 'edit', id: u.id })}>
                  Edit user
                </Menu.Item>
                <Menu.Item leftSection={<AppIcon name="key-round" />} onClick={() => setDialog({ kind: 'password', id: u.id })}>
                  Reset password
                </Menu.Item>
                <Menu.Item leftSection={<AppIcon name="shield" />} onClick={() => setDialog({ kind: 'twofa', id: u.id })}>
                  {u.twoFactor ? 'Turn off two-factor' : 'Turn on two-factor'}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<AppIcon name="eye" />} onClick={() => openView(u.id)}>
                  View details
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color={u.active ? 'red' : undefined}
                  disabled={u.active && !!blocked}
                  leftSection={<AppIcon name={u.active ? 'user-round-x' : 'circle-check'} />}
                  onClick={() => setDialog({ kind: 'status', id: u.id })}
                >
                  {u.active ? (blocked ? 'Cannot deactivate' : 'Deactivate user') : 'Activate user'}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        )
      },
    },
  ]

  return (
    <DashboardLayout
      title="Users"
      subtitle="Staff who can sign in to the system"
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Administration' }, { label: 'Users' }]}
      actions={
        <Button size="xs" leftSection={<AppIcon name="plus" />} onClick={() => setDialog({ kind: 'create' })}>
          New user
        </Button>
      }
    >
      <div className="space-y-4">
        {notice && (
          <Alert
            color={notice.color}
            variant="light"
            withCloseButton
            onClose={() => setNotice(null)}
            icon={<AppIcon name={notice.color === 'green' ? 'circle-check' : 'info'} />}
          >
            <Text size="sm">{notice.text}</Text>
          </Alert>
        )}

        {noRole.length > 0 && (
          <Alert color="yellow" variant="light" icon={<AppIcon name="triangle-alert" />}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Text size="sm">
                {noRole.length} {noRole.length === 1 ? 'user has' : 'users have'} no role assigned yet.
              </Text>
              <Button size="compact-xs" variant="default" onClick={() => openView(noRole[0].id)}>
                Review user
              </Button>
            </div>
          </Alert>
        )}

        {/* row 1: key numbers */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <StatWidget key={s.label} {...s} />
          ))}
        </div>

        {/* row 2: table in a plain card */}
        <div className={`${CARD} p-4`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-full overflow-x-auto">
              <SegmentedControl
                size="xs"
                value={tab}
                onChange={(v) => setTab(v as TabKey)}
                data={[
                  { value: 'all', label: `All (${users.length})` },
                  { value: 'active', label: `Active (${active.length})` },
                  { value: 'inactive', label: `Inactive (${inactive.length})` },
                ]}
              />
            </div>
            <Text size="xs" c="dimmed">
              Passwords must have at least 8 characters
            </Text>
          </div>

          <CustomTable<User>
            size="md"
            data={tabData[tab]}
            columns={columns}
            searchInput
            searchPlaceholder="Search name, username or email"
            searchKeys={['name', 'username', 'email']}
            filters={{ role: roleOptions, created: 'date' }}
            defaultSort={{ accessor: 'name', direction: 'asc' }}
            noRecordText={TAB_EMPTY[tab]}
            onRowClick={(row) => openView(row.id)}
            exportCsv
            exportFileName="users"
            print
            printTitle="Users"
          />
        </div>
      </div>

      {/* user drawer */}
      <Drawer opened={!!selected} onClose={closeView} position="right" size="lg" title={selected?.name ?? ''}>
        {selected && (
          <UserDrawerBody
            user={selected}
            blocked={blockReason(selected)}
            onEdit={(u) => fromDrawer('edit', u)}
            onReset={(u) => fromDrawer('password', u)}
            onStatus={(u) => fromDrawer('status', u)}
          />
        )}
      </Drawer>

      <UserDialog
        opened={dialog?.kind === 'create' || dialog?.kind === 'edit'}
        user={dialog?.kind === 'edit' ? (dialogUser ?? null) : null}
        existingUsernames={users.map((u) => u.username)}
        onClose={() => setDialog(null)}
        onSubmit={save}
      />

      <ResetPasswordDialog
        opened={dialog?.kind === 'password' && !!dialogUser}
        userName={dialogUser?.name ?? ''}
        onClose={() => setDialog(null)}
        onSubmit={resetPassword}
      />

      <ContractConfirmDialog
        opened={dialog?.kind === 'status' && !!dialogUser}
        title={dialogUser?.active ? 'Deactivate user' : 'Activate user'}
        message={
          dialogUser?.active
            ? `Deactivate ${dialogUser.name}? They will no longer be able to sign in. Their past records stay as they are.`
            : `Activate ${dialogUser?.name ?? 'this user'}? They will be able to sign in again.`
        }
        confirmLabel={dialogUser?.active ? 'Deactivate' : 'Activate'}
        onClose={() => setDialog(null)}
        onConfirm={toggleStatus}
      />

      <ContractConfirmDialog
        opened={dialog?.kind === 'twofa' && !!dialogUser}
        title={dialogUser?.twoFactor ? 'Turn off two-factor' : 'Turn on two-factor'}
        message={
          dialogUser?.twoFactor
            ? `Turn off two-factor sign-in for ${dialogUser.name}? They will only need their password.`
            : `Turn on two-factor sign-in for ${dialogUser?.name ?? 'this user'}? They will get an emailed code at every sign-in.`
        }
        confirmLabel={dialogUser?.twoFactor ? 'Turn off' : 'Turn on'}
        onClose={() => setDialog(null)}
        onConfirm={toggleTwoFactor}
      />
    </DashboardLayout>
  )
}