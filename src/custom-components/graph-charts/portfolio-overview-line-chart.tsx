import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { TrendingUpIcon } from "lucide-react"
import SectionCard from "../section-card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../src/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../src/components/ui/select"

const portfolioData = [
  { date: "May 1", disbursed: 40000000, repaid: 20000000 },
  { date: "May 5", disbursed: 95000000, repaid: 55000000 },
  { date: "May 9", disbursed: 130000000, repaid: 90000000 },
  { date: "May 13", disbursed: 175000000, repaid: 120000000 },
  { date: "May 17", disbursed: 220000000, repaid: 150000000 },
  { date: "May 21", disbursed: 260000000, repaid: 190000000 },
  { date: "May 25", disbursed: 340000000, repaid: 230000000 },
  { date: "May 31", disbursed: 400000000, repaid: 270000000 },
]

const chartConfig = {
  disbursed: {
    label: "Disbursed Amount",
    color: "var(--color-emerald-500)",
  },
  repaid: {
    label: "Repaid Amount",
    color: "var(--color-blue-500)",
  },
} satisfies ChartConfig

const PortfolioOverviewChart = () => {
  return (
    <SectionCard
      icon={TrendingUpIcon}
      title="Portfolio Overview"
      className="lg:col-span-2"
      headerAction={
        <Select defaultValue="this-month">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="this-year">This Year</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <ChartContainer config={chartConfig} className="h-[260px] w-full">
        <LineChart data={portfolioData} margin={{ left: 12, right: 12 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line dataKey="disbursed" type="monotone" stroke="var(--color-disbursed)" strokeWidth={2} dot={{ r: 3 }} />
          <Line dataKey="repaid" type="monotone" stroke="var(--color-repaid)" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ChartContainer>
    </SectionCard>
  )
}

export default PortfolioOverviewChart