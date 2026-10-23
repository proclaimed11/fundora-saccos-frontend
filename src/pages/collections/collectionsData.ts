import { LOANS, SAMPLE_PAYMENTS, SAMPLE_PENALTIES, viewOf } from '../loans/loanApplicationsData'

export type CaseStatus = 'OPEN' | 'CLOSED' | 'ESCALATED'

export const CASE_STATUS: Record<CaseStatus, { label: string; color: string }> = {
  OPEN: { label: 'Open', color: 'blue' },
  CLOSED: { label: 'Closed', color: 'gray' },
  ESCALATED: { label: 'Escalated', color: 'orange' },
}

export type CollectionCase = {
  id: number
  caseNo: string
  loanId: number
  status: CaseStatus
  assignedTo: string // the API takes a user id, joined to a name later
  opened: string // ISO date
  closed: string | null
  remarks: string
  closeRemarks: string | null
}

// the API example only shows PHONE_CALL and PROMISED_TO_PAY, the other options are our assumption
export type ActivityType = 'PHONE_CALL' | 'SMS' | 'VISIT' | 'EMAIL'

export const ACTIVITY_LABEL: Record<ActivityType, string> = {
  PHONE_CALL: 'Phone call',
  SMS: 'SMS',
  VISIT: 'Visit',
  EMAIL: 'Email',
}

export const ACTIVITY_ICON: Record<ActivityType, string> = {
  PHONE_CALL: 'phone',
  SMS: 'send',
  VISIT: 'user-round',
  EMAIL: 'mail',
}

export type ActivityOutcome = 'PROMISED_TO_PAY' | 'NO_RESPONSE' | 'REFUSED' | 'EXTENSION_REQUESTED' | 'PAID'

export const OUTCOME: Record<ActivityOutcome, { label: string; color: string }> = {
  PROMISED_TO_PAY: { label: 'Promised to pay', color: 'blue' },
  NO_RESPONSE: { label: 'No response', color: 'gray' },
  REFUSED: { label: 'Refused to pay', color: 'red' },
  EXTENSION_REQUESTED: { label: 'Asked for more time', color: 'yellow' },
  PAID: { label: 'Says it was paid', color: 'green' },
}

export type CollectionActivity = {
  id: number
  caseId: number
  type: ActivityType
  description: string
  outcome: ActivityOutcome
  performedBy: string
  date: string // ISO date
}

// SAMPLE ONLY: collectors come from the users API later
export const COLLECTORS = ['Asha Mrema', 'Juma Bakari']

// our own rule, the API has no deadline: an open case with no contact for this long is flagged
export const STALE_AFTER_DAYS = 7

export const caseNoFor = (id: number) => `CC-${String(id).padStart(4, '0')}`

// SAMPLE ONLY: replaced by GET /api/loans and the balance endpoint later
export const LOAN_VIEWS = LOANS.map((l) => viewOf(l, SAMPLE_PAYMENTS, SAMPLE_PENALTIES))

// SAMPLE ONLY: replaced with database data later.
// LN-0006 is overdue with no open case on purpose, so the Open case step can be tried
// (the daily job at 07:15 UTC normally opens it on its own).
export const SAMPLE_CASES: CollectionCase[] = [
  { id: 1, caseNo: caseNoFor(1), loanId: 5, status: 'OPEN', assignedTo: 'Juma Bakari', opened: '2026-07-06', closed: null, remarks: 'Opened by the daily job', closeRemarks: null },
  { id: 2, caseNo: caseNoFor(2), loanId: 7, status: 'OPEN', assignedTo: 'Asha Mrema', opened: '2026-10-09', closed: null, remarks: 'Opened by the daily job', closeRemarks: null },
  { id: 3, caseNo: caseNoFor(3), loanId: 5, status: 'CLOSED', assignedTo: 'Juma Bakari', opened: '2026-05-06', closed: '2026-05-06', remarks: 'Opened by the daily job', closeRemarks: 'Borrower paid the same day' },
]

export const SAMPLE_ACTIVITIES: CollectionActivity[] = [
  { id: 1, caseId: 1, type: 'PHONE_CALL', outcome: 'NO_RESPONSE', description: 'Called twice, no answer', performedBy: 'Juma Bakari', date: '2026-07-07' },
  { id: 2, caseId: 1, type: 'SMS', outcome: 'NO_RESPONSE', description: 'Reminder sent about the overdue installment', performedBy: 'Juma Bakari', date: '2026-07-09' },
  { id: 3, caseId: 1, type: 'VISIT', outcome: 'NO_RESPONSE', description: 'Visited the home, the borrower was travelling', performedBy: 'Juma Bakari', date: '2026-07-15' },
  { id: 4, caseId: 1, type: 'PHONE_CALL', outcome: 'PROMISED_TO_PAY', description: 'Promised to pay by the end of the month', performedBy: 'Juma Bakari', date: '2026-08-03' },
  { id: 5, caseId: 1, type: 'PHONE_CALL', outcome: 'NO_RESPONSE', description: 'The promise was missed and the phone was off', performedBy: 'Juma Bakari', date: '2026-09-02' },
  { id: 6, caseId: 1, type: 'VISIT', outcome: 'REFUSED', description: 'Says the business is closed and cannot pay now', performedBy: 'Juma Bakari', date: '2026-09-24' },
  { id: 7, caseId: 2, type: 'SMS', outcome: 'NO_RESPONSE', description: 'Reminder sent', performedBy: 'Asha Mrema', date: '2026-10-10' },
  { id: 8, caseId: 2, type: 'PHONE_CALL', outcome: 'PROMISED_TO_PAY', description: 'Salary was delayed, will pay by 25 October', performedBy: 'Asha Mrema', date: '2026-10-20' },
  { id: 9, caseId: 3, type: 'PHONE_CALL', outcome: 'PAID', description: 'Borrower paid after the reminder call', performedBy: 'Juma Bakari', date: '2026-05-06' },
]