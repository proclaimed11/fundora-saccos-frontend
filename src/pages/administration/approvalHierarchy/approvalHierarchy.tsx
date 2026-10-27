import { AppIcon } from '../../../components/appIcon'
import { Fragment, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { ActionIcon, Alert, Badge, Button, Menu, Text } from '@mantine/core'
import { DashboardLayout } from '../../../components/layout/dashboardLayout'
import { StatWidget } from '../../../components/statsWidgets'
import { ContractConfirmDialog } from '../../loans/contractDialogs'
import { HierarchyDialog, LevelDialog, type LevelInput } from './approvalHierarchyDialogs'
import {
  SAMPLE_HIERARCHIES,
  SAMPLE_LEVELS,
  activeUsersWithRole,
  type ApprovalHierarchy,
  type ApprovalLevel,
} from './approvalHierarchyData'

const CARD = 'rounded-md bg-white shadow-[0_10px_30px_rgba(76,87,125,0.12)]'

type Notice = { text: string; color: 'green' | 'blue' } | null

type DialogState =
  | { kind: 'hierarchy-create' | 'hierarchy-rename' | 'hierarchy-delete' | 'hierarchy-default' | 'level-create' }
  | { kind: 'level-edit' | 'level-delete'; id: number }
  | null

/* ---------- small pieces ---------- */

function SectionTitle({ children }: { children: string }) {
  return (
    <Text size="sm" fw={600} mb={4}>
      {children}
    </Text>
  )
}

function HierarchyBadges({ h }: { h: ApprovalHierarchy }) {
  return (
    <>
      {h.isDefault && (
        <Badge variant="light" color="brand" radius="sm" size="sm">
          Default
        </Badge>
      )}
      <Badge variant="light" color={h.isActive ? 'green' : 'gray'} radius="sm" size="sm">
        {h.isActive ? 'Active' : 'Inactive'}
      </Badge>
    </>
  )
}

/* ---------- page ---------- */

export function ApprovalHierarchyPage() {
  const navigate = useNavigate()

  // UI only: changes made in this session, nothing is saved yet
  const [hierarchies, setHierarchies] = useState<ApprovalHierarchy[]>(SAMPLE_HIERARCHIES)
  const [levels, setLevels] = useState<ApprovalLevel[]>(SAMPLE_LEVELS)
  const [selectedId, setSelectedId] = useState<number>(
    SAMPLE_HIERARCHIES.find((h) => h.isDefault)?.id ?? SAMPLE_HIERARCHIES[0].id,
  )
  const [dialog, setDialog] = useState<DialogState>(null)
  const [notice, setNotice] = useState<Notice>(null)

  // success banners fade away on their own
  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 9000)
    return () => clearTimeout(t)
  }, [notice])

  const levelsOf = (id: number) => levels.filter((l) => l.hierarchyId === id).sort((a, b) => a.levelNo - b.levelNo)

  const defaultHierarchy = hierarchies.find((h) => h.isDefault)
  const selected = hierarchies.find((h) => h.id === selectedId) ?? hierarchies[0]
  const current = levelsOf(selected.id)
  const chain = current.filter((l) => l.isActive)

  // what the loan applications really go through
  const defaultChain = defaultHierarchy ? levelsOf(defaultHierarchy.id).filter((l) => l.isActive) : []
  const uncovered = defaultChain.filter((l) => activeUsersWithRole(l.requiredRole).length === 0)
  const approvers = new Set(defaultChain.flatMap((l) => activeUsersWithRole(l.requiredRole).map((u) => u.id))).size

  // here `color` is the icon color
  const stats = [
    { label: 'Hierarchies', value: hierarchies.length, icon: 'network', color: '#45bdfc' },
    { label: 'Levels In Default Chain', value: defaultChain.length, icon: 'square-check', color: 'var(--app-brand)' },
    { label: 'Approvers Available', value: approvers, icon: 'users', color: '#8e44ad' },
    { label: 'Levels Without Approver', value: uncovered.length, icon: 'triangle-alert', color: uncovered.length > 0 ? '#ef4444' : '#0077b5' },
  ]

  // our own rules, the API does not enforce them
  const defaultBlock = !selected.isActive
    ? 'Activate this hierarchy first.'
    : chain.length === 0
      ? 'Add at least one active level first.'
      : null

  const deleteBlock = selected.isDefault
    ? 'The default hierarchy cannot be deleted. Make another one the default first.'
    : null

  // the default hierarchy always needs a level that decides
  const levelBlock = (l: ApprovalLevel): string | null =>
    selected.isDefault && l.isActive && chain.length <= 1
      ? 'The default hierarchy needs at least one active level.'
      : null

  const dialogLevel = dialog && 'id' in dialog ? levels.find((l) => l.id === dialog.id) : undefined

  const saveLevels = (next: ApprovalLevel[]) =>
    setLevels((all) => [...all.filter((l) => l.hierarchyId !== selected.id), ...next])

  const renumber = (list: ApprovalLevel[]) => list.map((l, i) => ({ ...l, levelNo: i + 1 }))

  /* ---------- hierarchy actions ---------- */

  const createHierarchy = (name: string) => {
    const id = Math.max(0, ...hierarchies.map((h) => h.id)) + 1
    setHierarchies((list) => [
      ...list,
      { id, name, isDefault: false, isActive: true, created: dayjs().format('YYYY-MM-DD') },
    ])
    setSelectedId(id)
    setNotice({ color: 'green', text: `Hierarchy ${name} was created. Add its levels next.` })
    setDialog(null)
  }

  const renameHierarchy = (name: string) => {
    setHierarchies((list) => list.map((h) => (h.id === selected.id ? { ...h, name } : h)))
    setNotice({ color: 'green', text: `The hierarchy was renamed to ${name}.` })
    setDialog(null)
  }

  const makeDefault = () => {
    if (defaultBlock) return
    // TODO: PUT /api/approval-hierarchys/{id} { isDefault: true }, and the old default { isDefault: false }
    //       The API has no rule that keeps a single default, it has to be enforced in the backend too.
    setHierarchies((list) => list.map((h) => ({ ...h, isDefault: h.id === selected.id })))
    setNotice({ color: 'green', text: `${selected.name} is now the default. New approvals follow its ${chain.length} levels.` })
    setDialog(null)
  }

  const toggleHierarchy = () => {
    if (selected.isDefault && selected.isActive) return
    // TODO: PUT /api/approval-hierarchys/{id} { isActive }
    setHierarchies((list) => list.map((h) => (h.id === selected.id ? { ...h, isActive: !h.isActive } : h)))
    setNotice({ color: 'blue', text: `${selected.name} was ${selected.isActive ? 'deactivated' : 'activated'}.` })
  }

  const removeHierarchy = () => {
    if (deleteBlock) return
    // TODO: DELETE /api/approval-hierarchys/{id}
    setHierarchies((list) => list.filter((h) => h.id !== selected.id))
    setLevels((list) => list.filter((l) => l.hierarchyId !== selected.id))
    setNotice({ color: 'blue', text: `Hierarchy ${selected.name} was deleted.` })
    setSelectedId(defaultHierarchy?.id ?? hierarchies[0].id)
    setDialog(null)
  }

  /* ---------- level actions ---------- */

  const addLevel = (input: LevelInput) => {
    const id = Math.max(0, ...levels.map((l) => l.id)) + 1
    saveLevels([...current, { id, hierarchyId: selected.id, levelNo: current.length + 1, isActive: true, ...input }])
    setNotice({ color: 'green', text: `Level ${input.levelName} was added to ${selected.name}.` })
    setDialog(null)
  }

  const editLevel = (input: LevelInput) => {
    if (!dialogLevel) return
    saveLevels(current.map((l) => (l.id === dialogLevel.id ? { ...l, ...input } : l)))
    setNotice({ color: 'green', text: `Level ${input.levelName} was updated.` })
    setDialog(null)
  }

  const toggleLevel = (l: ApprovalLevel) => {
    if (levelBlock(l)) return
    // TODO: PUT /api/approval-levels/{id} { isActive }
    saveLevels(current.map((x) => (x.id === l.id ? { ...x, isActive: !x.isActive } : x)))
    setNotice({
      color: 'blue',
      text: l.isActive
        ? `${l.levelName} is now skipped. Applications go straight past it.`
        : `${l.levelName} is back in the chain.`,
    })
  }

  const removeLevel = () => {
    if (!dialogLevel || levelBlock(dialogLevel)) return
    // TODO: DELETE /api/approval-levels/{id}, then PUT the new levelNo of every level after it
    saveLevels(renumber(current.filter((l) => l.id !== dialogLevel.id)))
    setNotice({ color: 'blue', text: `Level ${dialogLevel.levelName} was removed and the rest renumbered.` })
    setDialog(null)
  }

  // swap a level with its neighbour, then number the levels again
  const move = (l: ApprovalLevel, step: -1 | 1) => {
    const list = [...current]
    const i = list.findIndex((x) => x.id === l.id)
    const j = i + step
    if (j < 0 || j >= list.length) return
    const other = list[j]
    list[j] = list[i]
    list[i] = other
    // TODO: PUT /api/approval-levels/{id} { levelNo } for each level that changed place
    saveLevels(renumber(list))
  }

  return (
    <DashboardLayout
      title="Approval Hierarchy"
      subtitle="The chain of levels every loan application goes through before it is approved"
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Administration' }, { label: 'Approval Hierarchy' }]}
      actions={
        <Button size="xs" leftSection={<AppIcon name="plus" />} onClick={() => setDialog({ kind: 'hierarchy-create' })}>
          New hierarchy
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

        {uncovered.length > 0 && (
          <Alert color="red" variant="light" icon={<AppIcon name="triangle-alert" />}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Text size="sm">
                {uncovered.map((l) => `${l.levelName} (${l.requiredRole})`).join(', ')}{' '}
                {uncovered.length === 1 ? 'has' : 'have'} no active user in the default chain. Applications will wait
                at {uncovered.length === 1 ? 'that level' : 'those levels'} until someone is given the role.
              </Text>
              <Button size="compact-xs" variant="default" onClick={() => navigate('/users')}>
                Open users
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

        {/* row 2: the hierarchies and the chain of the selected one */}
        <div className="grid items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* hierarchy list */}
          <div className={`${CARD} p-4`}>
            <SectionTitle>Hierarchies</SectionTitle>
            <ul className="mt-2 space-y-2">
              {hierarchies.map((h) => {
                const active = levelsOf(h.id).filter((l) => l.isActive).length
                return (
                  <li key={h.id}>
                    <button
                      type="button"
                      aria-pressed={h.id === selected.id}
                      onClick={() => setSelectedId(h.id)}
                      className={`w-full rounded-md border bg-white px-3 py-2.5 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 ${
                        h.id === selected.id ? 'border-brand ring-2 ring-brand' : 'border-gray-200'
                      }`}
                    >
                      <div className="truncate text-sm font-medium text-gray-800">{h.name}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <HierarchyBadges h={h} />
                      </div>
                      <div className="mt-1.5 text-xs text-gray-500">
                        {active} active {active === 1 ? 'level' : 'levels'}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
            <p className="mt-3 text-xs text-gray-500">Only the default hierarchy is used for new approvals.</p>
          </div>

          {/* selected hierarchy */}
          <div className={`${CARD} p-5`}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-base font-semibold text-gray-800">{selected.name}</div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <HierarchyBadges h={selected} />
                  <Text size="xs" c="dimmed">
                    Created {dayjs(selected.created).format('MMM D, YYYY')}
                  </Text>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!selected.isDefault && (
                  <Button
                    size="xs"
                    variant="default"
                    disabled={!!defaultBlock}
                    leftSection={<AppIcon name="circle-check" />}
                    onClick={() => setDialog({ kind: 'hierarchy-default' })}
                  >
                    Make default
                  </Button>
                )}
                <Button size="xs" leftSection={<AppIcon name="plus" />} onClick={() => setDialog({ kind: 'level-create' })}>
                  Add level
                </Button>
                <Menu position="bottom-end" shadow="md" width={230}>
                  <Menu.Target>
                    <ActionIcon variant="default" size={30} aria-label={`Actions for ${selected.name}`}>
                      <AppIcon name="ellipsis-vertical" />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item leftSection={<AppIcon name="pencil" />} onClick={() => setDialog({ kind: 'hierarchy-rename' })}>
                      Rename
                    </Menu.Item>
                    <Menu.Item
                      disabled={selected.isDefault && selected.isActive}
                      leftSection={<AppIcon name={selected.isActive ? 'circle-x' : 'circle-check'} />}
                      onClick={toggleHierarchy}
                    >
                      {selected.isActive ? 'Deactivate' : 'Activate'}
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      disabled={!!deleteBlock}
                      leftSection={<AppIcon name="trash" />}
                      onClick={() => setDialog({ kind: 'hierarchy-delete' })}
                    >
                      {deleteBlock ? 'Cannot delete' : 'Delete hierarchy'}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </div>
            </div>

            {!selected.isDefault && defaultBlock && (
              <Alert color="gray" variant="light" icon={<AppIcon name="lock-keyhole" />} mb="md">
                <Text size="sm">This hierarchy cannot be the default yet. {defaultBlock}</Text>
              </Alert>
            )}

            {/* the chain, as an application sees it */}
            <div className="mb-5">
              <SectionTitle>The path of an application</SectionTitle>
              {chain.length === 0 ? (
                <div className="mt-2 rounded-md border border-dashed border-gray-200 px-4 py-5 text-center text-xs text-gray-500">
                  No active level yet, so there is no chain. Add a level to start.
                </div>
              ) : (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" color="gray" radius="sm" size="md" tt="none">
                    Submitted
                  </Badge>
                  {chain.map((l) => (
                    <Fragment key={l.id}>
                      <AppIcon name="chevron-right" className="text-gray-400" />
                      <Badge variant="light" color="brand" radius="sm" size="md" tt="none">
                        {l.levelName} · {l.requiredRole}
                      </Badge>
                    </Fragment>
                  ))}
                  <AppIcon name="chevron-right" className="text-gray-400" />
                  <Badge variant="filled" color="green" radius="sm" size="md" tt="none">
                    Approved
                  </Badge>
                </div>
              )}
            </div>

            {/* the levels */}
            <div>
              <SectionTitle>{`Levels (${current.length})`}</SectionTitle>
              <p className="mb-3 text-xs text-gray-500">
                Each level must approve in order. A rejection at any level stops the application. A skipped level is
                kept but not asked.
              </p>

              {current.length === 0 ? (
                <div className="rounded-md border border-dashed border-gray-200 px-4 py-6 text-center text-xs text-gray-500">
                  This hierarchy has no levels yet.
                </div>
              ) : (
                <ul className="space-y-2">
                  {current.map((l, i) => {
                    const users = activeUsersWithRole(l.requiredRole)
                    const blocked = levelBlock(l)
                    return (
                      <li
                        key={l.id}
                        className={`flex items-start gap-3 rounded-md border px-3 py-3 ${
                          l.isActive ? 'border-gray-200' : 'border-dashed border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                            l.isActive ? 'bg-brand-subtle text-brand-dark' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {l.levelNo}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-sm font-medium ${l.isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                              {l.levelName}
                            </span>
                            {!l.isActive && (
                              <Badge variant="light" color="gray" radius="sm" size="sm">
                                Skipped
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">Required role: {l.requiredRole}</div>
                          <div
                            className={`mt-1 text-xs ${
                              users.length === 0 && l.isActive ? 'font-medium text-red-600' : 'text-gray-500'
                            }`}
                          >
                            {users.length === 0
                              ? 'No active user has this role'
                              : `${users.length} active ${users.length === 1 ? 'user' : 'users'}: ${users
                                  .map((u) => u.name)
                                  .join(', ')}`}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            disabled={i === 0}
                            aria-label={`Move ${l.levelName} up`}
                            onClick={() => move(l, -1)}
                          >
                            <AppIcon name="arrow-up" />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            disabled={i === current.length - 1}
                            aria-label={`Move ${l.levelName} down`}
                            onClick={() => move(l, 1)}
                          >
                            <AppIcon name="arrow-down" />
                          </ActionIcon>

                          <Menu position="bottom-end" shadow="md" width={230}>
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray" size="sm" aria-label={`Actions for ${l.levelName}`}>
                                <AppIcon name="ellipsis-vertical" />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item fw={500} leftSection={<AppIcon name="pencil" />} onClick={() => setDialog({ kind: 'level-edit', id: l.id })}>
                                Edit level
                              </Menu.Item>
                              <Menu.Item
                                disabled={!!blocked}
                                leftSection={<AppIcon name={l.isActive ? 'circle-x' : 'circle-check'} />}
                                onClick={() => toggleLevel(l)}
                              >
                                {l.isActive ? (blocked ? 'Cannot skip' : 'Skip this level') : 'Include this level'}
                              </Menu.Item>
                              <Menu.Divider />
                              <Menu.Item
                                color="red"
                                disabled={!!blocked}
                                leftSection={<AppIcon name="trash" />}
                                onClick={() => setDialog({ kind: 'level-delete', id: l.id })}
                              >
                                {blocked ? 'Cannot delete' : 'Delete level'}
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <Alert color="blue" variant="light" icon={<AppIcon name="info" />} mt="md">
              <Text size="xs">
                The approver's role must match the level's required role exactly. Roles are managed on the Roles page,
                and people are given a role on the Users page.
              </Text>
            </Alert>
          </div>
        </div>
      </div>

      <HierarchyDialog
        opened={dialog?.kind === 'hierarchy-create' || dialog?.kind === 'hierarchy-rename'}
        hierarchy={dialog?.kind === 'hierarchy-rename' ? selected : null}
        existingNames={hierarchies.map((h) => h.name)}
        onClose={() => setDialog(null)}
        onSubmit={dialog?.kind === 'hierarchy-rename' ? renameHierarchy : createHierarchy}
      />

      <LevelDialog
        opened={dialog?.kind === 'level-create' || dialog?.kind === 'level-edit'}
        level={dialog?.kind === 'level-edit' ? (dialogLevel ?? null) : null}
        hierarchyName={selected.name}
        existingNames={current.filter((l) => l.id !== dialogLevel?.id || dialog?.kind !== 'level-edit').map((l) => l.levelName)}
        onClose={() => setDialog(null)}
        onSubmit={dialog?.kind === 'level-edit' ? editLevel : addLevel}
      />

      <ContractConfirmDialog
        opened={dialog?.kind === 'hierarchy-default'}
        title="Make default"
        message={`Make ${selected.name} the default? New approvals will go through its ${chain.length} ${
          chain.length === 1 ? 'level' : 'levels'
        }${defaultHierarchy ? `, and ${defaultHierarchy.name} stops being the default` : ''}.`}
        confirmLabel="Make default"
        onClose={() => setDialog(null)}
        onConfirm={makeDefault}
      />

      <ContractConfirmDialog
        opened={dialog?.kind === 'hierarchy-delete' && !deleteBlock}
        title="Delete hierarchy"
        message={`Delete ${selected.name} and its ${current.length} ${current.length === 1 ? 'level' : 'levels'}? This cannot be undone.`}
        confirmLabel="Delete hierarchy"
        onClose={() => setDialog(null)}
        onConfirm={removeHierarchy}
      />

      <ContractConfirmDialog
        opened={dialog?.kind === 'level-delete' && !!dialogLevel}
        title="Delete level"
        message={`Remove the ${dialogLevel?.levelName ?? ''} level from ${selected.name}? The remaining levels are renumbered.`}
        confirmLabel="Delete level"
        onClose={() => setDialog(null)}
        onConfirm={removeLevel}
      />
    </DashboardLayout>
  )
}