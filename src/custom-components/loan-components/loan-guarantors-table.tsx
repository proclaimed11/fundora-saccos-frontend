import { useState } from "react"
import { MailIcon, PhoneIcon, MapPinIcon, MoreVerticalIcon, UserPlusIcon } from "lucide-react"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import TableFilterBar from "../table-filter-bar"
import { exportToCsv } from "../../lib/export-csv"
import GuarantorForm, { type GuarantorFormValues } from "./loan-application-new-guarantor-form"

export type GuarantorStatus = "Pending" | "Verified"

export type Guarantor = {
  id: string
  applicationId: string
  fullName: string
  relationship: string
  phone: string
  email: string
  occupation: string
  address: string
  nationalId: string // not shown in table — needed later for the verify step
  idDocumentPath: string | null // not shown in table — needed later for the verify step
  status: GuarantorStatus
  submittedOn: string
  submittedTime: string
  isoSubmittedOn: string
}

type LoanGuarantorsTableProps = {
  guarantors: Guarantor[]
  onAddGuarantor?: (values: GuarantorFormValues) => void
  onVerify?: (guarantor: Guarantor) => void
  onEdit?: (guarantor: Guarantor) => void
  onRemove?: (guarantor: Guarantor) => void
}

const relationshipOptions = [
  { label: "All Relationships", value: "all" },
  { label: "Spouse", value: "Spouse" },
  { label: "Sibling", value: "Sibling" },
  { label: "Parent", value: "Parent" },
  { label: "Friend", value: "Friend" },
  { label: "Colleague", value: "Colleague" },
  { label: "Business Partner", value: "Business Partner" },
]

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Verified", value: "Verified" },
  { label: "Pending", value: "Pending" },
]

const statusBadgeStyles: Record<GuarantorStatus, string> = {
  Verified: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
}

const LoanGuarantorsTable = ({ guarantors, onAddGuarantor, onVerify, onEdit, onRemove }: LoanGuarantorsTableProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [relationship, setRelationship] = useState("all")
  const [status, setStatus] = useState("all")
  const [isAddGuarantorOpen, setIsAddGuarantorOpen] = useState(false)

  const filteredGuarantors = guarantors.filter((g) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      g.fullName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRelationship = relationship === "all" || g.relationship === relationship
    const matchesStatus = status === "all" || g.status === status

    return matchesSearch && matchesRelationship && matchesStatus
  })

  const handleExport = () => {
    exportToCsv(
      filteredGuarantors,
      [
        { header: "Guarantor", accessor: (row) => row.fullName },
        { header: "Relationship", accessor: (row) => row.relationship },
        { header: "Phone", accessor: (row) => row.phone },
        { header: "Email", accessor: (row) => row.email },
        { header: "Occupation", accessor: (row) => row.occupation },
        { header: "Address", accessor: (row) => row.address },
        { header: "Status", accessor: (row) => row.status },
        { header: "Submitted On", accessor: (row) => row.submittedOn },
      ],
      "loan-guarantors.csv",
    )
  }

  const handleFormSubmit = (values: GuarantorFormValues) => {
    onAddGuarantor?.(values)
    setIsAddGuarantorOpen(false)
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <TableFilterBar
          bare
          title="Guarantors"
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchPlaceholder="Search"
          filters={[
            {
              key: "relationship",
              label: "Relationship",
              value: relationship,
              onChange: setRelationship,
              options: relationshipOptions,
              widthClassName: "w-44",
            },
            {
              key: "status",
              label: "Status",
              value: status,
              onChange: setStatus,
              options: statusOptions,
              widthClassName: "w-40",
            },
          ]}
          onExport={handleExport}
          endSlot={
            <Button onClick={() => setIsAddGuarantorOpen(true)}>
              <UserPlusIcon className="size-4" />
              Add Guarantor
            </Button>
          }
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Guarantor</TableHead>
              <TableHead>Relationship</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Occupation</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted On</TableHead>
              <TableHead className="w-10 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuarantors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                  No guarantors match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredGuarantors.map((g, index) => (
                <TableRow key={g.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{g.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{g.relationship}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <PhoneIcon className="size-3" />
                        {g.phone}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MailIcon className="size-3" />
                        {g.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{g.occupation}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPinIcon className="size-3 shrink-0" />
                      {g.address}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusBadgeStyles[g.status]} variant="secondary">
                      {g.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm text-muted-foreground">{g.submittedOn}</span>
                      <span className="text-xs text-muted-foreground">{g.submittedTime}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVerticalIcon className="size-4 text-muted-foreground" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        {g.status === "Pending" && (
                          <DropdownMenuItem onClick={() => onVerify?.(g)}>Verify</DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onEdit?.(g)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => onRemove?.(g)}>
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isAddGuarantorOpen} onOpenChange={setIsAddGuarantorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Guarantor</DialogTitle>
          </DialogHeader>
          <GuarantorForm onSubmit={handleFormSubmit} onCancel={() => setIsAddGuarantorOpen(false)} />
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default LoanGuarantorsTable