import LoanDocumentsTable from "./loan-contracts-documents-table"

const LoanContractsDocumentsTab = () => {
  return (
    <div className="flex flex-col gap-4">
      <LoanDocumentsTable
        onView={(doc) => console.log("view", doc)}
        onDownload={(doc) => console.log("download", doc)}
        onDelete={(doc) => console.log("delete", doc)}
      />
    </div>
  )
}

export default LoanContractsDocumentsTab