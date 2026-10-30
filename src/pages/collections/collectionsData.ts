import { LOANS, SAMPLE_PAYMENTS, SAMPLE_PENALTIES, viewOf, type NplClass } from '../loans/loanApplicationsData'


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

/* ---------- recovery cases ---------- */

export type RecoveryStatus = 'OPEN' | 'CLOSED'

export const RECOVERY_STATUS: Record<RecoveryStatus, { label: string; color: string }> = {
  OPEN: { label: 'Open', color: 'orange' },
  CLOSED: { label: 'Closed', color: 'gray' },
}

export type RecoveryCase = {
  id: number
  caseNo: string
  loanId: number
  sourceCaseId: number | null // the collection case it was escalated from
  status: RecoveryStatus
  assignedTo: string // the API takes a user id, joined to a name later
  opened: string // ISO date
  closed: string | null
  remarks: string
  closeRemarks: string | null
}

// the API example shows LEGAL_NOTICE, asset seizure and negotiated settlement as examples,
// the other options are our assumption
export type RecoveryActionType =
  | 'LEGAL_NOTICE'
  | 'COURT_FILING'
  | 'ASSET_SEIZURE'
  | 'NEGOTIATED_SETTLEMENT'
  | 'OTHER'

export const RECOVERY_ACTION_LABEL: Record<RecoveryActionType, string> = {
  LEGAL_NOTICE: 'Legal notice',
  COURT_FILING: 'Court filing',
  ASSET_SEIZURE: 'Asset seizure',
  NEGOTIATED_SETTLEMENT: 'Negotiated settlement',
  OTHER: 'Other',
}

export const RECOVERY_ACTION_ICON: Record<RecoveryActionType, string> = {
  LEGAL_NOTICE: 'file-text',
  COURT_FILING: 'scale',
  ASSET_SEIZURE: 'shield',
  NEGOTIATED_SETTLEMENT: 'hand-coins',
  OTHER: 'clipboard',
}

export type RecoveryAction = {
  id: number
  recoveryCaseId: number
  type: RecoveryActionType
  description: string
  amount: number // 0 when the action has no amount
  documentName: string | null // uploaded file name
  /** the uploaded file, only kept for this session */
  file?: File | null
  performedBy: string
  date: string // ISO date
}

// a loan written off in this session, the real record comes from POST .../write-off
export type WriteOffRecord = {
  loanId: number
  amount: number
  reason: string
  approvedBy: string
  date: string
}

// our own rule, the API has no deadline: an open recovery case with no action for this long is flagged
export const RECOVERY_STALE_AFTER_DAYS = 14

export const recoveryNoFor = (id: number) => `RC-${String(id).padStart(4, '0')}`

// SAMPLE ONLY: replaced with database data later.
// LN-0005 is the only non-performing loan in the sample loans.
export const SAMPLE_RECOVERY_CASES: RecoveryCase[] = [
  { id: 1, caseNo: recoveryNoFor(1), loanId: 5, sourceCaseId: 1, status: 'OPEN', assignedTo: 'Juma Bakari', opened: '2026-10-05', closed: null, remarks: 'Handed to the legal team', closeRemarks: null },
]

export const SAMPLE_RECOVERY_ACTIONS: RecoveryAction[] = [
  { id: 1, recoveryCaseId: 1, type: 'LEGAL_NOTICE', description: 'Demand letter sent by courier', amount: 0, documentName: 'demand-letter-ln-0005.pdf', performedBy: 'Juma Bakari', date: '2026-10-08' },
  { id: 2, recoveryCaseId: 1, type: 'NEGOTIATED_SETTLEMENT', description: 'Borrower offered to settle in two parts, nothing received yet', amount: 1200000, documentName: null, performedBy: 'Juma Bakari', date: '2026-10-15' },
]

/* ---------- NPL and write-offs ---------- */

// one written-off loan, as shown in the write-off history
export type WriteOffEntry = {
  id: number
  loanId: number | null // null when the loan is not in the sample loans
  applicantId: number | null
  loanNo: string
  borrower: string
  principal: number
  interest: number
  penalty: number
  amount: number // principal + interest + penalty
  overdueDays: number // when it was written off
  classification: NplClass // when it was written off
  reason: string
  approvedBy: string
  date: string // ISO date
}

// SAMPLE ONLY: replaced with database data later
export const SAMPLE_WRITE_OFFS: WriteOffEntry[] = [
  { id: 1, loanId: null, applicantId: 4, loanNo: 'LN-0002', borrower: 'Grace Mushi', principal: 620000, interest: 180000, penalty: 50000, amount: 850000, overdueDays: 214, classification: 'LOSS', reason: 'Borrower untraceable after 200 days overdue', approvedBy: 'Admin User', date: '2026-08-20' },
  { id: 2, loanId: null, applicantId: 3, loanNo: 'LN-0004', borrower: 'Peter Mwakyusa', principal: 1000000, interest: 330000, penalty: 70000, amount: 1400000, overdueDays: 150, classification: 'DOUBTFUL', reason: 'Business closed and there are no assets to recover', approvedBy: 'Juma Bakari', date: '2026-09-12' },
]