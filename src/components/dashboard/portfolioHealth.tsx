import { Progress, Text } from '@mantine/core'
import { ContentCard } from '../contentCard'
import { formatTzs } from '../../utils/format'

type PortfolioHealthProps = {
  nplRatio: number // nplRatioPercent
  parRatio: number // portfolioAtRiskRatioPercent
  efficiency: number // efficiencyPercent
  writtenOff: number // totalWrittenOffAmount
}

// lower is better for NPL and PAR; thresholds are common lending benchmarks, adjust as needed
const riskColor = (v: number) => (v <= 5 ? 'green' : v <= 10 ? 'yellow' : 'red')
// higher is better for collection efficiency
const efficiencyColor = (v: number) => (v >= 90 ? 'green' : v >= 70 ? 'yellow' : 'red')

function Metric({ label, hint, value, color }: { label: string; hint: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <div>
          <Text size="sm" fw={500}>
            {label}
          </Text>
          <Text size="xs" c="dimmed">
            {hint}
          </Text>
        </div>
        <Text size="lg" fw={600}>
          {value.toFixed(1)}%
        </Text>
      </div>
      <Progress value={Math.min(value, 100)} color={color} size="sm" radius="xl" />
    </div>
  )
}

export function PortfolioHealth({ nplRatio, parRatio, efficiency, writtenOff }: PortfolioHealthProps) {
  return (
    <ContentCard
      title="Portfolio Health"
      headerColor="#fcfdfc"
      headerTextColor="#1f2937"
    >
      <div className="space-y-5">
        <Metric label="NPL ratio" hint="Non-performing share of the active book" value={nplRatio} color={riskColor(nplRatio)} />
        <Metric label="Portfolio at risk" hint="Outstanding on overdue loans" value={parRatio} color={riskColor(parRatio)} />
        <Metric label="Collection efficiency" hint="Collected vs expected installments" value={efficiency} color={efficiencyColor(efficiency)} />

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <Text size="sm" c="dimmed">
            Total written off
          </Text>
          <Text size="sm" fw={600}>
            {formatTzs(writtenOff)}
          </Text>
        </div>
      </div>
    </ContentCard>
  )
}