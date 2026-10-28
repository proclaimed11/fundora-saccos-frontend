export type DummyUser = { email: string; name: string; role: string }

// SAMPLE ONLY: replaced by the response of POST /api/auth/login (userId, username, role, token)
// the role must match a role name on the Roles page
export const DUMMY_USERS: DummyUser[] = [
  { email: 'admin@saccos.com', name: 'Admin User', role: 'Admin' },
  { email: 'loanofficer@saccos.com', name: 'Asha Mrema', role: 'Loan Officer' },
  { email: 'approver@saccos.com', name: 'Credit Committee', role: 'Approver' },
  { email: 'collector@saccos.com', name: 'Rehema Salim', role: 'Collector' },
]

// a misspelling that also works
const ALIASES: Record<string, string> = { 'colletor@saccos.com': 'collector@saccos.com' }

export function findDummyUser(email: string): DummyUser | undefined {
  const typed = email.trim().toLowerCase()
  const key = ALIASES[typed] ?? typed
  return DUMMY_USERS.find((u) => u.email === key)
}