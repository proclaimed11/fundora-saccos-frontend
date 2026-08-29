import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DialogFooter } from "@/components/ui/dialog"

const relationshipOptions = [
  { label: "Spouse", value: "Spouse" },
  { label: "Sibling", value: "Sibling" },
  { label: "Parent", value: "Parent" },
  { label: "Friend", value: "Friend" },
  { label: "Colleague", value: "Colleague" },
  { label: "Business Partner", value: "Business Partner" },
]

export type GuarantorFormValues = {
  fullName: string
  relationship: string
  phone: string
  email: string
  occupation: string
  address: string
  nationalId: string
  idDocumentPath: string | null
}

const emptyValues: GuarantorFormValues = {
  fullName: "",
  relationship: "",
  phone: "",
  email: "",
  occupation: "",
  address: "",
  nationalId: "",
  idDocumentPath: null,
}

type GuarantorFormProps = {
  initialValues?: Partial<GuarantorFormValues>
  onSubmit: (values: GuarantorFormValues) => void
  onCancel: () => void
}

const GuarantorForm = ({ initialValues, onSubmit, onCancel }: GuarantorFormProps) => {
  const [values, setValues] = useState<GuarantorFormValues>({
    ...emptyValues,
    ...initialValues,
  })
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null)

  const updateField = <K extends keyof GuarantorFormValues>(field: K, value: GuarantorFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setIdDocumentFile(file)
    // idDocumentPath will be set once the file is actually uploaded and a path is returned;
    // storing the file name here as a placeholder for now.
    updateField("idDocumentPath", file ? file.name : null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fullName"
            placeholder="Amina Mohamed"
            value={values.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="relationship">
            Relationship <span className="text-destructive">*</span>
          </Label>
          <Select
            value={values.relationship}
            onValueChange={(value) => updateField("relationship", value ?? "")}
          >
            <SelectTrigger id="relationship" className="w-full">
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent>
              {relationshipOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            placeholder="+255 712 345 678"
            value={values.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="amina.mohamed@example.com"
            value={values.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="occupation">
            Occupation <span className="text-destructive">*</span>
          </Label>
          <Input
            id="occupation"
            placeholder="Business Owner"
            value={values.occupation}
            onChange={(e) => updateField("occupation", e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nationalId">
            National ID (NIDA) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nationalId"
            placeholder="NIDA123456789"
            value={values.nationalId}
            onChange={(e) => updateField("nationalId", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">
          Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="address"
          placeholder="Mikocheni, Biafra Road, House No. 123, Dar es Salaam, Tanzania"
          value={values.address}
          onChange={(e) => updateField("address", e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="idDocument">ID Document</Label>
        <Input id="idDocument" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
        {idDocumentFile && (
          <p className="text-xs text-muted-foreground">Selected: {idDocumentFile.name}</p>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Guarantor</Button>
      </DialogFooter>
    </form>
  )
}

export default GuarantorForm