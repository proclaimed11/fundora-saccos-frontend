import { useMemo, useState } from "react"
import { useLocation, Link } from "react-router-dom"
import {
  UsersIcon,
  FileTextIcon,
  HandCoins,
  BanknoteIcon,
  BarChartIcon,
  BellIcon,
  SettingsIcon,
  ChevronRightIcon,
  Building2Icon,
  HomeIcon,
  SearchIcon,
  BookTextIcon,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../src/components/ui/collapsible"
import { Input } from "../../src/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../../src/components/ui/sidebar"

const singleItems = [
  { title: "Dashboard", url: "/dashboard", icon: HomeIcon },
]

const applicantsItem = { title: "Applicants", url: "/applicants", icon: UsersIcon }

const bottomSingleItems = [
  { title: "Reports", url: "/reports", icon: BarChartIcon },
  { title: "Notifications", url: "/notifications", icon: BellIcon },
]

const sections = [
  {
    title: "Loans",
    icon: FileTextIcon,
    items: [
      { title: "Loan Applications", url: "/loans" },
      { title: "Approve Loans", url: "/loans/approvals" },
    ],
  },
  {
    title: "Accounting",
    icon: BookTextIcon,
    items: [
      { title: "Chart of Accounts", url: "/accounts" },
      { title: "GL Posting", url: "/accounting/gl-posting" }
    ],
  },
  {
    title: "Repayments",
    icon: BanknoteIcon,
    items: [
      { title: "Repayment Processing", url: "/repayments/processing" },
      { title: "Collateral Release", url: "/repayments/collateral-release" },
    ],
  },
  {
    title: "Collections",
    icon: HandCoins,
    items: [
      { title: "Collections Workflow", url: "/collections/workflow" },
      { title: "NPL Management", url: "/collections/npl" },
    ],
  },
]

const settingsSection = {
  title: "Settings",
  icon: SettingsIcon,
  items: [
    { title: "General", url: "/settings/general" },
    { title: "Default Approval Hierarchy", url: "/settings/approval-hierarchy" },
    { title: "Company Profile", url: "/settings/company-profile" },
    { title: "User Role Management", url: "/settings/user-roles" },
    { title: "Security", url: "/settings/security" },
  ],
}

const activeMenuButtonClass =
  "data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground data-active:font-medium data-active:hover:bg-sidebar-primary data-active:hover:text-sidebar-primary-foreground [&>svg]:data-active:opacity-100"

const subButtonClass =
  "hover:bg-transparent data-active:bg-transparent data-active:font-medium data-active:text-primary data-active:hover:bg-transparent data-active:hover:text-primary"

const matches = (title: string, query: string) => title.toLowerCase().includes(query.toLowerCase())

const AppSidebar = () => {
  const location = useLocation()
  const [query, setQuery] = useState("")

  const isActive = (url: string) => location.pathname === url

  // Controlled open-state for each collapsible section, keyed by title.
  // Initialized once from whichever section contains the current route.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    sections.forEach((section) => {
      initial[section.title] = section.items.some((item) => isActive(item.url))
    })
    return initial
  })

  const [settingsOpen, setSettingsOpen] = useState(() =>
    settingsSection.items.some((item) => isActive(item.url))
  )

  const toggleSection = (title: string, open: boolean) => {
    setOpenSections((prev) => ({ ...prev, [title]: open }))
  }

  // Filtered views — when query is empty, everything passes through unchanged.
  const filteredSingleItems = useMemo(
    () => singleItems.filter((item) => matches(item.title, query)),
    [query]
  )

  const filteredApplicantsItem = useMemo(
  () => (matches(applicantsItem.title, query) ? applicantsItem : null),
  [query]
)

  const filteredBottomSingleItems = useMemo(
    () => bottomSingleItems.filter((item) => matches(item.title, query)),
    [query]
  )

  const filteredSections = useMemo(() => {
    if (!query) return sections
    return sections
      .map((section) => {
        const sectionTitleMatches = matches(section.title, query)
        const matchingItems = sectionTitleMatches
          ? section.items
          : section.items.filter((item) => matches(item.title, query))
        return { ...section, items: matchingItems }
      })
      .filter((section) => section.items.length > 0)
  }, [query])

  const filteredSettingsItems = useMemo(() => {
    if (!query) return settingsSection.items
    if (matches(settingsSection.title, query)) return settingsSection.items
    return settingsSection.items.filter((item) => matches(item.title, query))
  }, [query])

  const isSearching = query.length > 0
  const hasNoResults =
    isSearching &&
    filteredSingleItems.length === 0 &&
    filteredApplicantsItem === null &&
    filteredSections.length === 0 &&
    filteredBottomSingleItems.length === 0 &&
    filteredSettingsItems.length === 0

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2Icon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">FUNDORA</span>
                <span className="truncate text-xs text-muted-foreground">Loans management system</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Search input — filters nav items across all groups as you type */}
        <div className="relative px-2 pt-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search navigation..."
            className="h-8 pl-7 text-sm"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {hasNoResults ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">No matching pages</p>
        ) : (
          <>
            {filteredSingleItems.length > 0 && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredSingleItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          isActive={isActive(item.url)}
                          className={activeMenuButtonClass}
                          render={<Link to={item.url} />}
                        >
                          <item.icon className="opacity-60" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
            {(filteredApplicantsItem || filteredSections.length > 0) && (
              <SidebarGroup>
                <SidebarGroupLabel>OPERATIONS</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredApplicantsItem && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={isActive(filteredApplicantsItem.url)}
                          className={activeMenuButtonClass}
                          render={<Link to={filteredApplicantsItem.url} />}
                        >
                          <filteredApplicantsItem.icon className="opacity-60" />
                          <span>{filteredApplicantsItem.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}

                    {filteredSections.map((section) => {
                      const sectionActive = section.items.some((item) => isActive(item.url))
                      const isOpen = isSearching || (openSections[section.title] ?? sectionActive)
                      return (
                        <Collapsible
                          key={section.title}
                          open={isOpen}
                          onOpenChange={(open) => toggleSection(section.title, open)}
                          className="group/collapsible"
                        >
                          <SidebarMenuItem>
                            <CollapsibleTrigger
                              render={
                                <SidebarMenuButton
                                  isActive={sectionActive}
                                  className={activeMenuButtonClass}
                                />
                              }
                            >
                              <section.icon className="opacity-60" />
                              <span>{section.title}</span>
                              <ChevronRightIcon className="ml-auto opacity-60 transition-transform group-data-open/collapsible:rotate-90" />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {section.items.map((item) => (
                                  <SidebarMenuSubItem key={item.title}>
                                    <SidebarMenuSubButton
                                      isActive={isActive(item.url)}
                                      className={subButtonClass}
                                      render={<Link to={item.url} />}
                                    >
                                      <span>{item.title}</span>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </Collapsible>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {filteredBottomSingleItems.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>INSIGHTS & MONITORNG</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredBottomSingleItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          isActive={isActive(item.url)}
                          className={activeMenuButtonClass}
                          render={<Link to={item.url} />}
                        >
                          <item.icon className="opacity-60" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {filteredSettingsItems.length > 0 && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {(() => {
                      const settingsActive = settingsSection.items.some((item) => isActive(item.url))
                      const isOpen = isSearching || settingsOpen
                      return (
                        <Collapsible
                          open={isOpen}
                          onOpenChange={setSettingsOpen}
                          className="group/collapsible"
                        >
                          <SidebarMenuItem>
                            <CollapsibleTrigger
                              render={
                                <SidebarMenuButton
                                  isActive={settingsActive}
                                  className={activeMenuButtonClass}
                                />
                              }
                            >
                              <settingsSection.icon className="opacity-60" />
                              <span>{settingsSection.title}</span>
                              <ChevronRightIcon className="ml-auto opacity-60 transition-transform group-data-open/collapsible:rotate-90" />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {filteredSettingsItems.map((item) => (
                                  <SidebarMenuSubItem key={item.title}>
                                    <SidebarMenuSubButton
                                      isActive={isActive(item.url)}
                                      className={subButtonClass}
                                      render={<Link to={item.url} />}
                                    >
                                      <span>{item.title}</span>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </Collapsible>
                      )
                    })()}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar