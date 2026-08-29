import LoanRepaymentScheduleTable from "./loan-repayment-schedule-table"

const LoanApplicationRepaymentSchedule = () => {
  return (
    <div className="flex flex-col gap-4">
      <LoanRepaymentScheduleTable
        principalAmount="TZS 1,000,000"
        totalScheduledAmount="TZS 1,071,154.86"
        schedule={[
          { id: "1", installmentNo: 1, dueDate: "Sep 11, 2026", principalDue: "TZS 158,477.86", interestDue: "TZS 20,000.00", totalDue: "TZS 178,477.86", outstandingAmount: "TZS 0.00", status: "PAID" },
          { id: "2", installmentNo: 2, dueDate: "Oct 11, 2026", principalDue: "TZS 161,647.42", interestDue: "TZS 16,830.44", totalDue: "TZS 178,477.86", outstandingAmount: "TZS 178,477.86", status: "OVERDUE" },
          { id: "3", installmentNo: 3, dueDate: "Nov 11, 2026", principalDue: "TZS 164,880.37", interestDue: "TZS 13,597.49", totalDue: "TZS 178,477.86", outstandingAmount: "TZS 178,477.86", status: "PENDING" },
          { id: "4", installmentNo: 4, dueDate: "Dec 11, 2026", principalDue: "TZS 168,177.98", interestDue: "TZS 10,299.88", totalDue: "TZS 178,477.86", outstandingAmount: "TZS 178,477.86", status: "PENDING" },
          { id: "5", installmentNo: 5, dueDate: "Jan 11, 2027", principalDue: "TZS 171,541.54", interestDue: "TZS 6,936.32", totalDue: "TZS 178,477.86", outstandingAmount: "TZS 178,477.86", status: "PENDING" },
          { id: "6", installmentNo: 6, dueDate: "Feb 11, 2027", principalDue: "TZS 174,972.83", interestDue: "TZS 3,505.03", totalDue: "TZS 178,477.86", outstandingAmount: "TZS 178,477.86", status: "PENDING" },
        ]}
      />
    </div>
  )
}

export default LoanApplicationRepaymentSchedule