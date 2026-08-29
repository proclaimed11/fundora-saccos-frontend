import LoanDocumentsTable from "./loan-contracts-documents-table"
import LoanApplicationStepper from "../operations-components/loan-application-step"

const LoanApplicationStatusTab = () => {
  return (
    <div className="flex flex-col gap-4">
      <LoanApplicationStepper currentStep={3} />
      <LoanDocumentsTable
        onView={(doc) => console.log("view", doc)}
        onDownload={(doc) => console.log("download", doc)}
        onDelete={(doc) => console.log("delete", doc)}
      />
    </div>
  )
}

export default LoanApplicationStatusTab