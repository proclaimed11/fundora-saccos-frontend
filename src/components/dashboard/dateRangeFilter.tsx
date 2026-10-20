import { AppIcon } from '../appIcon'
import { useState } from 'react'
import { Button } from '@mantine/core'
import { DateInput } from '@mantine/dates'

export type DateRange = { from: string | null; to: string | null }

type DateRangeFilterProps = {
  /** called when the Filter button is clicked */
  onApply: (range: DateRange) => void
}

export function DateRangeFilter({ onApply }: DateRangeFilterProps) {
  const [from, setFrom] = useState<string | null>(null)
  const [to, setTo] = useState<string | null>(null)

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <DateInput
        size="xs"
        placeholder="From"
        aria-label="From date"
        valueFormat="MMM D, YYYY"
        value={from}
        maxDate={to ?? undefined}
        onChange={setFrom}
        clearable
        w={130}
      />
      <DateInput
        size="xs"
        placeholder="To"
        aria-label="To date"
        valueFormat="MMM D, YYYY"
        value={to}
        minDate={from ?? undefined}
        onChange={setTo}
        clearable
        w={130}
      />
      <Button
        size="xs"
        leftSection={<AppIcon name="filter" />}
        onClick={() => onApply({ from, to })}
      >
        Filter
      </Button>
    </div>
  )
}