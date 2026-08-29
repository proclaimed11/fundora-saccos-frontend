import { useState } from "react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { DownloadIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react"
import { Card, CardContent } from "../../src/components/ui/card"
import { Input } from "../../src/components/ui/input"
import { Label } from "../../src/components/ui/label"
import { Button } from "../../src/components/ui/button"
import { Badge } from "../../src/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../src/components/ui/collapsible"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select"

export type FilterOption = {
  label: string
  value: string
}

export type FilterConfig = {
  key: string
  label: string
  value: string
  onChange: (value: string) => void
  options: FilterOption[]
  widthClassName?: string
}

type TableFilterBarProps = {
  /** Optional heading shown to the left of the search input (e.g. "Repayment Transactions"). */
  title?: string
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  searchPlaceholder?: string
  filters?: FilterConfig[]
  showDateRange?: boolean
  dateRange?: DateRange | undefined
  onDateRangeChange?: (range: DateRange | undefined) => void
  onExport?: () => void
  /** Optional custom content rendered at the very end of the bar, after the Export button
   *  (e.g. a "Send Message" action specific to one table). */
  endSlot?: React.ReactNode
  /** When true, renders just the filter row content without its own Card wrapper,
   *  so it can be embedded inside another Card (e.g. on top of a table). */
  bare?: boolean
}

// Native <input type="date"> needs "yyyy-MM-dd"; formats to/from a Date safely.
const toDateInputValue = (date: Date | undefined) => (date ? format(date, "yyyy-MM-dd") : "")

const fromDateInputValue = (value: string) => {
  if (!value) return undefined
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

const DateRangeInputs = ({
  dateRange,
  onDateRangeChange,
}: {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
}) => {
  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const from = fromDateInputValue(e.target.value)
    onDateRangeChange(from || dateRange?.to ? { from, to: dateRange?.to } : undefined)
  }

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const to = fromDateInputValue(e.target.value)
    onDateRangeChange(dateRange?.from || to ? { from: dateRange?.from, to } : undefined)
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">From</Label>
        <Input type="date" value={toDateInputValue(dateRange?.from)} onChange={handleFromChange} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">To</Label>
        <Input
          type="date"
          value={toDateInputValue(dateRange?.to)}
          min={toDateInputValue(dateRange?.from)}
          onChange={handleToChange}
        />
      </div>
    </>
  )
}

const TableFilterBar = ({
  title,
  searchQuery,
  onSearchQueryChange,
  searchPlaceholder = "Search...",
  filters = [],
  showDateRange = false,
  dateRange,
  onDateRangeChange,
  onExport,
  endSlot,
  bare = false,
}: TableFilterBarProps) => {
  const [filtersOpen, setFiltersOpen] = useState(false)

  const hasFilters = filters.length > 0 || showDateRange

  const activeFilterCount =
    filters.filter((f) => f.value && f.value !== "all").length + (dateRange?.from ? 1 : 0)

  const handleClearAll = () => {
    filters.forEach((filter) => filter.onChange("all"))
    onDateRangeChange?.(undefined)
  }

  const content = (
    <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-1">
          {title && <h2 className="whitespace-nowrap text-sm font-semibold">{title}</h2>}

          <div className="relative flex-1 sm:max-w-sm">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasFilters && (
            <CollapsibleTrigger
              render={
                <Button variant="outline" className="gap-1.5 bg-white">
                  <SlidersHorizontalIcon className="size-4" strokeWidth={1.75} />
                  Filter
                  {activeFilterCount > 0 && (
                    <Badge className="ml-0.5 flex size-5 items-center justify-center rounded-full p-0 text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              }
            />
          )}

          {onExport && (
            <Button variant="outline" className="bg-white" onClick={onExport}>
              <DownloadIcon className="size-4" strokeWidth={1.75} />
              Export
            </Button>
          )}

          {endSlot}
        </div>
      </div>

      {hasFilters && (
        <CollapsibleContent className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filters.map((filter) => (
              <div key={filter.key} className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">{filter.label}</Label>
                <Select value={filter.value} onValueChange={(value) => filter.onChange(value ?? filter.value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            {showDateRange && (
              <DateRangeInputs dateRange={dateRange} onDateRangeChange={onDateRangeChange ?? (() => {})} />
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" className="bg-white" size="sm" onClick={handleClearAll}>
              Clear All
            </Button>
            <Button size="sm" onClick={() => setFiltersOpen(false)}>
              Apply
            </Button>
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  )

  if (bare) {
    return content
  }

  return (
    <Card>
      <CardContent>{content}</CardContent>
    </Card>
  )
}

export default TableFilterBar