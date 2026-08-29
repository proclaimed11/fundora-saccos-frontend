import { useMemo, useState } from "react"
import {
  DownloadIcon,
  PencilIcon,
  CheckIcon,
  XIcon,
} from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Separator } from "../../components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { exportToCsv } from "../../lib/export-csv"
import TableEmptyState from "../table-empty-state"

export type InstallmentStatus = "PENDING" | "PAID" | "OVERDUE"

export type RepaymentScheduleItem = {
  id: string
  installmentNo: number
  dueDate: string
  principalDue: string
  interestDue: string
  totalDue: string
  outstandingAmount: string
  status: InstallmentStatus
}

type LoanRepaymentScheduleTableProps = {
  principalAmount: string
  totalScheduledAmount: string
  schedule: RepaymentScheduleItem[]
  onScheduleChange?: (schedule: RepaymentScheduleItem[]) => void
}

const statusBadgeStyles: Record<InstallmentStatus, string> = {
  PAID: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  OVERDUE: "bg-red-100 text-red-700 hover:bg-red-100",
  PENDING: "bg-slate-100 text-slate-700 hover:bg-slate-100",
}

const statusLabels: Record<InstallmentStatus, string> = {
  PAID: "Paid",
  OVERDUE: "Overdue",
  PENDING: "Pending",
}

const statusOptions: InstallmentStatus[] = ["PENDING", "PAID", "OVERDUE"]

// Strips currency symbols/commas/whitespace and parses to a number.
// Falls back to 0 for anything unparsable so a bad row can't blow up the total.
const parseAmount = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0
  const numeric = Number(String(value).replace(/[^0-9.-]/g, ""))
  return Number.isFinite(numeric) ? numeric : 0
}

const formatCurrency = (value: number): string => `TZS ${value.toLocaleString("en-US")}`

type SummaryWidget = {
  key: string
  label: string
  value: string
}

