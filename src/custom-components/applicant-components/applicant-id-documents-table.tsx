import { FileTextIcon, MoreVerticalIcon, EyeIcon, DownloadIcon, Trash2Icon } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"

type DocumentStatus = "Verified" | "Pending" | "Rejected"

type IdentityDocument = {
  documentType: string
  documentNumber: string
  issueDate: string
  expiryDate: string
  status: DocumentStatus
}

const documentStatusStyles: Record<DocumentStatus, string> = {
  Verified: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Rejected: "bg-red-100 text-red-700 hover:bg-red-100",
}

const identityDocuments: IdentityDocument[] = [
  { documentType: "National ID (NIDA)", documentNumber: "19900514-12345-00001-23", issueDate: "May 14, 2019", expiryDate: "-", status: "Verified" },
  { documentType: "TIN Certificate", documentNumber: "123-456-789", issueDate: "May 14, 2019", expiryDate: "-", status: "Verified" },
  { documentType: "Proof of Address", documentNumber: "Address_001.pdf", issueDate: "May 14, 2024", expiryDate: "-", status: "Verified" },
]

type IdentityDocumentsTableProps = {
  onView?: (document: IdentityDocument) => void
  onDownload?: (document: IdentityDocument) => void
  onDelete?: (document: IdentityDocument) => void
}

const IdentityDocumentsTable = ({ onView, onDownload, onDelete }: IdentityDocumentsTableProps) => {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start gap-2">
          <FileTextIcon className="mt-0.5 size-4 text-muted-foreground" />
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold">Identity Documents</h2>
            <p className="text-sm text-muted-foreground">Upload and manage applicant's identification documents</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Type</TableHead>
              <TableHead>Document Number</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {identityDocuments.map((document) => (
              <TableRow key={document.documentType}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="size-4 text-muted-foreground" />
                    {document.documentType}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{document.documentNumber}</TableCell>
                <TableCell className="text-muted-foreground">{document.issueDate}</TableCell>
                <TableCell className="text-muted-foreground">{document.expiryDate}</TableCell>
                <TableCell>
                  <Badge className={documentStatusStyles[document.status]} variant="secondary">
                    {document.status}
                  </Badge>
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
                      <DropdownMenuItem onClick={() => onView?.(document)}>
                        <EyeIcon className="size-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDownload?.(document)}>
                        <DownloadIcon className="size-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(document)}>
                        <Trash2Icon className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default IdentityDocumentsTable