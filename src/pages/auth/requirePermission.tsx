import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useRoles } from '../administration/roles/rolesContext'

type GuardProps = {
  /** a MODULES key from rolesData.ts, like 'loans' */
  area: string
  /** a page key of that area, like 'approvals'. Without it the check is "anywhere in the area" */
  page?: string
  /** default 'view' */
  action?: string
}

// wraps a group of routes: without the permission the user lands on the 403 page
export function RequirePermission({ area, page, action = 'view' }: GuardProps) {
  const { can } = useRoles()
  return can(area, action, page) ? <Outlet /> : <Navigate to="/no-access" replace />
}

type CanProps = GuardProps & {
  /** shown instead of the children when the permission is missing, nothing by default */
  fallback?: ReactNode
  children: ReactNode
}

// for the later button pass: <Can area="loans" page="approvals" action="approve"><Button>Approve</Button></Can>
export function Can({ area, page, action = 'view', fallback = null, children }: CanProps) {
  const { can } = useRoles()
  return <>{can(area, action, page) ? children : fallback}</>
}