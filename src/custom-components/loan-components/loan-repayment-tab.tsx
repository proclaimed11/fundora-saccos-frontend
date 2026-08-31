import LoanRepaymentScheduleTable from "./loan-repayment-schedule-table"
import LoanRepaymentTransactionsTable from "./loan-repayment-table"
import SummaryStatusCard from "../summary-status-card"
import type { FlatSummaryWidget } from "../flat-summary-card"
import { useEffect, useState } from "react"

const LoanRepaymentHistoryTab = () => {
  const paymentSummaryData = {
    totalAmount: "TZS 2,500,000",
    amountPaid: "TZS 1,250,000",
    amountOutstanding: "TZS 1,250,000",
    paymentsMade: 6,
    totalPayments: 12,
  }

  const [isLoadingWidget, setIsLoadingWidget] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingWidget(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const paymentWidgets: FlatSummaryWidget[] = [
    { key: "totalAmount", label: "Total Amount", value: paymentSummaryData.totalAmount },
    { key: "amountPaid", label: "Amount Paid", value: paymentSummaryData.amountPaid },
    { key: "amountOutstanding", label: "Amount Outstanding", value: paymentSummaryData.amountOutstanding },
    {
      key: "paymentsMade",
      label: "Payments Made",
      value: `${paymentSummaryData.paymentsMade} / ${paymentSummaryData.totalPayments}`,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <SummaryStatusCard title="Payment Summary" widgets={paymentWidgets} isLoading={isLoadingWidget} />

      <LoanRepaymentTransactionsTable
        transactions={[
          { id: "1", date: "May 14, 2024", isoDate: "2024-05-14", type: "Mobile Payment", typeValue: "mobile_payment", amount: "TZS 250,000", principal: "TZS 200,000", interest: "TZS 50,000", balance: "TZS 1,250,000", status: "Received", reference: "MP-7842" },
          { id: "2", date: "Apr 25, 2024", isoDate: "2024-04-25", type: "Mobile Payment", typeValue: "mobile_payment", amount: "TZS 250,000", principal: "TZS 200,000", interest: "TZS 50,000", balance: "TZS 1,500,000", status: "Received", reference: "MP-7631" },
          { id: "3", date: "Mar 25, 2024", isoDate: "2024-03-25", type: "Mobile Payment", typeValue: "mobile_payment", amount: "TZS 250,000", principal: "TZS 200,000", interest: "TZS 50,000", balance: "TZS 1,750,000", status: "Received", reference: "MP-7412" },
          { id: "4", date: "Feb 25, 2024", isoDate: "2024-02-25", type: "Mobile Payment", typeValue: "mobile_payment", amount: "TZS 250,000", principal: "TZS 200,000", interest: "TZS 50,000", balance: "TZS 2,000,000", status: "Received", reference: "MP-7284" },
          { id: "5", date: "Jan 25, 2024", isoDate: "2024-01-25", type: "Mobile Payment", typeValue: "mobile_payment", amount: "TZS 250,000", principal: "TZS 200,000", interest: "TZS 50,000", balance: "TZS 2,250,000", status: "Received", reference: "MP-7123" },
          { id: "6", date: "Dec 25, 2023", isoDate: "2023-12-25", type: "Mobile Payment", typeValue: "mobile_payment", amount: "TZS 250,000", principal: "TZS 250,000", interest: "TZS 50,000", balance: "TZS 2,500,000", status: "Received", reference: "MP-6981" },
        ]}
      />

      <LoanRepaymentScheduleTable
        principalAmount="TZS 1,000,000"
        totalScheduledAmount="TZS 1,071,154.86"
        isLoadingWidget={isLoadingWidget}
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

export default LoanRepaymentHistoryTab