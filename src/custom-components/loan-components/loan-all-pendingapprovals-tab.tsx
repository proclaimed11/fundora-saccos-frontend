import PendingApprovalsTable, { type PendingApproval } from "./loan-pending-approvals-table"
import { awaitingMyApprovalData } from "./loan-awaiting-myapprovals-tab"

const otherPendingData: PendingApproval[] = [
  { id: "13", applicationId: "LA-0000283", applicantName: "Rehema Omari Ndosi", loanType: "Business Loan", loanTypeValue: "business_loan", requestedAmount: "45,000,000", applicationDate: "May 13, 2024 09:20 AM", isoApplicationDate: "2024-05-13", loanOfficerName: "Herman Mushi", approvalStepLabel: "Manager Approval", approvalStepNumber: 2, approvalStepTotal: 3, statusValue: "PENDING_APPROVAL" },
  { id: "14", applicationId: "LA-0000286", applicantName: "Baraka Emmanuel Swai", loanType: "Personal Loan", loanTypeValue: "personal_loan", requestedAmount: "10,000,000", applicationDate: "May 13, 2024 10:05 AM", isoApplicationDate: "2024-05-13", loanOfficerName: "Salma Khamis", approvalStepLabel: "Manager Approval", approvalStepNumber: 2, approvalStepTotal: 3, statusValue: "PENDING_APPROVAL" },
  { id: "15", applicationId: "LA-0000290", applicantName: "Latifa Rashid Juma", loanType: "Emergency Loan", loanTypeValue: "emergency_loan", requestedAmount: "6,500,000", applicationDate: "May 12, 2024 08:45 AM", isoApplicationDate: "2024-05-12", loanOfficerName: "Abdul Karim", approvalStepLabel: "Committee Review", approvalStepNumber: 3, approvalStepTotal: 3, statusValue: "PENDING_APPROVAL" },
  { id: "16", applicationId: "LA-0000294", applicantName: "Deo Charles Mbwana", loanType: "Business Loan", loanTypeValue: "business_loan", requestedAmount: "70,000,000", applicationDate: "May 12, 2024 01:30 PM", isoApplicationDate: "2024-05-12", loanOfficerName: "Neema Lucas", approvalStepLabel: "Committee Review", approvalStepNumber: 3, approvalStepTotal: 3, statusValue: "PENDING_APPROVAL" },
  { id: "17", applicationId: "LA-0000298", applicantName: "Furaha Method Kessy", loanType: "Personal Loan", loanTypeValue: "personal_loan", requestedAmount: "13,200,000", applicationDate: "May 11, 2024 03:10 PM", isoApplicationDate: "2024-05-11", loanOfficerName: "Herman Mushi", approvalStepLabel: "Manager Approval", approvalStepNumber: 2, approvalStepTotal: 3, statusValue: "PENDING_APPROVAL" },
  { id: "18", applicationId: "LA-0000302", applicantName: "Godfrey Peter Massawe", loanType: "Business Loan", loanTypeValue: "business_loan", requestedAmount: "55,000,000", applicationDate: "May 11, 2024 04:25 PM", isoApplicationDate: "2024-05-11", loanOfficerName: "Abdul Karim", approvalStepLabel: "Manager Approval", approvalStepNumber: 2, approvalStepTotal: 3, statusValue: "PENDING_APPROVAL" },
  { id: "19", applicationId: "LA-0000307", applicantName: "Consolata Edward Shirima", loanType: "Personal Loan", loanTypeValue: "personal_loan", requestedAmount: "9,800,000", applicationDate: "May 10, 2024 11:00 AM", isoApplicationDate: "2024-05-10", loanOfficerName: "Salma Khamis", approvalStepLabel: "Committee Review", approvalStepNumber: 3, approvalStepTotal: 3, statusValue: "PENDING_APPROVAL" },
  { id: "20", applicationId: "LA-0000311", applicantName: "Erasto Wilson Mchome", loanType: "Emergency Loan", loanTypeValue: "emergency_loan", requestedAmount: "5,000,000", applicationDate: "May 10, 2024 02:50 PM", isoApplicationDate: "2024-05-10", loanOfficerName: "Neema Lucas", approvalStepLabel: "Manager Approval", approvalStepNumber: 2, approvalStepTotal: 3, statusValue: "PENDING_APPROVAL" },
]

const allPendingApprovalsData: PendingApproval[] = [...awaitingMyApprovalData, ...otherPendingData]

const AllPendingApprovalsTable = () => {
  return <PendingApprovalsTable approvals={allPendingApprovalsData} searchPlaceholder="Search by applicant name, application ID, or officer..." />
}

export default AllPendingApprovalsTable
export { allPendingApprovalsData }