import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../../../auth/authContext'
import { ADMIN_ROLE, RolesContext, type RolesContextValue } from './rolesContext'
import { SAMPLE_ROLES, permits, type Role } from './rolesData'

// bump the version if the shape of a role changes, old saved data is then ignored
const ROLES_KEY = 'fundora-roles-v2'

const clone = (list: Role[]): Role[] =>
  list.map((r) => ({
    ...r,
    permissions: Object.fromEntries(Object.entries(r.permissions).map(([k, v]) => [k, [...v]])),
  }))

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isRole(value: unknown): value is Role {
  if (!isRecord(value)) return false
  const { id, name, description, level, system, permissions, created } = value
  return (
    typeof id === 'number' &&
    typeof name === 'string' &&
    typeof description === 'string' &&
    (level === null || typeof level === 'string') &&
    typeof system === 'boolean' &&
    typeof created === 'string' &&
    isRecord(permissions) &&
    Object.values(permissions).every((list) => Array.isArray(list) && list.every((a) => typeof a === 'string'))
  )
}

function loadRoles(): Role[] {
  try {
    const stored = window.localStorage.getItem(ROLES_KEY)
    if (!stored) return clone(SAMPLE_ROLES)
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return clone(SAMPLE_ROLES)

    const valid = parsed.filter(isRole)
    if (valid.length === 0) return clone(SAMPLE_ROLES)

    // a system role must never be missing, the approval chain looks them up by name
    const missing = SAMPLE_ROLES.filter((s) => s.system && !valid.some((r) => r.system && r.name === s.name))
    return [...clone(missing), ...valid]
  } catch {
    return clone(SAMPLE_ROLES)
  }
}

export function RolesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [roles, setRoles] = useState<Role[]>(loadRoles)

  // every edit made on the Roles page is saved, so a refresh keeps it
  useEffect(() => {
    try {
      window.localStorage.setItem(ROLES_KEY, JSON.stringify(roles))
    } catch {
      // storage can be full or blocked, the app still works for this session
    }
  }, [roles])

  const resetRoles = useCallback(() => setRoles(clone(SAMPLE_ROLES)), [])

  // the signed-in user's role, found by name (the login response will carry the role name)
  const currentRole = useMemo(() => roles.find((r) => r.name === user?.role) ?? null, [roles, user])

  const can = useCallback(
    (area?: string | null, action = 'view', page?: string) => {
      if (!area) return true // open to everyone
      if (!currentRole) return false // a user with no role
      if (currentRole.system && currentRole.name === ADMIN_ROLE) return true
      return permits(currentRole.permissions, area, action, page)
    },
    [currentRole],
  )

  const value = useMemo<RolesContextValue>(
    () => ({ roles, setRoles, resetRoles, currentRole, can }),
    [roles, resetRoles, currentRole, can],
  )

  return <RolesContext.Provider value={value}>{children}</RolesContext.Provider>
}