// field names follow the API: GET /api/audit-logs
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'APPROVE'

export type AuditLog = {
  id: number
  userId: number | null // null when the system did it
  action: AuditAction
  entityType: string
  entityId: number | null
  oldValues: string // JSON text
  newValues: string // JSON text
  ipAddress: string
  createdAt: string // ISO date-time
}

// the API example only shows CREATE, UPDATE and DELETE, LOGIN and APPROVE are our assumption
export const ACTION: Record<AuditAction, { label: string; color: string }> = {
  CREATE: { label: 'Created', color: 'green' },
  UPDATE: { label: 'Updated', color: 'blue' },
  DELETE: { label: 'Deleted', color: 'red' },
  LOGIN: { label: 'Signed in', color: 'gray' },
  APPROVE: { label: 'Approved', color: 'teal' },
}

// the entity types are our assumption, the API example only shows LOAN
export const ENTITY: Record<string, { label: string; path: (id: number) => string | null }> = {
  LOAN: { label: 'Loan', path: (id) => `/loans/${id}` },
  APPLICANT: { label: 'Applicant', path: (id) => `/applicants/${id}` },
  LOAN_APPLICATION: { label: 'Loan application', path: (id) => `/loan-applications/${id}` },
  USER: { label: 'User', path: (id) => `/users?user=${id}` },
  ROLE: { label: 'Role', path: (id) => `/roles?role=${id}` },
  CHART_OF_ACCOUNT: { label: 'Account', path: (id) => `/chart-of-accounts?account=${id}` },
  PAYMENT: { label: 'Payment', path: (id) => `/payments?view=${id}` },
  SESSION: { label: 'Session', path: () => null },
}

export const entityLabel = (type: string) => ENTITY[type]?.label ?? type

// SAMPLE ONLY: replaced by GET /api/audit-logs later, userId is joined to the users list
export const SAMPLE_AUDIT_LOGS: AuditLog[] = [
  { id: 1, userId: 1, action: 'LOGIN', entityType: 'SESSION', entityId: null, oldValues: '{}', newValues: '{"twoFactor":true}', ipAddress: '41.59.80.12', createdAt: '2026-10-27T08:31:00' },
  { id: 2, userId: 2, action: 'CREATE', entityType: 'PAYMENT', entityId: 12, oldValues: '{}', newValues: '{"loanId":7,"amount":178525,"method":"CASH"}', ipAddress: '41.59.80.44', createdAt: '2026-10-27T09:12:00' },
  { id: 3, userId: 2, action: 'UPDATE', entityType: 'APPLICANT', entityId: 6, oldValues: '{"phone":"0654777000","status":"PENDING_KYC"}', newValues: '{"phone":"0654777888","status":"PENDING_KYC"}', ipAddress: '41.59.80.44', createdAt: '2026-10-27T10:05:00' },
  { id: 4, userId: 4, action: 'APPROVE', entityType: 'LOAN_APPLICATION', entityId: 3, oldValues: '{"status":"PENDING_APPROVAL","level":2}', newValues: '{"status":"PENDING_APPROVAL","level":3}', ipAddress: '102.68.12.9', createdAt: '2026-10-26T15:20:00' },
  { id: 5, userId: 1, action: 'CREATE', entityType: 'CHART_OF_ACCOUNT', entityId: 15, oldValues: '{}', newValues: '{"accountCode":"MISC_EXPENSE","accountName":"Miscellaneous Expenses","accountTypeName":"EXPENSE"}', ipAddress: '41.59.80.12', createdAt: '2026-10-26T11:42:00' },
  { id: 6, userId: 1, action: 'UPDATE', entityType: 'USER', entityId: 7, oldValues: '{"role":null,"active":true}', newValues: '{"role":"Collector","active":true}', ipAddress: '41.59.80.12', createdAt: '2026-10-25T14:08:00' },
  { id: 7, userId: 3, action: 'CREATE', entityType: 'LOAN', entityId: 5, oldValues: '{}', newValues: '{"principalAmount":3000000,"status":"PENDING_DISBURSEMENT"}', ipAddress: '41.59.81.20', createdAt: '2026-10-24T16:30:00' },
  { id: 8, userId: 1, action: 'DELETE', entityType: 'ROLE', entityId: 9, oldValues: '{"name":"Trainee","level":null}', newValues: '{}', ipAddress: '41.59.80.12', createdAt: '2026-10-22T09:15:00' },
  { id: 9, userId: null, action: 'UPDATE', entityType: 'LOAN', entityId: 5, oldValues: '{"overdueDays":120,"isNpl":true}', newValues: '{"overdueDays":121,"isNpl":true}', ipAddress: '127.0.0.1', createdAt: '2026-10-22T07:00:00' },
  { id: 10, userId: 5, action: 'LOGIN', entityType: 'SESSION', entityId: null, oldValues: '{}', newValues: '{"twoFactor":false}', ipAddress: '197.250.4.77', createdAt: '2026-10-20T08:02:00' },
]