export type Module = { key: string; label: string; actions: string[] }

export const ACTIONS = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'approve', label: 'Approve' },
  { key: 'delete', label: 'Delete' },
]

export const actionLabel = (key: string) => ACTIONS.find((a) => a.key === key)?.label ?? key

// the areas of the system a role can touch, they follow the sidebar
export const MODULES: Module[] = [
  { key: 'applicants', label: 'Applicants', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'loans', label: 'Loans and approvals', actions: ['view', 'create', 'edit', 'approve', 'delete'] },
  { key: 'repayments', label: 'Repayments', actions: ['view', 'create', 'edit'] },
  { key: 'collections', label: 'Collections', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'accounting', label: 'Accounting', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'reports', label: 'Reports', actions: ['view'] },
  { key: 'administration', label: 'Administration', actions: ['view', 'create', 'edit', 'delete'] },
]

// the approval chain: each level needs a user whose role covers it
export const LEVELS = ['Level 1 · Admin', 'Level 2 · Manager', 'Level 3 · Committee']

// module key -> the actions this role may do
export type Permissions = Record<string, string[]>

export type Role = {
  id: number
  name: string
  description: string
  level: string | null // approval level this role covers
  system: boolean // system roles are needed by the approval chain and cannot be deleted
  permissions: Permissions
  created: string // ISO date
}

export const permissionCount = (p: Permissions) => Object.values(p).reduce((s, list) => s + list.length, 0)

const everything: Permissions = Object.fromEntries(MODULES.map((m) => [m.key, [...m.actions]]))

// SAMPLE ONLY: replaced by GET /api/roles later
export const SAMPLE_ROLES: Role[] = [
  { id: 1, name: 'Admin', description: 'Full access to the whole system', level: LEVELS[0], system: true, permissions: everything, created: '2026-01-05' },
  {
    id: 2,
    name: 'Loan Officer',
    description: 'Registers applicants, handles loan applications and records repayments',
    level: LEVELS[1],
    system: true,
    permissions: {
      applicants: ['view', 'create', 'edit'],
      loans: ['view', 'create', 'edit'],
      repayments: ['view', 'create'],
      collections: ['view'],
      reports: ['view'],
    },
    created: '2026-01-05',
  },
  {
    id: 3,
    name: 'Approver',
    description: 'Decides loan applications as part of the credit committee',
    level: LEVELS[2],
    system: true,
    permissions: { applicants: ['view'], loans: ['view', 'approve'], reports: ['view'] },
    created: '2026-01-05',
  },
  {
    id: 4,
    name: 'Collector',
    description: 'Follows up overdue loans and logs contact with borrowers',
    level: null,
    system: false,
    permissions: { applicants: ['view'], repayments: ['view'], collections: ['view', 'create', 'edit'] },
    created: '2026-04-18',
  },
]