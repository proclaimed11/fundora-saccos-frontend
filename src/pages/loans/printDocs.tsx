import dayjs from 'dayjs'
import { formatTzs } from '../../utils/format'
import { escapeHtml as e, printHtml } from '../../utils/printHtml'
import { SAMPLE_PROFILE } from '../administration/companyProfile/companyProfileData'
import {
  METHOD_LABEL,
  journalFor,
  type CompanyAccount,
  type DisbursementRecord,
  type LoanApplication,
  type LoanPayment,
  type LoanView,
  type MemberAccount,
} from './loanApplicationsData'

// TODO: the company details come from GET /api/company-profiles/current
const header = (title: string) => `
  <div class="head">
    <div class="co">${e(SAMPLE_PROFILE.companyName)}</div>
    <div class="muted">${e(SAMPLE_PROFILE.location)} · ${e(SAMPLE_PROFILE.phone)} · ${e(SAMPLE_PROFILE.email)}</div>
    <h1>${e(title)}</h1>
  </div>`

const row = (label: string, value: string) => `<tr><td class="k">${e(label)}</td><td>${e(value)}</td></tr>`

const n = (x: number) => (x === 0 ? '—' : x.toLocaleString('en-US'))

/* ---------- repayment receipt ---------- */

export function printReceipt(p: LoanPayment & { applicantName: string; loanNo: string }, loan: LoanView) {
  const sum = (key: 'penalty' | 'interest' | 'principal') => p.allocations.reduce((s, a) => s + a[key], 0)

  const lines = p.allocations
    .map((a) => {
      const due = loan.installments.find((i) => i.installmentNo === a.installmentNo)?.dueDate
      return `<tr>
        <td>#${a.installmentNo}${due ? ` · due ${e(dayjs(due).format('MMM D, YYYY'))}` : ''}</td>
        <td class="r">${n(a.penalty)}</td><td class="r">${n(a.interest)}</td><td class="r">${n(a.principal)}</td>
      </tr>`
    })
    .join('')

  const body = `
    ${header('Payment receipt')}
    <table>
      ${row('Receipt no.', `RCP-${String(p.id).padStart(6, '0')}`)}
      ${row('Borrower', p.applicantName)}
      ${row('Loan', p.loanNo)}
      ${row('Date', dayjs(p.date).format('MMM D, YYYY'))}
      ${row('Method', METHOD_LABEL[p.method])}
      ${row('Reference', p.reference || 'None (cash)')}
      ${row('Received by', p.receivedBy)}
      ${row('Amount received', formatTzs(p.amount))}
      ${p.unallocated > 0 ? row('Not applied', formatTzs(p.unallocated)) : ''}
    </table>
    <h3>How it was applied (TZS)</h3>
    <table>
      <thead><tr><th>Installment</th><th class="r">Penalty</th><th class="r">Interest</th><th class="r">Principal</th></tr></thead>
      <tbody>${lines}</tbody>
      <tfoot><tr><td><b>Total</b></td><td class="r"><b>${n(sum('penalty'))}</b></td><td class="r"><b>${n(sum('interest'))}</b></td><td class="r"><b>${n(sum('principal'))}</b></td></tr></tfoot>
    </table>
    <p class="muted" style="margin-top:12px">Balance on the loan after this payment: ${e(formatTzs(loan.outstanding))}</p>`

  printHtml(`Receipt ${p.loanNo}`, body)
}

/* ---------- disbursement voucher ---------- */

export function printVoucher(
  a: LoanApplication,
  record: DisbursementRecord,
  source?: CompanyAccount,
  member?: MemberAccount,
) {
  const journal = journalFor(record.amount, source)
    .map(
      (l) => `<tr>
        <td>${e(l.name)}<div class="muted">${e(l.code)}</div></td>
        <td class="r">${l.side === 'DEBIT' ? e(formatTzs(l.amount)) : ''}</td>
        <td class="r">${l.side === 'CREDIT' ? e(formatTzs(l.amount)) : ''}</td>
      </tr>`,
    )
    .join('')

  const body = `
    ${header('Disbursement voucher')}
    <table>
      ${row('Voucher for', a.applicationNo)}
      ${row('Borrower', a.applicantName)}
      ${row('Amount', formatTzs(record.amount))}
      ${row('Paid from', source?.name ?? '—')}
      ${row('Paid to', member ? `${member.label} · ${member.detail}` : '—')}
      ${row('Method', METHOD_LABEL[record.method])}
      ${row('Reference', record.reference || 'None (cash)')}
      ${row('Date sent', dayjs(record.date).format('MMM D, YYYY'))}
      ${record.notes ? row('Notes', record.notes) : ''}
    </table>
    <h3>Journal entry</h3>
    <table>
      <thead><tr><th>Account</th><th class="r">Debit</th><th class="r">Credit</th></tr></thead>
      <tbody>${journal}</tbody>
    </table>
    <div class="sign">
      <div>Processed by<br/><b>${e(record.processedBy)}</b></div>
      <div>Approved by<br/><b>${e(record.approvedBy)}</b></div>
      <div>Received by (borrower)</div>
    </div>`

  printHtml(`Voucher ${a.applicationNo}`, body)
}