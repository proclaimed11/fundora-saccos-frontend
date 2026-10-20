export type NavItem = { key: string; label: string; icon: string; path: string }
export type NavSection = { label: string; items: NavItem[] }

export const navSections: NavSection[] = [
  {
    label: 'Main',
    items: [{ key: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer', path: '/' }],
  },
  {
    label: 'Applicants',
    items: [
      { key: 'applicants', label: 'Applicants', icon: 'fa-users', path: '/applicants' },
      { key: 'kyc-review', label: 'KYC Review', icon: 'fa-id-card-o', path: '/kyc-review' },
    ],
  },
  {
    label: 'Loans',
    items: [
      { key: 'applications', label: 'Applications', icon: 'fa-file-text-o', path: '/loan-applications' },
      { key: 'approvals', label: 'Approvals', icon: 'fa-check-square-o', path: '/loan-approvals' },
      { key: 'contracts', label: 'Contracts', icon: 'fa-pencil-square-o', path: '/loan-contracts' },
      { key: 'disbursements', label: 'Disbursements', icon: 'fa-money', path: '/loan-disbursements' },
      { key: 'loans', label: 'Loans', icon: 'fa-briefcase', path: '/loans' },
    ],
  },
  {
    label: 'Repayments',
    items: [
      { key: 'payments', label: 'Payments', icon: 'fa-credit-card', path: '/payments' },
      { key: 'penalties', label: 'Penalties & Grace', icon: 'fa-clock-o', path: '/penalties' },
    ],
  },
  {
    label: 'Collections',
    items: [
      { key: 'collection-cases', label: 'Collection Cases', icon: 'fa-phone', path: '/collection-cases' },
      { key: 'recovery-cases', label: 'Recovery Cases', icon: 'fa-undo', path: '/recovery-cases' },
      { key: 'npl', label: 'NPL & Write-offs', icon: 'fa-exclamation-triangle', path: '/npl' },
    ],
  },
  {
    label: 'Accounting',
    items: [
      { key: 'chart-of-accounts', label: 'Chart of Accounts', icon: 'fa-list-ol', path: '/chart-of-accounts' },
      { key: 'gl-transactions', label: 'GL Transactions', icon: 'fa-book', path: '/gl-transactions' },
    ],
  },
  {
    label: 'Reports',
    items: [{ key: 'reports', label: 'Reports', icon: 'fa-bar-chart', path: '/reports' }],
  },
  {
    label: 'Administration',
    items: [
      { key: 'users', label: 'Users', icon: 'fa-user-circle-o', path: '/users' },
      { key: 'roles', label: 'Roles', icon: 'fa-key', path: '/roles' },
      { key: 'approval-hierarchy', label: 'Approval Hierarchy', icon: 'fa-sitemap', path: '/approval-hierarchy' },
      { key: 'company-profile', label: 'Company Profile', icon: 'fa-building-o', path: '/company-profile' },
      { key: 'security', label: 'Security Settings', icon: 'fa-lock', path: '/security' },
      { key: 'notifications', label: 'Notifications', icon: 'fa-bell-o', path: '/notifications' },
      { key: 'audit', label: 'Audit Log', icon: 'fa-history', path: '/audit' },
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