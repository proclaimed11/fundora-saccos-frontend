import { useState } from "react"
import {
  CheckIcon,
  FileTextIcon,
  EyeIcon,
  DownloadIcon,
  ShieldCheckIcon,
  UploadCloudIcon,
  XIcon,
  FileIcon,
  PencilIcon,
} from "lucide-react"
import { PDFViewer } from "@react-pdf/renderer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import LoanContractDocument, { type LoanContractData } from "../reports/loan-application-contract-document-template"

const sampleContractData: LoanContractData = {
  lender: {
    name: "Fundora Credit Solutions",
    address: "P.O BOX 12345, Dar es Salaam, Tanzania",
    phone: "+255 712 345 678",
    email: "info@fundora.co.tz",
    website: "www.fundora.co.tz",
    tin: "123-456-789",
    vrn: "40-123456-Z",
  },
  contract: {
    contractNo: "CNT-000241",
    applicationNo: "LA-0000241",
    dateGenerated: "May 14, 2024",
    status: "GENERATED",
  },
  borrower: {
    fullName: "Juma Ali Said",
    address: "Mikocheni, Biafra Road, House No. 123, Dar es Salaam, Tanzania",
    phone: "+255 712 345 678",
    email: "juma.said@example.com",
    dateOfBirth: "May 14, 1990",
    occupation: "Business Owner",
    idNumber: "19900114-12345-00001",
  },
  loan: {
    loanType: "Personal Loan",
    loanAmount: "TZS 25,000,000",
    interestRate: "12.00% p.a.",
    interestMethod: "Reducing Balance",
    repaymentMethod: "Equal Installments",
    tenure: "24 Months",
    repaymentFrequency: "Monthly",
    firstRepaymentDate: "Jun 15, 2024",
    disbursementMethod: "Bank Transfer",
    purpose: "Business Expansion",
  },
  repaymentSummary: {
    principalAmount: "TZS 25,000,000",
    totalInterest: "TZS 3,270,000",
    totalRepayableAmount: "TZS 28,270,000",
  },
  schedule: [
    { installmentNo: "1", dueDate: "Jun 15, 2024", principal: "1,041,667", interest: "250,000", total: "1,291,667" },
    { installmentNo: "2", dueDate: "Jul 15, 2024", principal: "1,052,083", interest: "239,583", total: "1,291,667" },
    { installmentNo: "3", dueDate: "Aug 15, 2024", principal: "1,062,604", interest: "229,063", total: "1,291,667" },
    { installmentNo: "...", dueDate: "...", principal: "...", interest: "...", total: "..." },
    { installmentNo: "24", dueDate: "May 15, 2026", principal: "1,194,807", interest: "96,860", total: "1,291,667" },
  ],
}

type WorkflowStatus = "completed" | "active" | "upcoming"

type WorkflowStep = {
  id: string
  step: number
  title: string
  timestamp?: string
  description: string
  status: WorkflowStatus
}

const workflowSteps: WorkflowStep[] = [
  {
    id: "1",
    step: 1,
    title: "Contract Generated",
    timestamp: "May 14, 2024 09:45 AM",
    description: "Loan contract has been generated successfully.",
    status: "completed",
  },
  {
    id: "2",
    step: 2,
    title: "Contract Sent to Applicant",
    timestamp: "May 14, 2024 10:20 AM",
    description: "The contract has been sent to the applicant via email.",
    status: "completed",
  },
  {
    id: "3",
    step: 3,
    title: "Signed Contract Upload",
    timestamp: "Pending",
    description: "Upload the signed contract returned by the applicant.",
    status: "active",
  },
]

const requirements = [
  "Contract must be signed by the applicant",
  "All pages must be clear and readable",
  "Accepted formats: PDF, JPG, PNG",
  "Maximum file size: 10MB",
]

const WorkflowStepIcon = ({ step }: { step: WorkflowStep }) => {
  if (step.status === "completed") {
    return (
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <CheckIcon className="size-3.5" />
      </div>
    )
  }
  if (step.status === "active") {
    return (
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-primary text-xs font-semibold text-primary">
        {step.step}
      </div>
    )
  }
  return (
    <div className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/30 text-xs font-semibold text-muted-foreground">
      {step.step}
    </div>
  )
}

