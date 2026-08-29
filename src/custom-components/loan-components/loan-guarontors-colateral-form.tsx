import { useState } from "react"
import { FileTextIcon, CheckCircle2Icon, Trash2Icon, UploadCloudIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import LoanGuarantorsTable from "./loan-guarantors-table"

type UploadedFile = {
  name: string
  size: string
}

type DocumentSlotProps = {
  label: string
  required?: boolean
  file: UploadedFile | null
  onFileSelect?: (file: UploadedFile) => void
  onFileRemove?: () => void
}

const DocumentSlot = ({ label, required, file, onFileSelect, onFileRemove }: DocumentSlotProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected || !onFileSelect) return
    onFileSelect({ name: selected.name, size: `${(selected.size / (1024 * 1024)).toFixed(1)} MB` })
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {file ? (
        <div className="flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2.5">
          <FileTextIcon className="size-5 shrink-0 text-muted-foreground" />
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{file.size}</p>
          </div>
          <CheckCircle2Icon className="size-4 shrink-0 text-emerald-600" />
          <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={onFileRemove}>
            <Trash2Icon className="size-4 text-muted-foreground" />
          </Button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed px-3 py-6 text-center hover:bg-muted/30">
          <UploadCloudIcon className="size-5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Drag & drop file here <br /> or click to browse
          </p>
          <p className="text-[11px] text-muted-foreground/70">PDF, JPG, PNG (Max 5MB)</p>
          <input type="file" className="hidden" onChange={handleChange} />
        </label>
      )}
    </div>
  )
}

const LoanGurantorsColateralCard = () => {
  const [nida, setNida] = useState<UploadedFile | null>(null)
  const [tin, setTin] = useState<UploadedFile | null>(null)
  const [additional, setAdditional] = useState<UploadedFile | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <LoanGuarantorsTable
        guarantors={[
          {
            id: "1",
            applicationId: "LA-1786436767272",
            fullName: "Salum Khamis",
            relationship: "Sibling",
            phone: "+255 713 000 111",
            email: "salum.khamis@example.com",
            occupation: "Businessman",
            address: "Kariakoo, Dar es Salaam",
            nationalId: "19870604-12345-00001-23",
            idDocumentPath: "/uploads/guarantor-nida-1.pdf",
            status: "Verified",
            submittedOn: "May 10, 2024",
            submittedTime: "09:20 AM",
            isoSubmittedOn: "2024-05-10",
          },
          {
            id: "2",
            applicationId: "LA-1786436767272",
            fullName: "Mohammed Hassan",
            relationship: "Friend",
            phone: "+255 712 345 678",
            email: "mohammed.h@example.com",
            occupation: "Bank Officer",
            address: "Mikocheni, Dar es Salaam",
            nationalId: "19760712-98765-00002-45",
            idDocumentPath: null,
            status: "Pending",
            submittedOn: "May 11, 2024",
            submittedTime: "10:12 AM",
            isoSubmittedOn: "2024-05-11",
          },
          {
            id: "3",
            applicationId: "LA-1786436767272",
            fullName: "Neema Lucas Mollel",
            relationship: "Colleague",
            phone: "+255 745 888 999",
            email: "neema.mollel@example.com",
            occupation: "Accountant",
            address: "Sinza, Dar es Salaam",
            nationalId: "19910322-55512-00003-67",
            idDocumentPath: "/uploads/guarantor-nida-3.pdf",
            status: "Pending",
            submittedOn: "May 12, 2024",
            submittedTime: "02:45 PM",
            isoSubmittedOn: "2024-05-12",
          },
        ]}
        onAddGuarantor={() => console.log("add guarantor")}
        onVerify={(g) => console.log("verify guarantor", g)}
      />
       <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Colateral Documents</CardTitle>
        <CardDescription>Upload clear copies of valid documents and ID's</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DocumentSlot
            label="National ID (NIDA)"
            required
            file={nida}
            onFileSelect={setNida}
            onFileRemove={() => setNida(null)}
          />
          <DocumentSlot
            label="TIN"
            required
            file={tin}
            onFileSelect={setTin}
            onFileRemove={() => setTin(null)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DocumentSlot
            label="Additional Document (Optional)"
            file={additional}
            onFileSelect={setAdditional}
            onFileRemove={() => setAdditional(null)}
          />
        </div>
      </CardContent>
    </Card>
    </div>
  )
}

export default LoanGurantorsColateralCard