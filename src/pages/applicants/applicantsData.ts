import dayjs from 'dayjs'

export type ApplicantStatus = 'PENDING_OTP' | 'PENDING_KYC' | 'KYC_APPROVED' | 'REJECTED'

export type Applicant = {
  id: number
  applicantNo: string
  name: string
  phone: string
  email: string
  occupation: string
  location: string
  nationality: string
  status: ApplicantStatus
  isReturning: boolean
  registered: string // ISO date, so the date filter and sorting work
}

// SAMPLE ONLY: replaced with database data later
export const applicants: Applicant[] = [
  { id: 1, applicantNo: 'APP-1786436767272', name: 'John Doe', phone: '0700000000', email: 'john@example.com', occupation: 'Software Engineer', location: 'Dar es Salaam City Center', nationality: 'Tanzanian', status: 'KYC_APPROVED', isReturning: false, registered: '2026-08-11' },
  { id: 2, applicantNo: 'APP-1786436767301', name: 'Amina Juma', phone: '0712345678', email: 'amina@example.com', occupation: 'Trader', location: 'Kariakoo', nationality: 'Tanzanian', status: 'PENDING_KYC', isReturning: true, registered: '2026-09-02' },
  { id: 3, applicantNo: 'APP-1786436767455', name: 'Peter Mwakyusa', phone: '0755111222', email: 'peter@example.com', occupation: 'Teacher', location: 'Mbeya', nationality: 'Tanzanian', status: 'PENDING_OTP', isReturning: false, registered: '2026-09-14' },
  { id: 4, applicantNo: 'APP-1786436767512', name: 'Grace Mushi', phone: '0766333444', email: 'grace@example.com', occupation: 'Nurse', location: 'Arusha', nationality: 'Tanzanian', status: 'REJECTED', isReturning: false, registered: '2026-09-20' },
  { id: 5, applicantNo: 'APP-1786436767690', name: 'Hassan Said', phone: '0688555666', email: 'hassan@example.com', occupation: 'Driver', location: 'Dodoma', nationality: 'Tanzanian', status: 'KYC_APPROVED', isReturning: true, registered: '2026-09-28' },
  { id: 6, applicantNo: 'APP-1786436767744', name: 'Neema Kileo', phone: '0654777888', email: 'neema@example.com', occupation: 'Shop Owner', location: 'Moshi', nationality: 'Tanzanian', status: 'PENDING_KYC', isReturning: false, registered: '2026-10-01' },
]

export const STATUS: Record<ApplicantStatus, { label: string; color: string; step: number }> = {
  PENDING_OTP: { label: 'Pending OTP', color: 'gray', step: 1 },
  PENDING_KYC: { label: 'Pending KYC', color: 'yellow', step: 2 },
  KYC_APPROVED: { label: 'KYC Approved', color: 'green', step: 3 },
  REJECTED: { label: 'Rejected', color: 'red', step: 2 },
}

// which buttons show for each stage (display only)
export function stageActions(a: Applicant): { label: string; icon: string }[] {
  const list: { label: string; icon: string }[] = []
  if (a.status === 'PENDING_OTP') list.push({ label: 'Send OTP', icon: 'mail' })
  if (a.status === 'PENDING_KYC') list.push({ label: 'Review KYC', icon: 'contact-round' })
  if (a.isReturning && a.status !== 'REJECTED') list.push({ label: 'Re-check KYC', icon: 'refresh-cw' })
  if (a.status === 'KYC_APPROVED') list.push({ label: 'Start loan application', icon: 'file-text' })
  return list
}

export const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

/* ---------- SAMPLE ONLY: profile extras, replaced by API data later ---------- */

export type ActivityEvent = { title: string; detail: string; date: string; icon: string }

// newest first, built from the applicant's stage so it always matches the status
export function activityFor(a: Applicant): ActivityEvent[] {
  const day = (n: number) => dayjs(a.registered).add(n, 'day').format('YYYY-MM-DD')
  const events: ActivityEvent[] = [
    { title: 'Applicant registered', detail: `Application number ${a.applicantNo}`, date: a.registered, icon: 'user-round-plus' },
  ]
  if (a.status !== 'PENDING_OTP') {
    events.push({ title: 'OTP verified', detail: 'Verified by email', date: a.registered, icon: 'shield' })
  }
  if (a.status === 'KYC_APPROVED') {
    events.push({ title: 'KYC approved', detail: 'Approved by Loan Officer', date: day(1), icon: 'circle-check' })
  }
  if (a.status === 'REJECTED') {
    events.push({ title: 'KYC rejected', detail: 'Documents did not pass review', date: day(1), icon: 'circle-x' })
  }
  return events.reverse()
}

export type LoanRow = {
  id: number
  ref: string
  product: string
  amount: number
  outstanding: number
  status: 'Active' | 'Under review'
  date: string
}

// only approved applicants have loans or applications in this sample
export function loansFor(a: Applicant): LoanRow[] {
  if (a.status !== 'KYC_APPROVED') return []
  return [
    { id: 1, ref: 'LN-0001', product: 'Personal loan', amount: 1500000, outstanding: 1200000, status: 'Active', date: '2026-08-20' },
    { id: 2, ref: 'APP-0042', product: 'Business loan', amount: 3000000, outstanding: 0, status: 'Under review', date: '2026-09-30' },
  ]
}

// SAMPLE ONLY: NIDA number comes from the KYC record later
export const nidaFor = (a: Applicant) => `NIDA${String(a.id).padStart(6, '0')}`