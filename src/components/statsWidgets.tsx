import { Skeleton } from '@mantine/core'

type StatWidgetProps = {
  value: string | number
  label: string
  /** Font Awesome 4.7 class, e.g. 'fa-users' */
  icon: string
  /** icon color, any CSS color */
  color: string
  /** optional override for the value color, defaults to the normal dark text */
  valueColor?: string
  /** optional unit label; overrides the TZS prefix when the value is formatted as currency */
  miniLabel?: string | null
  /** makes the whole card clickable */
  onClick?: () => void
  loading?: boolean
}

export function StatWidget({
  value,
  label,
  icon,
  color,
  valueColor,
  miniLabel,
  onClick,
  loading = false,
}: StatWidgetProps) {
  const Tag = onClick ? 'button' : 'div'
  const hasTzsPrefix = typeof value === 'string' && value.startsWith('TZS ')
  const hasCustomCurrencyLabel = hasTzsPrefix && miniLabel !== undefined
  const displayUnit = miniLabel && !hasTzsPrefix ? miniLabel : null
  const formattedLabel = label.toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase())

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 rounded border border-gray-200 bg-white px-4 py-4 text-left ${
        onClick
          ? 'cursor-pointer transition-colors hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300'
          : ''
      }`}
    >
      {loading ? (
        <>
          <div className="min-w-0 flex-1">
            <Skeleton height={10} width={90} mb={8} />
            <Skeleton height={20} width={70} />
          </div>
          <Skeleton height={40} width={40} circle className="shrink-0" />
        </>
      ) : (
        <>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] font-semibold tracking-wide text-slate-500">
              {formattedLabel}
            </div>
            <div
              className="truncate text-xl font-semibold leading-tight text-gray-800"
              style={valueColor ? { color: valueColor } : undefined}
            >
              {hasCustomCurrencyLabel ? (
                <>
                  {miniLabel && <span className="mr-1 text-sm font-normal">{miniLabel}</span>}
                  {value.slice(4)}
                </>
              ) : (
                value
              )}
              {displayUnit && <span className="ml-1 text-sm font-normal">{displayUnit}</span>}
            </div>
          </div>

          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{
              backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${color} 55%, white), color-mix(in srgb, ${color} 65%, black))`,
            }}
            aria-hidden="true"
          >
            <i
              className={`fa ${icon} text-center leading-none text-white`}
              style={{ fontSize: 18 }}
            />
          </span>
        </>
      )}
    </Tag>
  )
}