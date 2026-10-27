import { AppIcon } from '../../../components/appIcon'
import { useEffect, useState } from 'react'
import { Alert, Button, Checkbox, Modal, Select, Text, TextInput, Textarea } from '@mantine/core'
import { ACTIONS, LEVELS, MODULES, permissionCount, type Permissions, type Role } from './rolesData'

const NO_LEVEL = 'No approval level'

export type RoleInput = {
  name: string
  description: string
  level: string | null
  permissions: Permissions
}

type Props = {
  opened: boolean
  /** null means a new role is being created */
  role: Role | null
  existingNames: string[]
  onClose: () => void
  onSubmit: (input: RoleInput) => void
}

type Errors = Partial<Record<'name' | 'description' | 'permissions', string>>

const GRID = 'grid grid-cols-[minmax(0,1fr)_repeat(5,64px)] items-center gap-2'

export function RoleDialog({ opened, role, existingNames, onClose, onSubmit }: Props) {
  const editing = role !== null
  const system = role?.system ?? false

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState<string>(NO_LEVEL)
  const [perms, setPerms] = useState<Permissions>({})
  const [errors, setErrors] = useState<Errors>({})

  useEffect(() => {
    if (!opened) return
    setName(role?.name ?? '')
    setDescription(role?.description ?? '')
    setLevel(role?.level ?? NO_LEVEL)
    setPerms(role ? Object.fromEntries(Object.entries(role.permissions).map(([k, v]) => [k, [...v]])) : {})
    setErrors({})
  }, [opened, role])

  const clear = (key: keyof Errors) => setErrors((e) => ({ ...e, [key]: undefined }))

  const toggle = (module: string, action: string) => {
    setPerms((prev) => {
      const current = prev[module] ?? []
      const next = current.includes(action) ? current.filter((a) => a !== action) : [...current, action]
      return { ...prev, [module]: next }
    })
    clear('permissions')
  }

  const selectAll = () => {
    setPerms(Object.fromEntries(MODULES.map((m) => [m.key, [...m.actions]])))
    clear('permissions')
  }

  const total = permissionCount(perms)

  const submit = () => {
    const found: Errors = {}
    const n = name.trim()

    if (!n) found.name = 'Enter the role name'
    else if (existingNames.some((x) => x.toLowerCase() === n.toLowerCase() && x !== role?.name)) {
      found.name = 'This role name is already used'
    }
    if (!description.trim()) found.description = 'Say what this role is for'
    if (total === 0) found.permissions = 'Give the role at least one permission'

    setErrors(found)
    if (Object.keys(found).length > 0) return

    // TODO: POST /api/roles, or PUT /api/roles/{id} when editing (the permission fields come from the Role model)
    onSubmit({
      name: n,
      description: description.trim(),
      level: level === NO_LEVEL ? null : level,
      permissions: Object.fromEntries(Object.entries(perms).filter(([, list]) => list.length > 0)),
    })
  }

  return (
    <Modal opened={opened} onClose={onClose} title={editing ? 'Edit role' : 'New role'} size={760} centered>
      <div className="space-y-4">
        {system && (
          <Alert color="yellow" variant="light" icon={<AppIcon name="lock-keyhole" />}>
            <Text size="xs">
              This is a system role. The approval chain looks it up by name, so the name and approval level stay
              fixed. You can still change the description and permissions.
            </Text>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Role name"
            placeholder="Branch Manager"
            size="sm"
            readOnly={system}
            disabled={system}
            value={name}
            onChange={(e) => {
              setName(e.currentTarget.value)
              clear('name')
            }}
            error={errors.name}
          />
          <Select
            label="Approval level"
            description="The level of the approval chain this role can decide"
            size="sm"
            data={[NO_LEVEL, ...LEVELS]}
            allowDeselect={false}
            disabled={system}
            value={level}
            onChange={(v) => setLevel(v ?? NO_LEVEL)}
          />
        </div>

        <Textarea
          label="Description"
          placeholder="What people with this role do"
          size="sm"
          autosize
          minRows={2}
          value={description}
          onChange={(e) => {
            setDescription(e.currentTarget.value)
            clear('description')
          }}
          error={errors.description}
        />

        {/* the permission matrix */}
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <Text size="sm" fw={600}>
                Permissions
              </Text>
              <Text size="xs" c="dimmed">
                {total} selected
              </Text>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="compact-xs" variant="default" onClick={selectAll}>
                Select all
              </Button>
              <Button type="button" size="compact-xs" variant="subtle" color="gray" onClick={() => setPerms({})}>
                Clear all
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[560px] rounded-md border border-gray-200">
              <div className={`${GRID} border-b border-gray-100 bg-gray-50 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-gray-500`}>
                <span>Area</span>
                {ACTIONS.map((a) => (
                  <span key={a.key} className="text-center">
                    {a.label}
                  </span>
                ))}
              </div>

              {MODULES.map((m) => (
                <div key={m.key} className={`${GRID} border-b border-gray-100 px-3 py-2.5 last:border-b-0`}>
                  <span className="text-sm font-medium text-gray-800">{m.label}</span>
                  {ACTIONS.map((a) => (
                    <div key={a.key} className="flex justify-center">
                      {m.actions.includes(a.key) ? (
                        <Checkbox
                          size="xs"
                          aria-label={`${a.label} ${m.label}`}
                          checked={(perms[m.key] ?? []).includes(a.key)}
                          onChange={() => toggle(m.key, a.key)}
                        />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          {errors.permissions && (
            <Text size="sm" c="red" mt={6}>
              {errors.permissions}
            </Text>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <Button size="xs" variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button size="xs" leftSection={<AppIcon name="check" />} onClick={submit}>
            {editing ? 'Save changes' : 'Create role'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}