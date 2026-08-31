import { useEffect, useMemo, useState, type ComponentProps } from "react"
import { useLocation, Link } from "react-router-dom"
import {
  UsersIcon,
  FileTextIcon,
  HandCoins,
  BanknoteIcon,
  BellIcon,
  SettingsIcon,
  ChevronRightIcon,
  Building2Icon,
  HomeIcon,
  SearchIcon,
  BookTextIcon,
  Wallet2Icon
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
  useSidebar,
} from "../../src/components/ui/sidebar"

const ICON_STROKE_WIDTH = 1.5

const singleItems = [
  { title: "Dashboard", url: "/dashboard", icon: HomeIcon },
]

const applicantsItem = { title: "Applicants", url: "/applicants", icon: UsersIcon }

const bottomSingleItems = [
  { title: "Reports", url: "/reports", icon: FileTextIcon },
  { title: "Notifications", url: "/notifications", icon: BellIcon },
]

const sections = [
  {
    title: "Loans",
    icon: Wallet2Icon,
    items: [
      { title: "Applications", url: "/loans" },
      { title: "Approve Loans", url: "/loans/approvals" },
    ],
  },
  {
    title: "Accounting",
    icon: BookTextIcon,
    items: [
      { title: "Chart of Accounts", url: "/accounts" },
      { title: "General Ledger", url: "/accounting/gl-posting" }
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

// Every collapsible group (the four operational sections + Settings) lives in
// one accordion — this is the flat list used to resolve "which one contains
// the active route" so only that one is ever open at a time.
const allCollapsibleGroups = [...sections, settingsSection]

const activeMenuButtonClass =
  "text-[13.5px]! data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground data-active:font-medium data-active:hover:bg-sidebar-primary data-active:hover:text-sidebar-primary-foreground [&>svg]:data-active:opacity-100"

const subButtonClass =
  "text-[13.5px]! text-muted-foreground hover:bg-transparent hover:text-muted-foreground data-active:bg-transparent data-active:font-medium data-active:text-primary data-active:hover:bg-transparent data-active:hover:text-primary"

const matches = (title: string, query: string) => title.toLowerCase().includes(query.toLowerCase())

const AppSidebar = ({ className, ...props }: ComponentProps<typeof Sidebar>) => {
  const location = useLocation()
  const [query, setQuery] = useState("")

  const { setOpen, isMobile, setOpenMobile } = useSidebar()

  const isActive = (url: string) => location.pathname === url

  // Accordion state: at most ONE collapsible group is open at a time,
  // identified by its title ("Loans", "Settings", etc.), or null if none.
  const [openGroupTitle, setOpenGroupTitle] = useState<string | null>(() => {
    const match = allCollapsibleGroups.find((group) =>
      group.items.some((item) => isActive(item.url))
    )
    return match ? match.title : null
  })

  // Keep the accordion in sync if the route changes by some means other than
  // clicking a sidebar link (browser back/forward, a direct link elsewhere).
  useEffect(() => {
    const match = allCollapsibleGroups.find((group) =>
      group.items.some((item) => isActive(item.url))
    )
    if (match) setOpenGroupTitle(match.title)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  const expandSidebar = () => {
    setOpen(true)
    if (isMobile) setOpenMobile(true)
  }

  // Called whenever a sub-nav item is clicked: makes its group the only open
  // one (accordion behavior) and expands the overall sidebar if collapsed.
  const handleSubNavClick = (groupTitle: string) => {
    setOpenGroupTitle(groupTitle)
    expandSidebar()
  }

  // Called for top-level links that aren't inside a collapsible group
  // (Dashboard, Applicants, Reports, Notifications) — these don't belong to
  // an accordion group, so we just make sure the sidebar itself is expanded.
  const handleTopLevelNavClick = () => {
    setOpenGroupTitle(null)
    expandSidebar()
  }

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
     <Sidebar className={className} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2Icon className="size-4" strokeWidth={ICON_STROKE_WIDTH} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">FUNDORA</span>
                <span className="truncate text-xs text-muted-foreground">Loans management system</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="relative px-2 pt-1">
          <SearchIcon
            className="pointer-events-none absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            strokeWidth={ICON_STROKE_WIDTH}
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Go to"
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
                          onClick={handleTopLevelNavClick}
                          render={<Link to={item.url} />}
                        >
                          <item.icon className="opacity-70" strokeWidth={ICON_STROKE_WIDTH} />
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
                <SidebarGroupLabel className="opacity-60">OPERATIONS</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredApplicantsItem && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={isActive(filteredApplicantsItem.url)}
                          className={activeMenuButtonClass}
                          onClick={handleTopLevelNavClick}
                          render={<Link to={filteredApplicantsItem.url} />}
                        >
                          <filteredApplicantsItem.icon className="opacity-60" strokeWidth={ICON_STROKE_WIDTH} />
                          <span>{filteredApplicantsItem.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}

                    {filteredSections.map((section) => {
                      const sectionActive = section.items.some((item) => isActive(item.url))
                      const isOpen = isSearching || openGroupTitle === section.title
                      return (
                        <Collapsible
                          key={section.title}
                          open={isOpen}
                          onOpenChange={(open) =>
                            setOpenGroupTitle(open ? section.title : null)
                          }
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
                              <section.icon className="opacity-60" strokeWidth={ICON_STROKE_WIDTH} />
                              <span>{section.title}</span>
                              <ChevronRightIcon
                                className="ml-auto opacity-60 transition-transform group-data-open/collapsible:rotate-90"
                                strokeWidth={ICON_STROKE_WIDTH}
                              />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {section.items.map((item) => (
                                  <SidebarMenuSubItem key={item.title}>
                                    <SidebarMenuSubButton
                                      isActive={isActive(item.url)}
                                      className={subButtonClass}
                                      onClick={() => handleSubNavClick(section.title)}
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
                <SidebarGroupLabel className="opacity-60">INSIGHTS & MONITORNG</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredBottomSingleItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          isActive={isActive(item.url)}
                          className={activeMenuButtonClass}
                          onClick={handleTopLevelNavClick}
                          render={<Link to={item.url} />}
                        >
                          <item.icon className="opacity-60" strokeWidth={ICON_STROKE_WIDTH} />
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
                      const isOpen = isSearching || openGroupTitle === settingsSection.title
                      return (
                        <Collapsible
                          open={isOpen}
                          onOpenChange={(open) =>
                            setOpenGroupTitle(open ? settingsSection.title : null)
                          }
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
                              <settingsSection.icon className="opacity-60" strokeWidth={ICON_STROKE_WIDTH} />
                              <span>{settingsSection.title}</span>
                              <ChevronRightIcon
                                className="ml-auto opacity-60 transition-transform group-data-open/collapsible:rotate-90"
                                strokeWidth={ICON_STROKE_WIDTH}
                              />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {filteredSettingsItems.map((item) => (
                                  <SidebarMenuSubItem key={item.title}>
                                    <SidebarMenuSubButton
                                      isActive={isActive(item.url)}
                                      className={subButtonClass}
                                      onClick={() => handleSubNavClick(settingsSection.title)}
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