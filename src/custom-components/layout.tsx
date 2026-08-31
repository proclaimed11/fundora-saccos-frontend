import { Outlet, useLocation } from "react-router-dom"
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MenuIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "@/lib/theme-provider"
import AppSidebar from "./app-sidebar"
import NavUser from "./nav-user"
import PageBreadcrumb from "./page-breadcrumb"

const MenuTrigger = () => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button variant="ghost" size="icon" aria-label="Toggle Sidebar" onClick={toggleSidebar}>
      <MenuIcon />
    </Button>
  )
}

const Layout = () => {
  const { theme, setTheme } = useTheme()
  const location = useLocation()

  return (
    <SidebarProvider style={{ "--sidebar-width": "11.5rem" } as React.CSSProperties}>
      <AppSidebar className="border-none shadow-none" />
      <main className="flex h-svh w-full flex-col overflow-y-auto bg-background">
        <div className="flex shrink-0 items-center justify-between gap-2 px-6 py-2">
          <div className="flex items-center gap-2">
            <MenuTrigger />
            <PageBreadcrumb />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="bg-white"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <SunIcon className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <MoonIcon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </Button>
            <Card className="p-0">
              <NavUser />
            </Card>
          </div>
        </div>
        <div className="flex-1 px-6 pt-4 pb-6">
          <Card
            key={location.pathname}
            className="min-h-full rounded-xl border-0! p-6 shadow-lg! animate-page-in"
          >
            <Outlet />
          </Card>
        </div>
      </main>
    </SidebarProvider>
  )
}

export default Layout