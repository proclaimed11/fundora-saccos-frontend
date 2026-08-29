import { useState } from "react"
import {
  MoreVerticalIcon,
  PencilIcon,
  EyeIcon,
  ArchiveIcon,
  PlusIcon,
  LayersIcon,
  CircleCheckIcon,
  WalletIcon,
  ScaleIcon,
  LandmarkIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ActivityIcon,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import TableFilterBar from "@/custom-components/table-filter-bar"
import TableEmptyState from "@/custom-components/table-empty-state"
import SummaryCards, { type SummaryWidget } from "@/custom-components/summary-cards"

export type AccountType = "Asset" | "Contra Asset" | "Liability" | "Equity" | "Income" | "Expense"
export type AccountStatus = "Active" | "Inactive"

export type ChartOfAccount = {
  id: string
  accountCode: string
  accountName: string
  accountType: AccountType
  startingBalance: string
  currentBalance: string
  status: AccountStatus
}

const accounts: ChartOfAccount[] = [
  { id: "1", accountCode: "1000-00", accountName: "Cash in Hand", accountType: "Asset", startingBalance: "TZS 0", currentBalance: "TZS 1,250,000", status: "Active" },
  { id: "2", accountCode: "1001-00", accountName: "Bank - Main Operational Account", accountType: "Asset", startingBalance: "TZS 5,000,000", currentBalance: "TZS 12,480,000", status: "Active" },
  { id: "3", accountCode: "1002-00", accountName: "Bank - Savings Account", accountType: "Asset", startingBalance: "TZS 2,000,000", currentBalance: "TZS 3,150,000", status: "Active" },
  { id: "4", accountCode: "1100-00", accountName: "Loans Receivable - Current", accountType: "Asset", startingBalance: "TZS 0", currentBalance: "TZS 18,600,000", status: "Active" },
  { id: "5", accountCode: "1101-00", accountName: "Loans Receivable - Overdue", accountType: "Asset", startingBalance: "TZS 0", currentBalance: "TZS 2,300,000", status: "Active" },
  { id: "6", accountCode: "1102-00", accountName: "Allowance for Loan Losses", accountType: "Contra Asset", startingBalance: "TZS 0", currentBalance: "TZS (450,000)", status: "Active" },
  { id: "7", accountCode: "2000-00", accountName: "Accounts Payable", accountType: "Liability", startingBalance: "TZS 0", currentBalance: "TZS 620,000", status: "Active" },
  { id: "8", accountCode: "2100-00", accountName: "Accrued Expenses", accountType: "Liability", startingBalance: "TZS 0", currentBalance: "TZS 310,000", status: "Active" },
  { id: "9", accountCode: "3000-00", accountName: "Member Savings", accountType: "Liability", startingBalance: "TZS 0", currentBalance: "TZS 9,750,000", status: "Active" },
  { id: "10", accountCode: "4000-00", accountName: "Share Capital", accountType: "Equity", startingBalance: "TZS 10,000,000", currentBalance: "TZS 10,000,000", status: "Active" },
  { id: "11", accountCode: "4100-00", accountName: "Retained Earnings", accountType: "Equity", startingBalance: "TZS 0", currentBalance: "TZS 1,875,000", status: "Active" },
  { id: "12", accountCode: "5000-00", accountName: "Interest Income on Loans", accountType: "Income", startingBalance: "TZS 0", currentBalance: "TZS 3,420,000", status: "Active" },
  { id: "13", accountCode: "5000-00", accountName: "Fees and Charges Income", accountType: "Income", startingBalance: "TZS 0", currentBalance: "TZS 540,000", status: "Active" },
  { id: "14", accountCode: "6000-00", accountName: "Interest Expense", accountType: "Expense", startingBalance: "TZS 0", currentBalance: "TZS 210,000", status: "Active" },
  { id: "15", accountCode: "6100-00", accountName: "Operating Expenses", accountType: "Expense", startingBalance: "TZS 0", currentBalance: "TZS 1,120,000", status: "Active" },
]

const accountTypeOptions = [
  { label: "All Types", value: "all" },
  { label: "Asset", value: "Asset" },
  { label: "Contra Asset", value: "Contra Asset" },
  { label: "Liability", value: "Liability" },
  { label: "Equity", value: "Equity" },
  { label: "Income", value: "Income" },
  { label: "Expense", value: "Expense" },
]

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
]

