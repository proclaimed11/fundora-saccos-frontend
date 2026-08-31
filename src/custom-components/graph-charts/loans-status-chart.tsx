import { useEffect, useState } from "react"
import { Cell, Pie, PieChart } from "recharts"
import { PieChartIcon } from "lucide-react"
import SectionCard from "../section-card"
import { Skeleton } from "../../../src/components/ui/skeleton"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../../../src/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../src/components/ui/select"
import SectionCardSkeleton from "../skeleton-loaders/skeleton-summary-loader"

type LoanStatusItem = {
  status: string
  label: string
  value: number
  percent: string
  color: string
}

const chartConfig = {
  current: { label: "Current", color: "var(--color-emerald-500)" },
  grace: { label: "Grace Period", color: "var(--color-blue-500)" },
  overdue30: { label: "Overdue (1-30 days)", color: "var(--color-amber-500)" },
  overdue30plus: { label: "Overdue (30+ days)", color: "var(--color-red-500)" },
} satisfies ChartConfig

const LoanStatusChart = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [loanStatusData, setLoanStatusData] = useState<LoanStatusItem[] | null>(null)

  useEffect(() => {
    setIsLoading(true)
    // Replace with your real fetch, e.g. fetch(`/api/reports/npl`) or a dedicated loan-status endpoint
    const timer = setTimeout(() => {
      setLoanStatusData([
        { status: "current", label: "Current", value: 784, percent: "62.8%", color: "var(--color-emerald-500)" },
        { status: "grace", label: "Grace Period", value: 192, percent: "15.4%", color: "var(--color-blue-500)" },
        { status: "overdue30", label: "Overdue (1-30 days)", value: 146, percent: "11.7%", color: "var(--color-amber-500)" },
        { status: "overdue30plus", label: "Overdue (30+ days)", value: 126, percent: "10.1%", color: "var(--color-red-500)" },
      ])
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading || !loanStatusData) {
    return (
      <SectionCardSkeleton variant="custom" titleWidth="w-28" showHeaderAction>
        <div className="flex flex-row items-center gap-6">
          <div className="relative h-[160px] w-[160px] shrink-0">
            <Skeleton className="h-full w-full rounded-full" />
          </div>

          <div className="flex flex-1 flex-col gap-3 min-w-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Skeleton className="size-2.5 shrink-0 rounded-full" />
                  <Skeleton className="h-3.5 flex-1" />
                </div>
                <Skeleton className="h-3.5 w-16 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </SectionCardSkeleton>
    )
  }

  const totalLoans = loanStatusData.reduce((sum, item) => sum + item.value, 0)

  return (
    <SectionCard
      icon={PieChartIcon}
      title="Loan Status"
      headerAction={
        <Select defaultValue="all-loans">
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-loans">All Loans</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <div className="flex flex-row items-center gap-6">
        {/* Chart pinned to the start instead of centered */}
        <div className="relative h-[160px] w-[160px] shrink-0">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={loanStatusData}
                dataKey="value"
                nameKey="label"
                innerRadius={55}
                outerRadius={80}
                strokeWidth={2}
              >
                {loanStatusData.map((entry) => (
                  <Cell key={entry.status} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xl font-semibold">{totalLoans.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Loans</p>
          </div>
        </div>

        {/* flex-1 restored so the legend fills remaining space and values push to the right */}
        <div className="flex flex-1 flex-col gap-3 min-w-0">
          {loanStatusData.map((item) => (
            <div key={item.status} className="flex items-center justify-between gap-2 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate text-muted-foreground">{item.label}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2 font-medium">
                <span>{item.value}</span>
                <span className="text-muted-foreground">({item.percent})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  )
}

export default LoanStatusChart