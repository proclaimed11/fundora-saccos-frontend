import { FolderOpenIcon } from "lucide-react"
import { TableCell, TableRow } from "../components/ui/table"

type TableEmptyStateProps = {
  colSpan: number
  message?: string
}

const TableEmptyState = ({ colSpan, message = "No records available" }: TableEmptyStateProps) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-14">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <FolderOpenIcon className="size-17 text-muted-foreground/40" strokeWidth={0.5} />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default TableEmptyState