const accountTypeBadgeStyles: Record<AccountType, string> = {
  Asset: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  "Contra Asset": "bg-violet-100 text-violet-700 hover:bg-violet-100",
  Liability: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Equity: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  Income: "bg-teal-100 text-teal-700 hover:bg-teal-100",
  Expense: "bg-red-100 text-red-700 hover:bg-red-100",
}

const statusBadgeStyles: Record<AccountStatus, string> = {
  Active: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Inactive: "bg-slate-100 text-slate-700 hover:bg-slate-100",
}

const tabTypeMap: Record<string, AccountType[]> = {
  all: ["Asset", "Contra Asset", "Liability", "Equity", "Income", "Expense"],
  assets: ["Asset", "Contra Asset"],
  liabilities: ["Liability"],
  equity: ["Equity"],
  income: ["Income"],
  expenses: ["Expense"],
}

const PAGE_SIZE = 15

const ChartOfAccountsPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [accountType, setAccountType] = useState("all")
  const [status, setStatus] = useState("Active")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredAccounts = accounts.filter((account) => {
    const inTab = tabTypeMap[activeTab].includes(account.accountType)

    const query = searchQuery.trim().toLowerCase()
    const matchesSearch =
      query === "" ||
      account.accountCode.toLowerCase().includes(query) ||
      account.accountName.toLowerCase().includes(query)

    const matchesType = accountType === "all" || account.accountType === accountType
    const matchesStatus = status === "all" || account.status === status

    return inTab && matchesSearch && matchesType && matchesStatus
  })

  const totalAccounts = filteredAccounts.length
  const totalPages = Math.max(Math.ceil(totalAccounts / PAGE_SIZE), 1)
  const safePage = Math.min(currentPage, totalPages)
  const rangeStart = totalAccounts === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * PAGE_SIZE, totalAccounts)
  const pageAccounts = filteredAccounts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const goToPage = (page: number) => setCurrentPage(Math.min(Math.max(page, 1), totalPages))

  const visiblePages = Array.from({ length: Math.min(4, totalPages) }, (_, i) => {
    const start = Math.max(1, Math.min(safePage - 1, totalPages - 3))
    return start + i
  })
  const showTrailingEllipsis = totalPages > 4 && visiblePages[visiblePages.length - 1] < totalPages

  const summaryWidgets: SummaryWidget[] = [
    {
      key: "total-accounts",
      label: "Total Accounts",
      value: "15",
      icon: LayersIcon,
      iconClassName: "bg-blue-500"
    },
    {
      key: "active-accounts",
      label: "Active Accounts",
      value: "14",
      icon: CircleCheckIcon,
      iconClassName: "bg-emerald-500",
    },
    {
      key: "total-assets",
      label: "Total Assets",
      value: "TZS 37.3M",
      icon: WalletIcon,
      iconClassName: "bg-indigo-500",
    },
    {
      key: "total-liabilities",
      label: "Total Liabilities",
      value: "TZS 10.7M",
      icon: ScaleIcon,
      iconClassName: "bg-amber-500",
    },
    {
      key: "total-equity",
      label: "Total Equity",
      value: "TZS 11.9M",
      icon: LandmarkIcon,
      iconClassName: "bg-purple-500",
    },
    {
      key: "total-income",
      label: "Total Income",
      value: "TZS 3.96M",
      icon: TrendingUpIcon,
      iconClassName: "bg-teal-500",
    },
    {
      key: "total-expenses",
      label: "Total Expenses",
      value: "TZS 1.33M",
      icon: TrendingDownIcon,
      iconClassName: "bg-red-500",
    },
    {
      key: "net-income",
      label: "Net Income",
      value: "TZS 2.63M",
      icon: ActivityIcon,
      iconClassName: "bg-emerald-600",
      caption: "surplus",
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Chart of Accounts</h1>
          <p className="text-sm text-muted-foreground">View and manage all general ledger accounts in the system.</p>
        </div>
        <Button className="gap-1.5" onClick={() => navigate("/accounts/new-account")}>
          <PlusIcon className="size-4" />
          Add Account
        </Button>
      </div>

      <SummaryCards widgets={summaryWidgets} />

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value ?? "all")
          setCurrentPage(1)
        }}
      >
        <TabsList variant="line" className="h-auto w-fit gap-6 bg-transparent p-0">
          <TabsTrigger
            value="all"
            className="rounded-none border-none px-0 pb-3 text-muted-foreground data-active:bg-transparent data-active:text-primary after:bg-primary"
          >
            All Accounts
          </TabsTrigger>
          <TabsTrigger
            value="assets"
            className="rounded-none border-none px-0 pb-3 text-muted-foreground data-active:bg-transparent data-active:text-primary after:bg-primary"
          >
            Assets
          </TabsTrigger>
          <TabsTrigger
            value="liabilities"
            className="rounded-none border-none px-0 pb-3 text-muted-foreground data-active:bg-transparent data-active:text-primary after:bg-primary"
          >
            Liabilities
          </TabsTrigger>
          <TabsTrigger
            value="equity"
            className="rounded-none border-none px-0 pb-3 text-muted-foreground data-active:bg-transparent data-active:text-primary after:bg-primary"
          >
            Equity
          </TabsTrigger>
          <TabsTrigger
            value="income"
            className="rounded-none border-none px-0 pb-3 text-muted-foreground data-active:bg-transparent data-active:text-primary after:bg-primary"
          >
            Income
          </TabsTrigger>
          <TabsTrigger
            value="expenses"
            className="rounded-none border-none px-0 pb-3 text-muted-foreground data-active:bg-transparent data-active:text-primary after:bg-primary"
          >
            Expenses
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="flex flex-col gap-4">
              <TableFilterBar
                bare
                searchQuery={searchQuery}
                onSearchQueryChange={(value) => {
                  setSearchQuery(value)
                  setCurrentPage(1)
                }}
                searchPlaceholder="Search by account code or name..."
                filters={[
                  {
                    key: "accountType",
                    label: "Account Type",
                    value: accountType,
                    onChange: (value) => {
                      setAccountType(value)
                      setCurrentPage(1)
                    },
                    options: accountTypeOptions,
                    widthClassName: "w-40",
                  },
                  {
                    key: "status",
                    label: "Status",
                    value: status,
                    onChange: (value) => {
                      setStatus(value)
                      setCurrentPage(1)
                    },
                    options: statusOptions,
                    widthClassName: "w-32",
                  },
                ]}
              />

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Code</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>Starting Balance</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageAccounts.length === 0 ? (
                    <TableEmptyState colSpan={9} message="No accounts available" />
                  ) : (
                    pageAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="text-muted-foreground">{account.accountCode}</TableCell>
                        <TableCell className="font-medium">{account.accountName}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn("font-medium", accountTypeBadgeStyles[account.accountType])}
                            variant="secondary"
                          >
                            {account.accountType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{account.startingBalance}</TableCell>
                        <TableCell className="font-medium">{account.currentBalance}</TableCell>
                        <TableCell>
                          <Badge className={statusBadgeStyles[account.status]} variant="secondary">
                            {account.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button variant="ghost" size="icon" className="size-8">
                                  <MoreVerticalIcon className="size-4 text-muted-foreground" />
                                </Button>
                              }
                            />
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/accounts/${account.id}`)}>
                                <EyeIcon className="size-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <PencilIcon className="size-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem variant="destructive">
                                <ArchiveIcon className="size-4" />
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {rangeStart} to {rangeEnd} of {totalAccounts} accounts
                </p>

                <div className="flex items-center gap-1">
                  {visiblePages.map((page) => (
                    <Button
                      key={page}
                      variant={page === safePage ? "default" : "outline"}
                      size="icon"
                      className="size-8"
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </Button>
                  ))}

                  {showTrailingEllipsis && (
                    <>
                      <span className="px-1 text-sm text-muted-foreground">...</span>
                      <Button variant="outline" size="icon" className="size-8" onClick={() => goToPage(totalPages)}>
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ChartOfAccountsPage