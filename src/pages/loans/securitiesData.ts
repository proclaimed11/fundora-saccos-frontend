import {
  LOANS,
  SAMPLE_PAYMENTS,
  SAMPLE_PENALTIES,
  applications,
  collateralsFor,
  guarantorsFor,
  viewOf,
  type ApplicationStatus,
  type LoanApplication,
  type LoanState,
} from './loanApplicationsData'

// our own rule, the API sets no limit: a guarantor above this is flagged
export const MAX_GUARANTOR_EXPOSURE = 15000000

// a stopped application no longer needs its security
const stopped = (a: LoanApplication) => a.status === 'REJECTED' || a.status === 'CANCELLED'

// the loan created from an application, and what state it is in
function linkOf(a: LoanApplication) {
  const loan = LOANS.find((l) => l.applicationId === a.id)
  return loan ? { loan, state: viewOf(loan, SAMPLE_PAYMENTS, SAMPLE_PENALTIES).state } : null
}

/* ---------- collateral ---------- */

export type AssetRow = {
  id: string // application id and asset id, so the table has a unique key
  applicationId: number
  applicationNo: string
  applicantId: number
  applicantName: string
  type: string
  description: string
  value: number
  document: string | null
  verified: boolean
  loanAmount: number
  loanId: number | null
  loanNo: string
  loanState: LoanState | null
  /** the loan is repaid or the application was stopped, so the asset can go back to the borrower */
  releasable: boolean
  releaseReason: string
}

// SAMPLE ONLY: built from the sample applications, replaced by GET /api/collaterals later
export const ASSET_ROWS: AssetRow[] = applications.flatMap((a) => {
  const link = linkOf(a)
  const closed = link?.state === 'CLOSED'

  return collateralsFor(a).map((c) => ({
    id: `${a.id}-${c.id}`,
    applicationId: a.id,
    applicationNo: a.applicationNo,
    applicantId: a.applicantId,
    applicantName: a.applicantName,
    type: c.type,
    description: c.description,
    value: c.value,
    document: c.document,
    verified: c.status === 'VERIFIED',
    loanAmount: a.requestedAmount,
    loanId: link?.loan.id ?? null,
    loanNo: link?.loan.loanNo ?? '',
    loanState: link?.state ?? null,
    releasable: closed || stopped(a),
    releaseReason: closed ? 'The loan is fully repaid' : stopped(a) ? 'The application was stopped' : '',
  }))
})

/* ---------- guarantors ---------- */

export type Guaranteed = {
  applicationId: number
  applicationNo: string
  borrower: string
  borrowerId: number
  amount: number
  relationship: string
  status: ApplicationStatus
  loanNo: string
  /** still counts toward the guarantor's exposure */
  live: boolean
  verified: boolean
}

export type GuarantorRow = {
  id: string
  name: string
  phone: string
  guaranteed: Guaranteed[]
  liveCount: number
  exposure: number
  overLimit: boolean
}

// SAMPLE ONLY: guarantors are matched by name here, replaced by GET /api/guarantor-liabilities later
function buildGuarantorRows(): GuarantorRow[] {
  const map = new Map<string, GuarantorRow>()

  applications.forEach((a) => {
    const link = linkOf(a)
    const live = !stopped(a) && link?.state !== 'CLOSED'

    guarantorsFor(a).forEach((g) => {
      const row =
        map.get(g.name) ??
        ({
          id: g.name.toLowerCase().replace(/\s+/g, '-'),
          name: g.name,
          phone: g.phone,
          guaranteed: [],
          liveCount: 0,
          exposure: 0,
          overLimit: false,
        } as GuarantorRow)

      row.guaranteed.push({
        applicationId: a.id,
        applicationNo: a.applicationNo,
        borrower: a.applicantName,
        borrowerId: a.applicantId,
        amount: a.requestedAmount,
        relationship: g.relationship,
        status: a.status,
        loanNo: link?.loan.loanNo ?? '',
        live,
        verified: g.status === 'VERIFIED',
      })
      map.set(g.name, row)
    })
  })

  return [...map.values()].map((r) => {
    const live = r.guaranteed.filter((x) => x.live)
    const exposure = live.reduce((s, x) => s + x.amount, 0)
    return { ...r, liveCount: live.length, exposure, overLimit: exposure > MAX_GUARANTOR_EXPOSURE }
  })
}

export const GUARANTOR_ROWS: GuarantorRow[] = buildGuarantorRows()