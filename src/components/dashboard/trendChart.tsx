import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard } from '../chartCard';
import { formatTzs } from '../../utils/format'

export type TrendPoint = { month: string; disbursed: number; collected: number }

// 1500000 -> "1.5M"
const compact = (n: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

type TrendChartProps = {
  data: TrendPoint[]
  headerColor?: string
}

export function TrendChart({ data, headerColor = '#f7faf8' }: TrendChartProps) {
  return (
    <ChartCard
      title="Disbursed vs Collected"
      headerColor={headerColor}
      className="lg:col-span-2"
      cardHeight={256}
    >
      {(height) => (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillDisbursed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#45bdfc" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#45bdfc" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#39d128" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#39d128" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#868e96' }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={compact}
                tick={{ fontSize: 11, fill: '#868e96' }}
              />
              <Tooltip formatter={(v) => formatTzs(Number(v))} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="disbursed"
                name="Disbursed"
                stroke="#45bdfc"
                strokeWidth={2}
                fill="url(#fillDisbursed)"
              />
              <Area
                type="monotone"
                dataKey="collected"
                name="Collected"
                stroke="#39d128"
                strokeWidth={2}
                fill="url(#fillCollected)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  )
}