export type NavItem = { key: string; label: string; icon: string; path: string }
export type NavSection = { label: string; items: NavItem[] }

export const navSections: NavSection[] = [
  {
    label: 'Main',
    items: [{ key: 'dashboard', label: 'Dashboard', icon: 'gauge', path: '/' }],
  },
  {
    label: 'Applicants',
    items: [
      { key: 'applicants', label: 'Applicants', icon: 'users', path: '/applicants' },
      { key: 'kyc-review', label: 'KYC Review', icon: 'contact-round', path: '/kyc-review' },
    ],
  },
  {
    label: 'Loans',
    items: [
      { key: 'applications', label: 'Applications', icon: 'file-text', path: '/loan-applications' },
      { key: 'approvals', label: 'Approvals', icon: 'square-check', path: '/loan-approvals' },
      { key: 'contracts', label: 'Contracts', icon: 'pen-line', path: '/loan-contracts' },
      { key: 'disbursements', label: 'Disbursements', icon: 'banknote', path: '/loan-disbursements' },
      { key: 'loans', label: 'Loans', icon: 'hand-coins', path: '/loans' },
    ],
  },
  {
    label: 'Repayments',
    items: [
      { key: 'payments', label: 'Payments', icon: 'credit-card', path: '/payments' },
      { key: 'penalties', label: 'Penalties & Grace', icon: 'clock', path: '/penalties' },
    ],
  },
  {
    label: 'Collections',
    items: [
      { key: 'collection-cases', label: 'Collection Cases', icon: 'phone', path: '/collection-cases' },
      { key: 'recovery-cases', label: 'Recovery Cases', icon: 'undo-2', path: '/recovery-cases' },
      { key: 'npl', label: 'NPL & Write-offs', icon: 'triangle-alert', path: '/npl' },
    ],
  },
  {
    label: 'Accounting',
    items: [
      { key: 'chart-of-accounts', label: 'Chart of Accounts', icon: 'list-ordered', path: '/chart-of-accounts' },
      { key: 'gl-transactions', label: 'GL Transactions', icon: 'book', path: '/gl-transactions' },
    ],
  },
  {
    label: 'Reports',
    items: [{ key: 'reports', label: 'Reports', icon: 'chart-column-increasing', path: '/reports' }],
  },
  {
    label: 'Administration',
    items: [
      { key: 'users', label: 'Users', icon: 'circle-user-round', path: '/users' },
      { key: 'roles', label: 'Roles', icon: 'key-round', path: '/roles' },
      { key: 'approval-hierarchy', label: 'Approval Hierarchy', icon: 'network', path: '/approval-hierarchy' },
      { key: 'company-profile', label: 'Company Profile', icon: 'building-2', path: '/company-profile' },
      { key: 'security', label: 'Security Settings', icon: 'lock-keyhole', path: '/security' },
      { key: 'notifications', label: 'Notifications', icon: 'bell', path: '/notifications' },
      { key: 'audit', label: 'Audit Log', icon: 'history', path: '/audit' },
    ],
  },
]

// finds the nav item whose path matches, including sub-routes like /applicants/new
export function getActiveKey(pathname: string): string {
  const match = navItems
    .filter((i) => (i.path === '/' ? pathname === '/' : pathname === i.path || pathname.startsWith(`${i.path}/`)))
    .sort((a, b) => b.path.length - a.path.length)[0]
  return match?.key ?? ''
}

// flat list, handy for looking up an item by key or path
export const navItems: NavItem[] = navSections.flatMap((s) => s.items)