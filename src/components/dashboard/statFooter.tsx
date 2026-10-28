import { AppIcon } from '../appIcon'

export type FooterStat = {
  label: string
  value: string
  /** change vs the previous period, in percent (or points when `unit` is 'pts') */
  change: number
  /** what the change is measured in, default '%' */
  unit?: '%' | 'pts'
  /** 'good' = green when it goes up, 'bad' = red when it goes up, 'neutral' = never colored */
  upIs?: 'good' | 'bad' | 'neutral'
}

type StatFooterProps = {
  stats: FooterStat[]
  /** small caption under the row, e.g. "Change compared with last month" */
  caption?: string
}

const FLAT_BELOW = 0.5

function tone(direction: 'up' | 'down' | 'flat', upIs: FooterStat['upIs']) {
  if (direction === 'flat' || upIs === 'neutral') return 'text-gray-500'
  const good = (direction === 'up') === (upIs !== 'bad')
  return good ? 'text-green-600' : 'text-red-600'
}

export function StatFooter({ stats, caption }: StatFooterProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => {
          const direction = Math.abs(s.change) < FLAT_BELOW ? 'flat' : s.change > 0 ? 'up' : 'down'
          const color = tone(direction, s.upIs ?? 'good')

          return (
            <div
              key={s.label}
              className={`px-3 py-2 text-center ${i > 0 ? 'lg:border-l lg:border-gray-100' : ''} ${
                i % 2 === 1 ? 'border-l border-gray-100 lg:border-l' : ''
              }`}
            >
              <div className={`flex items-center justify-center gap-1 text-xs font-medium ${color}`}>
                {direction === 'up' && <AppIcon name="arrow-up" size={12} />}
                {direction === 'down' && <AppIcon name="arrow-down" size={12} />}
                {direction === 'flat' ? '0' : Math.abs(s.change).toFixed(1)}
                {s.unit ?? '%'}
              </div>
              <div className="mt-0.5 truncate text-sm font-semibold text-gray-800">{s.value}</div>
              <div className="text-[11px] uppercase tracking-wide text-gray-500">{s.label}</div>
            </div>
          )
        })}
      </div>
      {caption && <div className="mt-2 text-center text-[11px] text-gray-400">{caption}</div>}
    </div>
  )
}