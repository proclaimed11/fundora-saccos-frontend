import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type TableSkeletonProps = {
  /** Real column headers to show (skeleton fills the cells below instead of the header). */
  columnHeaders?: string[]
  /** Used only if columnHeaders isn't provided — renders that many skeleton header bars. */
  columnCount?: number
  rows?: number
  /** Adds a trailing "Actions" column with a small icon-button-shaped skeleton per row. */
  showActionsColumn?: boolean
  /** Renders a search-bar + filter-dropdown skeleton row above the table. */
  showFilters?: boolean
  filterCount?: number
  /** Renders a "showing X of Y" + page-button skeleton row below the table. */
  showPagination?: boolean
  /** Wraps everything in a Card, matching the app's table pages. Set false to embed inline. */
  wrapInCard?: boolean
}

const TableSkeleton = ({
  columnHeaders,
  columnCount = 5,
  rows = 5,
  showActionsColumn = true,
  showFilters = true,
  filterCount = 2,
  showPagination = true,
  wrapInCard = true,
}: TableSkeletonProps) => {
  const columns = columnHeaders ?? Array.from({ length: columnCount })

  const content = (
    <div className="flex flex-col gap-4">
      {showFilters && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-9 w-full sm:max-w-xs" />
          {Array.from({ length: filterCount }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-32" />
          ))}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((header, i) => (
              <TableHead key={i}>
                {typeof header === "string" ? header : <Skeleton className="h-4 w-20" />}
              </TableHead>
            ))}
            {showActionsColumn && <TableHead className="w-10 text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <TableRow key={rowIdx}>
              {columns.map((_, colIdx) => (
                <TableCell key={colIdx}>
                  <Skeleton className="h-4 w-full max-w-32" />
                </TableCell>
              ))}
              {showActionsColumn && (
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showPagination && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="size-8 rounded-md" />
            ))}
          </div>
        </div>
      )}
    </div>
  )

  if (!wrapInCard) return content

  return (
    <Card>
      <CardContent>{content}</CardContent>
    </Card>
  )
}

export default TableSkeleton