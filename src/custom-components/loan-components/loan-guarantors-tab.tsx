import LoanGuarantorsTable from "./loan-guarantors-table"

const LoanGuarantorsTab = () => {
  return (
    <div className="flex flex-col gap-4">
      <LoanGuarantorsTable
        guarantors={[
          {
            id: "1",
            guarantorId: "1987654321090",
            fullName: "Salum Khamis",
            tag: "Primary",
            relationship: "Brother",
            phone: "+255 713 000 111",
            email: "salum.khamis@example.com",
            employmentType: "Self Employed",
            occupation: "Businessman",
            income: "TZS 2,500,000",
            guaranteeAmount: "TZS 2,500,000",
            guaranteePercent: "50%",
            status: "Approved",
            approvalLevel: "Level 1",
            submittedOn: "May 10, 2024",
            submittedTime: "09:20 AM",
            isoSubmittedOn: "2024-05-10",
          },
          {
            id: "2",
            guarantorId: "1676543210987",
            fullName: "Mohammed Hassan",
            tag: "Secondary",
            relationship: "Friend",
            phone: "+255 712 345 678",
            email: "mohammed.h@example.com",
            employmentType: "Employed",
            occupation: "Bank Officer",
            income: "TZS 2,200,000",
            guaranteeAmount: "TZS 2,200,000",
            guaranteePercent: "50%",
            status: "Approved",
            approvalLevel: "Level 1",
            submittedOn: "May 11, 2024",
            submittedTime: "10:12 AM",
            isoSubmittedOn: "2024-05-11",
          },
        ]}
        onAddGuarantor={() => console.log("add guarantor")}
      />
    </div>
  )
}

export default LoanGuarantorsTab