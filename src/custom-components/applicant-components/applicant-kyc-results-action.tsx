import { DownloadIcon, ArrowRightIcon } from "lucide-react"
import { pdf } from "@react-pdf/renderer"
import { Button } from "../../components/ui/button"
import KycReportDocument, { type KycReportData } from "../reports/kyc-verification-report-template"

const sampleReportData: KycReportData = {
  reportId: "KYC-2024-005678",
  generatedOn: "May 14, 2024 10:25 AM",
  generatedBy: "Amina Mohamed (Admin)",
  applicant: {
    name: "Juma Ali Said",
    applicationId: "APP-2024-005678",
    kycReferenceNo: "KYC-2024-005678",
    dateOfBirth: "May 14, 1990",
    gender: "Male",
    phone: "+255 712 345 678",
    email: "juma.said@example.com",
    address: "Mikocheni, Biafra Road, House No. 123, Dar es Salaam, Tanzania",
    nationality: "Tanzanian",
    occupation: "Business Owner",
    maritalStatus: "Married",
  },
  progress: [
    { step: "Personal Details", status: "Completed", result: "Passed" },
    { step: "ID & Documents", status: "Completed", result: "Passed" },
    { step: "NIDA / TIN Verification", status: "Completed", result: "Passed" },
    { step: "OTP Verification", status: "Completed", result: "Passed" },
    { step: "KYC Result", status: "Completed", result: "Passed" },
  ],
  identificationDocuments: [
    { type: "National ID (NIDA) - Front", status: "Verified" },
    { type: "National ID (NIDA) - Back", status: "Verified" },
    { type: "Passport (Additional)", status: "Verified" },
  ],
  nidaTin: {
    nidaNumber: "19901234-12345-6-7890",
    tinNumber: "123-456-789",
    verificationMethod: "Manual Review",
    verificationNotes: "Manual verification performed by staff. Documents attached as evidence.",
  },
  otp: {
    channel: "Phone (+255 712 345 678)",
    sentOn: "May 14, 2024 09:50 AM",
    verifiedOn: "May 14, 2024 09:52 AM",
    status: "Verified",
  },
  watchlist: [
    { type: "Sanctions List", result: "No Match Found", checkedOn: "May 14, 2024 09:53 AM" },
    { type: "PEP (Politically Exposed Person)", result: "No Match Found", checkedOn: "May 14, 2024 09:53 AM" },
    { type: "Adverse Media", result: "No Match Found", checkedOn: "May 14, 2024 09:53 AM" },
  ],
  finalResult: {
    overallStatus: "VERIFIED",
    result: "KYC verification completed successfully.",
    remarks: "All provided information and documents have been verified. Applicant is eligible to proceed with loan application.",
    expiryDate: "May 14, 2025",
  },
  verifiedBy: {
    name: "Amina Mohamed (Admin)",
    role: "Loan Management System",
  },
}

type KycResultActionsBarProps = {
  onBack: () => void
  onContinueToLoanApplication: () => void
}

const KycResultActionsBar = ({ onBack, onContinueToLoanApplication }: KycResultActionsBarProps) => {
  const handleDownloadReport = async () => {
    const blob = await pdf(<KycReportDocument data={sampleReportData} />).toBlob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${sampleReportData.reportId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" onClick={onBack}>
        Back
      </Button>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={handleDownloadReport}>
          <DownloadIcon className="size-4" />
          Download KYC Report
        </Button>
        <Button onClick={onContinueToLoanApplication}>
          Continue to Loan Application
          <ArrowRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export default KycResultActionsBar