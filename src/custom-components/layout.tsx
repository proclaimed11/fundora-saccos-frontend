import { Outlet } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "@/lib/theme-provider"
import AppSidebar from "./app-sidebar"
import NavUser from "./nav-user"
import PageBreadcrumb from "./page-breadcrumb"

const Layout = () => {
  const { theme, setTheme } = useTheme()

  return (
    <SidebarProvider style={{ "--sidebar-width": "12rem" } as React.CSSProperties}>
      <AppSidebar />
      <main className="flex w-full flex-col bg-background">
        <div className="flex items-center justify-between gap-2 px-6 py-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <PageBreadcrumb />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <SunIcon className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <MoonIcon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </Button>
            <NavUser />
          </div>
        </div>
        <div className="flex-1 px-6 pb-6">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}

export default Layout