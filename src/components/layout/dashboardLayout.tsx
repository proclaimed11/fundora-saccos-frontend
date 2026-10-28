import { useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getActiveKey, navItems } from './navItems'
import { useAuth } from '../../auth/authContext'
import { Sidebar } from './sidebar'
import { DashboardHeader, type DashboardHeaderProps } from './dashboardHeader'

type DashboardLayoutProps = Omit<DashboardHeaderProps, 'collapsed' | 'onMenuClick' | 'onNavigate' | 'sidebar'> & {
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

  const handleMenuClick = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      setCollapsed((current) => !current)
      return
    }
    setMenuOpen((current) => !current)
  }

  const handleNavigate = (key: string) => {
    const item = navItems.find((i) => i.key === key)
    if (item) navigate(item.path)
    setMenuOpen(false)
  }

  return (
    <DashboardHeader
      title={title}
      breadcrumbs={breadcrumbs}
      subtitle={subtitle}
      actions={actions}
      collapsed={collapsed}
      onMenuClick={handleMenuClick}
      onNavigate={handleNavigate}
      overlap={overlap}
      sidebar={
        <Sidebar
          active={active}
          onChange={handleNavigate}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          collapsed={collapsed}
          user={USER}
          onSettings={onSettings ?? (() => navigate('/account'))}
          onLogout={onLogout ?? logout}
        />
      }
    >
      {children}
    </DashboardHeader>
  )
}