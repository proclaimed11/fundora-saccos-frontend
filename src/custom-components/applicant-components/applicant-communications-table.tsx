import { useState } from "react"
import { SendIcon } from "lucide-react"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import TableFilterBar from "../table-filter-bar"
import { exportToCsv } from "../../lib/export-csv"
import TableEmptyState from "../table-empty-state"

export type CommunicationLog = {
  id: string
  date: string
  isoDate: string
  type: string
  typeValue: string
  channel: string
  message: string
  sentBy: string
  status: "Delivered" | "Pending" | "Failed"
  reference: string
}

type ApplicantsCommunicationsTableProps = {
  communications: CommunicationLog[]
  onSendMessage?: () => void
}

const typeOptions = [
  { label: "All Types", value: "all" },
  { label: "Notification", value: "notification" },
  { label: "Application", value: "application" },
  { label: "Reminder", value: "reminder" },
  { label: "Document Request", value: "document_request" },
  { label: "OTP", value: "otp" },
]

const dateRangeOptions = [
  { label: "Last 3 Months", value: "3m" },
  { label: "Last 6 Months", value: "6m" },
  { label: "Last 12 Months", value: "12m" },
  { label: "All Time", value: "all" },
]

const monthsForRange: Record<string, number | null> = {
  "3m": 3,
  "6m": 6,
  "12m": 12,
  all: null,
}

const statusBadgeStyles: Record<CommunicationLog["status"], string> = {
  Delivered: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Failed: "bg-red-100 text-red-700 hover:bg-red-100",
}

const channelBadgeStyles: Record<string, string> = {
  SMS: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  Email: "bg-purple-100 text-purple-700 hover:bg-purple-100",
}

const ApplicantsCommunicationsTable = ({ communications, onSendMessage }: ApplicantsCommunicationsTableProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [type, setType] = useState("all")
  const [dateRange, setDateRange] = useState("all")

  const filteredCommunications = communications.filter((log) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      log.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = type === "all" || log.typeValue === type

    const monthsBack = monthsForRange[dateRange]
    let matchesDate = true
    if (monthsBack !== null) {
      const cutoff = new Date()
      cutoff.setMonth(cutoff.getMonth() - monthsBack)
      matchesDate = new Date(log.isoDate) >= cutoff
    }

    return matchesSearch && matchesType && matchesDate
  })

  const handleExport = () => {
    exportToCsv(
      filteredCommunications,
      [
        { header: "Date & Time", accessor: (row) => row.date },
        { header: "Channel", accessor: (row) => row.channel },
        { header: "Type", accessor: (row) => row.type },
        { header: "Subject / Message", accessor: (row) => row.message },
        { header: "Sent By", accessor: (row) => row.sentBy },
        { header: "Status", accessor: (row) => row.status },
        { header: "Reference", accessor: (row) => row.reference },
      ],
      "communications.csv",
    )
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <TableFilterBar
          bare
          title="Communications"
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchPlaceholder="Search"
          filters={[
            {
              key: "type",
              label: "Type",
              value: type,
              onChange: setType,
              options: typeOptions,
              widthClassName: "w-44",
            },
            {
              key: "dateRange",
              label: "Period",
              value: dateRange,
              onChange: setDateRange,
              options: dateRangeOptions,
              widthClassName: "w-40",
            },
          ]}
          onExport={handleExport}
          endSlot={
            onSendMessage && (
              <Button onClick={onSendMessage}>
                <SendIcon className="size-4" />
                Send Message
              </Button>
            )
          }
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subject / Message</TableHead>
              <TableHead>Sent By</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCommunications.length === 0 ? (
              <TableEmptyState colSpan={9} message="No communications avalable" />
            ) : (
              filteredCommunications.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground">{log.date}</TableCell>
                  <TableCell>
                    <Badge className={channelBadgeStyles[log.channel] ?? ""} variant="secondary">
                      {log.channel}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.type}</TableCell>
                  <TableCell className="max-w-md truncate text-muted-foreground">{log.message}</TableCell>
                  <TableCell>{log.sentBy}</TableCell>
                  <TableCell>
                    <Badge className={statusBadgeStyles[log.status]} variant="secondary">
                      {log.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default ApplicantsCommunicationsTable