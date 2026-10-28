import { useNavigate } from 'react-router-dom'
import { Badge, Button, Text } from '@mantine/core'
import { ContentCard } from '../contentCard'
import { CustomTable, type CustomTableColumn } from '../customTable/customTable'

export type QueueRow = {
  id: number | string
  /** main line, usually the borrower */
  title: string
  /** small line under it, e.g. the application number */
  sub: string
  /** value on the right, e.g. an amount */
  value: string
  /** small line under the value, e.g. "Waiting 5 days" */
  valueSub?: string
  /** highlight the waiting text in amber */
  late?: boolean
  /** where the View button goes */
  to: string
}

type QueueCardProps = {
  title: string
  /** how many items are waiting in total, shown next to the title */
  count: number
  rows: QueueRow[]
  /** the full page, opened by "View all" */
  viewAllTo: string
  emptyText: string
  /** column titles, the defaults suit loan items */
  titleHeader?: string
  valueHeader?: string
  /** how many rows to show, default 4 */
  limit?: number
  /** the CustomTable size, default 'xs' */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export function QueueCard({
  title,
  count,
  rows,
  viewAllTo,
  emptyText,
  titleHeader = 'Borrower',
  valueHeader = 'Amount',
  limit = 4,
  size = 'xs',
}: QueueCardProps) {
  const navigate = useNavigate()
  const shown = rows.slice(0, limit)
  const hidden = rows.length - shown.length

  const columns: CustomTableColumn<QueueRow>[] = [
    {
      accessor: 'title',
      header: titleHeader,
      sortable: false,
      render: (r) => (
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-gray-800">{r.title}</div>
          <div className="truncate text-xs text-gray-500">{r.sub}</div>
        </div>
      ),
    },
    {
      accessor: 'value',
      header: valueHeader,
      sortable: false,
      render: (r) => (
        <div>
          <div className="whitespace-nowrap text-sm font-medium text-gray-800">{r.value}</div>
          {r.valueSub && (
            <div className={`whitespace-nowrap text-xs ${r.late ? 'font-medium text-amber-600' : 'text-gray-500'}`}>
              {r.valueSub}
            </div>
          )}
        </div>
      ),
    },
    {
      // the action for this row; "id" is only used as the accessor
      accessor: 'id',
      header: '',
      sortable: false,
      align: 'right',
      width: 70,
      render: (r) => (
        <Button size="compact-xs" variant="light" onClick={() => navigate(r.to)}>
          View
        </Button>
      ),
    },
  ]

  return (
    <ContentCard
      title={title}
      headerColor="#fcfdfc"
      headerTextColor="#1f2937"
      action={
        <div className="flex items-center gap-2">
          <Badge variant="light" color={count > 0 ? 'brand' : 'gray'} radius="sm" size="sm">
            {count}
          </Badge>
          <Button size="compact-xs" variant="default" onClick={() => navigate(viewAllTo)}>
            View all
          </Button>
        </div>
      }
    >
      <CustomTable<QueueRow>
        size={size}
        data={shown}
        columns={columns}
        pagination={false}
        // keep the order given, the queues are already oldest first
        defaultSort={null}
        noRecordText={emptyText}
      />

      {hidden > 0 && (
        <Text size="xs" c="dimmed" ta="center" mt="xs">
          + {hidden} more, open View all to see them
        </Text>
      )}
    </ContentCard>
  )
}