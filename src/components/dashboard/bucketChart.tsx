import type { ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '../chartCard'
import { formatTzs } from '../../utils/format'

export type Bucket = { label: string; count: number; amount: number; color: string }

const compact = (n: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

type BucketChartProps = {
  title: string
  buckets: Bucket[]
  /** colors the card's title bar */
  headerColor?: string
  /** line shown under the chart, e.g. a total */
  footer?: ReactNode
}

export function BucketChart({ title, buckets, headerColor, footer }: BucketChartProps) {
  return (
    <ChartCard title={title} headerColor={headerColor} footer={footer} cardHeight={224}>
      {(height) => (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buckets} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#868e96' }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={compact}
                tick={{ fontSize: 11, fill: '#868e96' }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const b = payload[0].payload as Bucket
                  return (
                    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
                      <div className="font-semibold text-gray-700">{b.label}</div>
                      <div className="text-gray-500">
                        {b.count} {b.count === 1 ? 'loan' : 'loans'}
                      </div>
                      <div className="text-gray-700">{formatTzs(b.amount)}</div>
                    </div>
                  )
                }}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={44}>
                {buckets.map((b) => (
                  <Cell key={b.label} fill={b.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  )
}