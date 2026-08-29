import {
  WalletIcon,
  BanknoteIcon,
  LandmarkIcon,
  PercentIcon,
  TrendingUpIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import SectionCard from "../section-card"
import { cn } from "../../lib/utils"

type SummaryRow = {
  label: string
  value: string
  icon: LucideIcon
  iconClassName: string
}

const summaryRows: SummaryRow[] = [
  {
    label: "Total Disbursed",
    value: "TZS 2,450,000,000",
    icon: WalletIcon,
    iconClassName: "bg-emerald-500 text-white",
  },
  {
    label: "Total Repaid",
    value: "TZS 770,000,000",
    icon: BanknoteIcon,
    iconClassName: "bg-blue-500 text-white",
  },
  {
    label: "Outstanding Principal",
    value: "TZS 1,580,000,000",
    icon: LandmarkIcon,
    iconClassName: "bg-amber-500 text-white",
  },
  {
    label: "Interest Outstanding",
    value: "TZS 100,000,000",
    icon: PercentIcon,
    iconClassName: "bg-violet-500 text-white",
  },
]

const PortfolioSummaryCard = () => {
  return (
    <SectionCard icon={WalletIcon} title="Portfolio Summary">
      <div className="flex flex-col gap-4">
        {summaryRows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", row.iconClassName)}>
              <row.icon className="size-4" />
            </div>
            <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{row.label}</p>
            <p className="text-sm font-semibold">{row.value}</p>
          </div>
        ))}

        {/* Collection Efficiency row — has a trend value + sparkline instead of a plain figure */}
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
            <TrendingUpIcon className="size-4" />
          </div>
          <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">Collection Efficiency</p>
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-emerald-600">92.6%</span>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

export default PortfolioSummaryCard