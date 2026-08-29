import { useState } from "react"
import { FileTextIcon, CheckCircle2Icon, Trash2Icon, UploadCloudIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"

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

const IdentificationDocumentsCard = () => {
  const [nida, setNida] = useState<UploadedFile | null>(null)
  const [tin, setTin] = useState<UploadedFile | null>(null)
  const [additional, setAdditional] = useState<UploadedFile | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Identification Documents</CardTitle>
        <CardDescription>Upload clear copies of valid identification documents</CardDescription>
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
  )
}

export default IdentificationDocumentsCard