const ContractWorkflowSidebar = () => {
  return (
    <div className="flex flex-col gap-1 p-6">
      <h2 className="mb-4 text-base font-semibold">Contract Workflow</h2>

      {workflowSteps.map((step, idx) => (
        <div key={step.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <WorkflowStepIcon step={step} />
            {idx < workflowSteps.length - 1 && (
              <div
                className={cn(
                  "my-1 w-px flex-1",
                  step.status === "completed" ? "bg-primary/40" : "bg-border"
                )}
              />
            )}
          </div>
          <div className={cn("flex flex-col gap-0.5 pb-6", step.status === "upcoming" && "opacity-60")}>
            <p className={cn("text-sm font-medium", step.status === "completed" && "text-primary")}>{step.title}</p>
            <p className="text-xs text-muted-foreground">{step.timestamp}</p>
            <p className="text-xs text-muted-foreground">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

const ContractInformationPanel = () => {
  const [uploadedFile] = useState({ name: "Signed_Contract_CNT-000241.pdf", size: "2.45 MB" })
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-base font-semibold">Contract Information</h2>

      <Card>
        <CardContent className="grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div className="flex min-w-0 gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileTextIcon className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Contract No.</p>
                <p className="text-sm font-semibold">CNT-000241</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge className="mt-0.5 bg-primary/10 text-primary hover:bg-primary/10" variant="secondary">
                  SENT
                </Badge>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Generated On</p>
                <p className="text-sm font-medium">May 14, 2024 09:45 AM</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sent On</p>
                <p className="text-sm font-medium">May 14, 2024 10:20 AM</p>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Sent To</p>
                <p className="break-words text-sm font-medium">juma.said@example.com</p>
              </div>
              <Button size="sm" className="w-fit gap-1.5">
                <CheckIcon className="size-4" />
                Confirm Sent
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:pl-4 lg:border-l">
            <p className="text-sm font-semibold">Contract Preview</p>
            <p className="text-xs text-muted-foreground">
              Preview the contract before sending or after it has been signed.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 bg-white" onClick={() => setPreviewOpen(true)}>
                <EyeIcon className="size-4" />
                Preview Contract
              </Button>
              {/* <Button variant="outline" size="sm" className="gap-1.5 bg-white">
                <PencilIcon className="size-4" />
                Edit
              </Button> */}
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:pl-4 lg:border-l">
            <p className="text-sm font-semibold">Quick Links</p>
            <button className="flex items-center gap-2 text-left text-sm text-primary hover:underline">
              <DownloadIcon className="size-4" />
              Download Contract (PDF)
            </button>
            <div className="flex flex-col gap-0.5">
              <button className="flex items-center gap-2 text-left text-sm text-primary hover:underline">
                <ShieldCheckIcon className="size-4" />
                Verify Contract
              </button>
              <p className="pl-6 text-xs text-muted-foreground">Check authenticity</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold">Upload Signed Contract</p>
            <p className="text-xs text-muted-foreground">
              Upload the physically signed contract returned by the applicant.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/40 bg-background px-6 py-10 text-center transition-colors hover:bg-primary/5">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
              <UploadCloudIcon className="size-6 text-primary" />
              <p className="text-sm font-medium">Drag & drop file here or click to browse</p>
              <p className="text-xs text-muted-foreground">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
            </label>

            <div className="rounded-lg border bg-background p-4">
              <p className="mb-2 text-sm font-semibold">Requirements</p>
              <ul className="flex flex-col gap-1.5">
                {requirements.map((req) => (
                  <li key={req} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-3 rounded-lg border bg-background p-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <FileIcon className="size-5 text-primary" />
              <div className="flex flex-col">
                <p className="text-sm font-medium">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">PDF • {uploadedFile.size}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon-sm">
                <XIcon className="size-4" />
              </Button>
              <Button className="gap-1.5">
                <CheckIcon className="size-4" />
                Confirm Signed Contract
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex h-[90vh] w-[95vw] max-w-none sm:max-w-none flex-col p-0">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Contract Preview — CNT-000241</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {previewOpen && (
              <PDFViewer style={{ width: "100%", height: "100%", border: "none" }}>
                <LoanContractDocument data={sampleContractData} />
              </PDFViewer>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const LoanContract = () => {
  return (
    <Card className="overflow-hidden py-0">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        <div className="border-b lg:border-b-0 lg:border-r">
          <ContractWorkflowSidebar />
        </div>
        <ContractInformationPanel />
      </div>
    </Card>
  )
}

export default LoanContract