const LoanRepaymentScheduleTable = ({
  principalAmount,
  totalScheduledAmount,
  schedule: initialSchedule,
  onScheduleChange,
}: LoanRepaymentScheduleTableProps) => {
  const [schedule, setSchedule] = useState(initialSchedule)
  const [drafts, setDrafts] = useState<Record<string, RepaymentScheduleItem>>({})

  const summaryWidgets: SummaryWidget[] = useMemo(() => {
    const paidCount = schedule.filter((item) => item.status === "PAID").length
    const totalOutstanding = schedule.reduce((sum, item) => sum + parseAmount(item.outstandingAmount), 0)

    return [
      {
        key: "principal",
        label: "Principal Amount",
        value: principalAmount,
      },
      {
        key: "total",
        label: "Total Scheduled",
        value: totalScheduledAmount,
      },
      {
        key: "outstanding",
        label: "Outstanding",
        value: formatCurrency(totalOutstanding),
      },
      {
        key: "paid",
        label: "Paid",
        value: `${paidCount} / ${schedule.length}`,
      },
    ]
  }, [schedule, principalAmount, totalScheduledAmount])

  const handleExport = () => {
    exportToCsv(
      schedule,
      [
        { header: "Installment No.", accessor: (row) => row.installmentNo },
        { header: "Due Date", accessor: (row) => row.dueDate },
        { header: "Principal Due", accessor: (row) => row.principalDue },
        { header: "Interest Due", accessor: (row) => row.interestDue },
        { header: "Total Due", accessor: (row) => row.totalDue },
        { header: "Outstanding", accessor: (row) => row.outstandingAmount },
        { header: "Status", accessor: (row) => statusLabels[row.status] },
      ],
      "repayment-schedule.csv",
    )
  }

  const startEdit = (item: RepaymentScheduleItem) => {
    setDrafts((prev) => ({ ...prev, [item.id]: { ...item } }))
  }

  const cancelEdit = (id: string) => {
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const updateDraft = (id: string, patch: Partial<RepaymentScheduleItem>) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  const saveEdit = (id: string) => {
    const draft = drafts[id]
    if (!draft) return
    const updated = schedule.map((item) => (item.id === id ? draft : item))
    setSchedule(updated)
    onScheduleChange?.(updated)
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Repayment Schedule</h2>
          <Button variant="outline" size="sm" className="bg-white" onClick={handleExport}>
            <DownloadIcon className="size-4" />
            Export
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
          {summaryWidgets.map(({ key, label, value }, index) => (
            <div key={key} className="flex flex-1 items-stretch gap-4">
              <div className="flex flex-1 flex-col gap-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-base font-semibold text-foreground">{value}</p>
              </div>

              {index < summaryWidgets.length - 1 && (
                <Separator orientation="vertical" className="hidden self-center !h-10 sm:block" />
              )}
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-md border">
          <Table className="border-collapse">
            <TableHeader>
              <TableRow>
                <TableHead className="border-r border-b">#</TableHead>
                <TableHead className="border-r border-b">Due Date</TableHead>
                <TableHead className="border-r border-b">Principal Due</TableHead>
                <TableHead className="border-r border-b">Interest Due</TableHead>
                <TableHead className="border-r border-b">Total Due</TableHead>
                <TableHead className="border-r border-b">Outstanding</TableHead>
                <TableHead className="border-r border-b">Status</TableHead>
                <TableHead className="border-b text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.length === 0 ? (
                  <TableEmptyState colSpan={9} message="No installments to show" />
              ) : (
                schedule.map((item) => {
                  const draft = drafts[item.id]
                  const isEditing = !!draft

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="border-r border-b">{item.installmentNo}</TableCell>

                      <TableCell className="border-r border-b">
                        {isEditing ? (
                          <Input
                            value={draft.dueDate}
                            onChange={(e) => updateDraft(item.id, { dueDate: e.target.value })}
                            className="h-8"
                          />
                        ) : (
                          <span className="text-muted-foreground">{item.dueDate}</span>
                        )}
                      </TableCell>

                      <TableCell className="border-r border-b">
                        {isEditing ? (
                          <Input
                            value={draft.principalDue}
                            onChange={(e) => updateDraft(item.id, { principalDue: e.target.value })}
                            className="h-8"
                          />
                        ) : (
                          item.principalDue
                        )}
                      </TableCell>

                      <TableCell className="border-r border-b">
                        {isEditing ? (
                          <Input
                            value={draft.interestDue}
                            onChange={(e) => updateDraft(item.id, { interestDue: e.target.value })}
                            className="h-8"
                          />
                        ) : (
                          item.interestDue
                        )}
                      </TableCell>

                      <TableCell className="border-r border-b font-medium">
                        {isEditing ? (
                          <Input
                            value={draft.totalDue}
                            onChange={(e) => updateDraft(item.id, { totalDue: e.target.value })}
                            className="h-8"
                          />
                        ) : (
                          item.totalDue
                        )}
                      </TableCell>

                      <TableCell className="border-r border-b">
                        {isEditing ? (
                          <Input
                            value={draft.outstandingAmount}
                            onChange={(e) => updateDraft(item.id, { outstandingAmount: e.target.value })}
                            className="h-8"
                          />
                        ) : (
                          <span className="text-muted-foreground">{item.outstandingAmount}</span>
                        )}
                      </TableCell>

                      <TableCell className="border-r border-b">
                        {isEditing ? (
                          <Select
                            value={draft.status}
                            onValueChange={(value) =>
                              updateDraft(item.id, { status: value as InstallmentStatus })
                            }
                          >
                            <SelectTrigger className="h-8 w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {statusLabels[status]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={statusBadgeStyles[item.status]} variant="secondary">
                            {statusLabels[item.status]}
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="border-b text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => saveEdit(item.id)}>
                              <CheckIcon className="size-4 text-emerald-600" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => cancelEdit(item.id)}>
                              <XIcon className="size-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="icon-sm" onClick={() => startEdit(item)}>
                            <PencilIcon className="size-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoanRepaymentScheduleTable