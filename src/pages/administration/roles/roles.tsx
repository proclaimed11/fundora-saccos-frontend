import { AppIcon } from '../../../components/appIcon'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { ActionIcon, Alert, Badge, Button, Drawer, Menu, SegmentedControl, Text } from '@mantine/core'
import { DashboardLayout } from '../../../components/layout/dashboardLayout'
import { StatWidget } from '../../../components/statsWidgets'
import { CustomTable, type CustomTableColumn } from '../../../components/customTable/customTable'
import { ContractConfirmDialog } from '../../loans/contractDialogs'
import { RoleDialog, type RoleInput } from './roleDialogs'
import { MODULES, SAMPLE_ROLES, actionLabel, permissionCount, type Role } from './rolesData'
import { SAMPLE_USERS } from '../users/usersData'

const CARD = 'rounded-md bg-white shadow-[0_10px_30px_rgba(76,87,125,0.12)]'

type TabKey = 'all' | 'system' | 'custom'
type Notice = { text: string; color: 'green' | 'blue' } | null
type DialogState = { kind: 'create' } | { kind: 'edit' | 'delete'; id: number } | null

type Row = Role & { userCount: number; permissionCount: number }

const TAB_EMPTY: Record<TabKey, string> = {
  all: 'No roles yet',
  system: 'No system roles',
  custom: 'No custom roles have been created',
}

// SAMPLE ONLY: the count comes from the users list, the same sample data as the Users page
const usersWith = (role: string) => SAMPLE_USERS.filter((u) => u.role === role)

// our own rule, the API does not say when a role can be deleted
function deleteBlockReason(r: Row): string | null {
  if (r.system) return 'This role is needed by the approval chain.'
  if (r.userCount > 0) return `${r.userCount} ${r.userCount === 1 ? 'user has' : 'users have'} this role. Move them to another role first.`
  return null
}

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

function TypeBadge({ system }: { system: boolean }) {
  return (
    <Badge variant={system ? 'light' : 'outline'} color={system ? 'gray' : 'brand'} radius="sm" size="sm">
      {system ? 'System' : 'Custom'}
    </Badge>
  )
}

/* ---------- role drawer ---------- */

type DrawerProps = {
  row: Row
  onEdit: (r: Row) => void
  onDelete: (r: Row) => void
}

function RoleDrawerBody({ row: r, onEdit, onDelete }: DrawerProps) {
  const navigate = useNavigate()
  const blocked = deleteBlockReason(r)
  const members = usersWith(r.name)

  const tiles = [
    { label: 'Users', value: String(r.userCount) },
    { label: 'Permissions', value: String(r.permissionCount) },
    { label: 'Approval level', value: r.level ?? 'None' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <TypeBadge system={r.system} />
        <Text size="xs" c="dimmed">
          Created {dayjs(r.created).format('MMM D, YYYY')}
        </Text>
      </div>

      <Text size="sm" c="dimmed">
        {r.description}
      </Text>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-md bg-gray-50 px-4 py-3">
            <div className="text-xs text-gray-500">{t.label}</div>
            <div className="text-base font-medium text-gray-800">{t.value}</div>
          </div>
        ))}
      </div>

      <div>
        <SectionTitle>What this role can do</SectionTitle>
        <ul className="mt-2 space-y-2">
          {MODULES.map((m) => {
            const granted = r.permissions[m.key] ?? []
            return (
              <li key={m.key} className="flex items-start justify-between gap-3 rounded-md border border-gray-200 px-3 py-2.5">
                <span className="text-sm font-medium text-gray-800">{m.label}</span>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {granted.length === 0 ? (
                    <span className="text-xs text-gray-400">No access</span>
                  ) : (
                    granted.map((a) => (
                      <Badge key={a} variant="light" color="brand" radius="sm" size="sm">
                        {actionLabel(a)}
                      </Badge>
                    ))
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <div>
        <SectionTitle>{`Users with this role (${members.length})`}</SectionTitle>
        {members.length === 0 ? (
          <div className="mt-2 rounded-md border border-dashed border-gray-200 px-4 py-5 text-center text-xs text-gray-500">
            No user has this role yet.
          </div>
        ) : (
          <ul className="mt-2 space-y-2">
            {members.map((u) => (
              <li key={u.id} className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-800">{u.name}</div>
                  <div className="truncate text-xs text-gray-500">{u.email}</div>
                </div>
                <Badge variant="light" color={u.active ? 'green' : 'gray'} radius="sm" size="sm">
                  {u.active ? 'Active' : 'Inactive'}
                </Badge>
                <Button size="compact-xs" variant="subtle" color="brand" onClick={() => navigate(`/users?user=${u.id}`)}>
                  View
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <SectionTitle>Role details</SectionTitle>
        <Field label="Role name" value={r.name} />
        <Field label="Type" value={r.system ? 'System role' : 'Custom role'} />
        <Field label="Approval level" value={r.level ?? 'None'} />
      </div>

      {blocked && (
        <Alert color="gray" variant="light" icon={<AppIcon name="lock-keyhole" />}>
          <Text size="sm">{blocked}</Text>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="xs" leftSection={<AppIcon name="pencil" />} onClick={() => onEdit(r)}>
          Edit
        </Button>
        <Button
          size="xs"
          color="red"
          variant="light"
          disabled={!!blocked}
          leftSection={<AppIcon name="trash" />}
          onClick={() => onDelete(r)}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}

/* ---------- page ---------- */

export function RolesPage() {
  const [params, setParams] = useSearchParams()

  // UI only: changes made in this session, nothing is saved yet
  const [roles, setRoles] = useState<Role[]>(SAMPLE_ROLES)
  const [tab, setTab] = useState<TabKey>('all')
  const [dialog, setDialog] = useState<DialogState>(null)
  const [notice, setNotice] = useState<Notice>(null)

  // success banners fade away on their own
  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 9000)
    return () => clearTimeout(t)
  }, [notice])

  const rows: Row[] = roles.map((r) => ({
    ...r,
    userCount: usersWith(r.name).length,
    permissionCount: permissionCount(r.permissions),
  }))

  const system = rows.filter((r) => r.system)
  const custom = rows.filter((r) => !r.system)
  const tabData: Record<TabKey, Row[]> = { all: rows, system, custom }
  const withoutRole = SAMPLE_USERS.filter((u) => !u.role).length

  // here `color` is the icon color
  const stats = [
    { label: 'Total Roles', value: rows.length, icon: 'key-round', color: '#45bdfc' },
    { label: 'System Roles', value: system.length, icon: 'lock-keyhole', color: '#8e44ad' },
    { label: 'Custom Roles', value: custom.length, icon: 'pencil', color: 'var(--app-brand)' },
    { label: 'Users Without A Role', value: withoutRole, icon: 'users', color: '#e08a1e' },
  ]

  // /roles?role=2 opens the drawer for role 2
  const roleParam = params.get('role')
  const selected = roleParam ? (rows.find((r) => String(r.id) === roleParam) ?? null) : null
  const openView = (id: number) => setParams({ role: String(id) }, { replace: true })
  const closeView = () => setParams({}, { replace: true })

  const dialogRow = dialog && dialog.kind !== 'create' ? rows.find((r) => r.id === dialog.id) : undefined

  /* ---------- actions ---------- */

  const save = (input: RoleInput) => {
    if (dialog?.kind === 'create') {
      const id = Math.max(0, ...roles.map((r) => r.id)) + 1
      setRoles((list) => [...list, { id, ...input, system: false, created: dayjs().format('YYYY-MM-DD') }])
      setNotice({ color: 'green', text: `Role ${input.name} was created.` })
      setTab('all')
    } else if (dialogRow) {
      setRoles((list) =>
        list.map((r) =>
          r.id === dialogRow.id
            ? { ...r, description: input.description, permissions: input.permissions, ...(r.system ? {} : { name: input.name, level: input.level }) }
            : r,
        ),
      )
      setNotice({ color: 'green', text: `Role ${dialogRow.name} was updated.` })
    }
    setDialog(null)
  }

  const remove = () => {
    if (!dialogRow || deleteBlockReason(dialogRow)) return
    // TODO: DELETE /api/roles/{id}
    setRoles((list) => list.filter((r) => r.id !== dialogRow.id))
    setNotice({ color: 'blue', text: `Role ${dialogRow.name} was deleted.` })
    if (selected?.id === dialogRow.id) closeView()
    setDialog(null)
  }

  // the drawer buttons close the drawer first, then open the dialog
  const fromDrawer = (kind: 'edit' | 'delete', r: Row) => {
    closeView()
    setDialog({ kind, id: r.id })
  }

  /* ---------- columns ---------- */

  const columns: CustomTableColumn<Row>[] = [
    {
      accessor: 'name',
      header: 'Role',
      render: (r) => (
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-gray-800">{r.name}</div>
          <div className="max-w-[320px] truncate text-xs text-gray-500">{r.description}</div>
        </div>
      ),
      exportValue: (r) => `${r.name} (${r.description})`,
    },
    {
      accessor: 'level',
      header: 'Approval level',
      render: (r) =>
        r.level ? (
          <span className="whitespace-nowrap text-sm text-gray-800">{r.level}</span>
        ) : (
          <span className="text-xs text-gray-400">None</span>
        ),
      exportValue: (r) => r.level ?? 'None',
    },
    {
      accessor: 'permissionCount',
      header: 'Permissions',
      render: (r) => (
        <div>
          <div className="whitespace-nowrap text-sm text-gray-800">
            {r.permissionCount} {r.permissionCount === 1 ? 'permission' : 'permissions'}
          </div>
          <div className="whitespace-nowrap text-xs text-gray-500">
            {Object.keys(r.permissions).length} of {MODULES.length} areas
          </div>
        </div>
      ),
      exportValue: (r) => r.permissionCount,
    },
    {
      accessor: 'userCount',
      header: 'Users',
      render: (r) => <span className="text-sm text-gray-800">{r.userCount}</span>,
      exportValue: (r) => r.userCount,
    },
    {
      accessor: 'system',
      header: 'Type',
      sortable: false,
      render: (r) => <TypeBadge system={r.system} />,
      exportValue: (r) => (r.system ? 'System' : 'Custom'),
    },
    { accessor: 'created', header: 'Created', type: 'date' },
    {
      // the ⋮ menu holds every action; "id" is only used as the accessor
      accessor: 'id',
      header: 'Actions',
      sortable: false,
      align: 'right',
      width: 80,
      render: (r) => {
        const blocked = deleteBlockReason(r)
        return (
          // stop the click so the row doesn't also open the drawer
          <div onClick={(e) => e.stopPropagation()}>
            <Menu position="bottom-end" shadow="md" width={230}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="sm" aria-label={`Actions for ${r.name}`}>
                  <AppIcon name="ellipsis-vertical" />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item fw={500} leftSection={<AppIcon name="pencil" />} onClick={() => setDialog({ kind: 'edit', id: r.id })}>
                  Edit role
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<AppIcon name="eye" />} onClick={() => openView(r.id)}>
                  View details
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  disabled={!!blocked}
                  leftSection={<AppIcon name="trash" />}
                  onClick={() => setDialog({ kind: 'delete', id: r.id })}
                >
                  {blocked ? 'Cannot delete' : 'Delete role'}
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
      title="Roles"
      subtitle="What each kind of user is allowed to do"
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Administration' }, { label: 'Roles' }]}
      actions={
        <Button size="xs" leftSection={<AppIcon name="plus" />} onClick={() => setDialog({ kind: 'create' })}>
          New role
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
                  { value: 'all', label: `All (${rows.length})` },
                  { value: 'system', label: `System (${system.length})` },
                  { value: 'custom', label: `Custom (${custom.length})` },
                ]}
              />
            </div>
            <Text size="xs" c="dimmed">
              System roles drive the approval chain and cannot be deleted
            </Text>
          </div>

          <CustomTable<Row>
            size="md"
            data={tabData[tab]}
            columns={columns}
            searchInput
            searchPlaceholder="Search role"
            searchKeys={['name', 'description']}
            filters={{ created: 'date' }}
            defaultSort={{ accessor: 'name', direction: 'asc' }}
            noRecordText={TAB_EMPTY[tab]}
            onRowClick={(row) => openView(row.id)}
            exportCsv
            exportFileName="roles"
            print
            printTitle="Roles"
          />
        </div>
      </div>

      {/* role drawer */}
      <Drawer opened={!!selected} onClose={closeView} position="right" size="lg" title={selected?.name ?? ''}>
        {selected && (
          <RoleDrawerBody
            row={selected}
            onEdit={(r) => fromDrawer('edit', r)}
            onDelete={(r) => fromDrawer('delete', r)}
          />
        )}
      </Drawer>

      <RoleDialog
        opened={dialog?.kind === 'create' || dialog?.kind === 'edit'}
        role={dialog?.kind === 'edit' ? (dialogRow ?? null) : null}
        existingNames={roles.map((r) => r.name)}
        onClose={() => setDialog(null)}
        onSubmit={save}
      />

      <ContractConfirmDialog
        opened={dialog?.kind === 'delete' && !!dialogRow}
        title="Delete role"
        message={`Delete the role ${dialogRow?.name ?? ''}? This cannot be undone.`}
        confirmLabel="Delete role"
        onClose={() => setDialog(null)}
        onConfirm={remove}
      />
    </DashboardLayout>
  )
}