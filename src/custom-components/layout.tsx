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
    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" aria-label="Toggle Sidebar" onClick={toggleSidebar}>
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
        <div className="relative z-0 flex w-full shrink-0 flex-row items-start justify-between gap-2 bg-gradient-to-br from-blue-900 to-blue-700 px-6 pt-5 pb-16 text-white shadow-sm">
          <div className="flex items-center gap-2">
            <MenuTrigger />
            <PageBreadcrumb className="[&_a]:text-white/70 [&_a:hover]:text-white [&_svg]:text-white/50 [&_span]:text-white" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <SunIcon className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <MoonIcon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </Button>
            <NavUser />
          </div>
        </div>
        <div className="relative z-10 flex-1 px-6 pb-6 -mt-15">
          <Card
            key={location.pathname}
            className="min-h-full w-full rounded-xl border-0! p-6 shadow-lg! animate-page-in"
          >
            <Outlet />
          </Card>
        </div>
      </main>
    </SidebarProvider>
  )
}

export default Layout