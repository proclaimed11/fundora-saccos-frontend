import { useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getActiveKey, navItems } from './navItems'
import { useAuth } from '../../auth/authContext'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { PageHeader, type PageHeaderProps } from './pageHeader'

type DashboardLayoutProps = PageHeaderProps & {
  /** pull the page content up over the header, default true */
  overlap?: boolean
  onSettings?: () => void
  onLogout?: () => void
  children: ReactNode
}

// SAMPLE ONLY: comes from the logged-in user once real login is connected
const USER = { name: 'John Doe', role: 'Loan Officer' }

export function DashboardLayout({
  title,
  breadcrumbs,
  subtitle,
  actions,
  overlap = true,
  onSettings,
  onLogout,
  children,
}: DashboardLayoutProps) {
  const { logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false) // mobile drawer
  const [collapsed, setCollapsed] = useState(false) // desktop icon rail

  // the highlighted item comes from the URL, so refresh and back/forward stay correct
  const active = getActiveKey(pathname)

  const handleNavigate = (key: string) => {
    const item = navItems.find((i) => i.key === key)
    if (item) navigate(item.path)
    setMenuOpen(false)
  }

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <Header
        collapsed={collapsed}
        breadcrumbs={breadcrumbs}
        onMenuClick={() => {
          setMenuOpen((o) => !o)
          setCollapsed((c) => !c)
        }}
        onNavigate={handleNavigate}
      />
      <div className="flex min-h-0 flex-1">
        <Sidebar
          active={active}
          onChange={handleNavigate}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          collapsed={collapsed}
          user={USER}
          onSettings={onSettings}
          onLogout={onLogout ?? logout}
        />
        <div className="min-w-0 flex-1 overflow-auto">
          <PageHeader title={title} subtitle={subtitle} actions={actions} />
          <main className={`relative z-10 px-4 pb-4 ${overlap ? '-mt-5' : 'mt-4'}`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}