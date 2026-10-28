import { SAMPLE_ROLES } from '../roles/rolesData'
import { SAMPLE_USERS } from '../users/usersData'

// field names follow the API: GET /api/approval-hierarchys/default and /{id}/levels
export type ApprovalHierarchy = {
  id: number
  name: string
  isDefault: boolean
  isActive: boolean
  created: string // ISO date, not in the API yet
}

export type ApprovalLevel = {
  id: number
  hierarchyId: number
  levelNo: number
  levelName: string
  requiredRole: string // must match Role.name exactly
  isActive: boolean
}

// SAMPLE ONLY: replaced by GET /api/approval-hierarchys later
export const SAMPLE_HIERARCHIES: ApprovalHierarchy[] = [
  { id: 1, name: 'Default v1 hierarchy', isDefault: true, isActive: true, created: '2026-01-05' },
  { id: 2, name: 'Large loans', isDefault: false, isActive: false, created: '2026-09-15' },
]

// the default hierarchy matches the chain used on the Approvals page
export const SAMPLE_LEVELS: ApprovalLevel[] = [
  { id: 1, hierarchyId: 1, levelNo: 1, levelName: 'Admin', requiredRole: 'Admin', isActive: true },
  { id: 2, hierarchyId: 1, levelNo: 2, levelName: 'Manager', requiredRole: 'Loan Officer', isActive: true },
  { id: 3, hierarchyId: 1, levelNo: 3, levelName: 'Committee', requiredRole: 'Approver', isActive: true },
  { id: 4, hierarchyId: 2, levelNo: 1, levelName: 'Manager', requiredRole: 'Loan Officer', isActive: true },
  { id: 5, hierarchyId: 2, levelNo: 2, levelName: 'Committee', requiredRole: 'Approver', isActive: true },
  { id: 6, hierarchyId: 2, levelNo: 3, levelName: 'Board', requiredRole: 'Admin', isActive: true },
]

// the roles a level can ask for, they come from the Roles page
export const ROLE_NAMES = SAMPLE_ROLES.map((r) => r.name)

// SAMPLE ONLY: the same sample users as the Users page
export const activeUsersWithRole = (role: string) => SAMPLE_USERS.filter((u) => u.role === role && u.active)

// the single level used when the Admin approves everything alone, it is not stored as a hierarchy
export const ADMIN_ONLY_LEVEL: ApprovalLevel = {
  id: 0,
  hierarchyId: 0,
  levelNo: 1,
  levelName: 'Admin',
  requiredRole: 'Admin',
  isActive: true,
}