// field names follow the API: GET /api/chart-of-accounts
import { LOANS, SAMPLE_DISBURSEMENTS, SAMPLE_PAYMENTS } from '../loans/loanApplicationsData'
import { SAMPLE_WRITE_OFFS } from '../collections/collectionsData'

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE'

export type Account = {
  id: number
  accountNo: number // not in the API yet, see the account number ranges below
  accountCode: string // unique, uppercase, no spaces
  accountName: string
  accountTypeName: AccountType
  openingBalance: number
  currentBalance: number
}

export const ACCOUNT_TYPE: Record<
  AccountType,
  { label: string; color: string; hex: string; normal: 'Debit' | 'Credit'; hint: string }
> = {
  ASSET: { label: 'Asset', color: 'blue', hex: '#228be6', normal: 'Debit', hint: 'What the company owns: cash, bank accounts and loans owed to it' },
  LIABILITY: { label: 'Liability', color: 'orange', hex: '#fd7e14', normal: 'Credit', hint: 'What the company owes to others' },
  EQUITY: { label: 'Equity', color: 'violet', hex: '#7950f2', normal: 'Credit', hint: "The owners' money in the company" },
  INCOME: { label: 'Income', color: 'green', hex: '#40c057', normal: 'Credit', hint: 'Money earned, such as interest and penalties' },
  EXPENSE: { label: 'Expense', color: 'red', hex: '#fa5252', normal: 'Debit', hint: 'Money spent or lost, such as salaries and write-offs' },
}

export const ACCOUNT_TYPES = Object.keys(ACCOUNT_TYPE) as AccountType[]

// the usual numbering scheme: each type owns a block of numbers
export const ACCOUNT_RANGE: Record<AccountType, { from: number; to: number }> = {
  ASSET: { from: 1000, to: 1999 },
  LIABILITY: { from: 2000, to: 2999 },
  EQUITY: { from: 3000, to: 3999 },
  INCOME: { from: 4000, to: 4999 },
  EXPENSE: { from: 5000, to: 9999 },
}

export const rangeLabel = (t: AccountType) => `${ACCOUNT_RANGE[t].from}–${ACCOUNT_RANGE[t].to}`

// the next free number in the block, leaving gaps of 10 so accounts can be added in between later
export function nextAccountNo(type: AccountType, used: number[]): number | null {
  const { from, to } = ACCOUNT_RANGE[type]
  const highest = Math.max(from - 10, ...used.filter((n) => n >= from && n <= to))
  if (highest + 10 <= to) return highest + 10
  for (let n = from; n <= to; n++) if (!used.includes(n)) return n
  return null
}

// the GL posting workflows need these to exist, the API seeds them on startup if they are missing
export const SYSTEM_ACCOUNT_CODES = [
  'LOAN_RECEIVABLE',
  'CASH',
  'INTEREST_INCOME',
  'PENALTY_INCOME',
  'WRITE_OFF_EXPENSE',
]

// what posts to each system account (from /api/gl-workflow)
export const SYSTEM_USAGE: Record<string, string[]> = {
  LOAN_RECEIVABLE: [
    'Debit when a loan is disbursed',
    'Credit for the principal part of a repayment',
    'Credit when a loan is written off',
  ],
  CASH: ['Credit when a loan is disbursed', 'Debit for the full amount of a repayment'],
  INTEREST_INCOME: ['Credit for the interest part of a repayment'],
  PENALTY_INCOME: ['Credit for the penalty part of a repayment, only when it is not zero'],
  WRITE_OFF_EXPENSE: ['Debit when a bad loan is written off'],
}

export const isSystemAccount = (a: Account) => SYSTEM_ACCOUNT_CODES.includes(a.accountCode)

// our own rule, the API does not say when an account can be deleted:
// system accounts and accounts that hold a balance are kept
export function deleteBlockReason(a: Account): string | null {
  if (isSystemAccount(a)) return 'This account is needed for automatic GL posting.'
  if (a.openingBalance !== 0 || a.currentBalance !== 0) return 'An account that holds a balance cannot be deleted.'
  return null
}

// SAMPLE ONLY: replaced by GET /api/chart-of-accounts later.
// The cash and bank balances match the company accounts on the Disbursements page.
export const SAMPLE_ACCOUNTS: Account[] = [
  { id: 1, accountNo: 1010, accountCode: 'CASH', accountName: 'Cash on hand', accountTypeName: 'ASSET', openingBalance: 5000000, currentBalance: 6000000 },
  { id: 2, accountNo: 1020, accountCode: 'BANK_CRDB', accountName: 'CRDB Bank · 0150 xxxx 4412', accountTypeName: 'ASSET', openingBalance: 45000000, currentBalance: 48000000 },
  { id: 3, accountNo: 1030, accountCode: 'BANK_NMB', accountName: 'NMB Bank · 2041 xxxx 9087', accountTypeName: 'ASSET', openingBalance: 12500000, currentBalance: 12500000 },
  { id: 4, accountNo: 1040, accountCode: 'MPESA', accountName: 'M-Pesa business · 0754 xxx 100', accountTypeName: 'ASSET', openingBalance: 8000000, currentBalance: 9000000 },
  { id: 5, accountNo: 1200, accountCode: 'LOAN_RECEIVABLE', accountName: 'Loan Receivable', accountTypeName: 'ASSET', openingBalance: 20000000, currentBalance: 24300000 },
  { id: 6, accountNo: 1900, accountCode: 'SUSPENSE', accountName: 'Suspense Account', accountTypeName: 'ASSET', openingBalance: 0, currentBalance: 0 },
  { id: 7, accountNo: 2100, accountCode: 'BANK_LOAN_PAYABLE', accountName: 'Bank Loan Payable', accountTypeName: 'LIABILITY', openingBalance: 10000000, currentBalance: 10000000 },
  { id: 8, accountNo: 3000, accountCode: 'OWNER_CAPITAL', accountName: 'Owner Capital', accountTypeName: 'EQUITY', openingBalance: 70000000, currentBalance: 70000000 },
  { id: 9, accountNo: 4000, accountCode: 'INTEREST_INCOME', accountName: 'Interest Income', accountTypeName: 'INCOME', openingBalance: 0, currentBalance: 2150000 },
  { id: 10, accountNo: 4100, accountCode: 'PENALTY_INCOME', accountName: 'Penalty Income', accountTypeName: 'INCOME', openingBalance: 0, currentBalance: 320000 },
  { id: 11, accountNo: 5100, accountCode: 'WRITE_OFF_EXPENSE', accountName: 'Write-off Expense', accountTypeName: 'EXPENSE', openingBalance: 0, currentBalance: 2250000 },
  { id: 12, accountNo: 6000, accountCode: 'SALARIES_EXPENSE', accountName: 'Salaries', accountTypeName: 'EXPENSE', openingBalance: 0, currentBalance: 3600000 },
  { id: 13, accountNo: 6100, accountCode: 'RENT_EXPENSE', accountName: 'Office Rent', accountTypeName: 'EXPENSE', openingBalance: 0, currentBalance: 1200000 },
  { id: 14, accountNo: 4200, accountCode: 'OTHER_INCOME', accountName: 'Other Income', accountTypeName: 'INCOME', openingBalance: 0, currentBalance: 80000 },
  { id: 15, accountNo: 6900, accountCode: 'MISC_EXPENSE', accountName: 'Miscellaneous Expenses', accountTypeName: 'EXPENSE', openingBalance: 0, currentBalance: 45000 },
]

/* ---------- GL transactions ---------- */

// DISBURSEMENT, REPAYMENT and WRITE_OFF are posted by /api/gl-workflow.
// OTHER is for entries that are not about a loan (expenses, fines, reimbursements, other income).
export type GlTransactionType = 'DISBURSEMENT' | 'REPAYMENT' | 'WRITE_OFF' | 'OTHER'

export const GL_TYPE: Record<GlTransactionType, { label: string; color: string; hex: string; icon: string }> = {
  DISBURSEMENT: { label: 'Disbursement', color: 'blue', hex: '#228be6', icon: 'banknote' },
  REPAYMENT: { label: 'Repayment', color: 'green', hex: '#40c057', icon: 'credit-card' },
  WRITE_OFF: { label: 'Write-off', color: 'dark', hex: '#343a40', icon: 'triangle-alert' },
  OTHER: { label: 'Other', color: 'grape', hex: '#be4bdb', icon: 'file-text' },
}

export const GL_TYPES = Object.keys(GL_TYPE) as GlTransactionType[]

export type GlEntry = {
  id: number
  glTransactionId: number
  accountCode: string // the API returns accountId, joined to the chart of accounts later
  accountName: string
  entryType: 'DEBIT' | 'CREDIT'
  amount: number
  description: string
}

export type GlTransaction = {
  id: number
  transactionNo: string // like GLT-00001
  transactionType: GlTransactionType
  loanId: number | null
  loanNo: string // joined from the loan, empty for an Other entry
  borrower: string // empty for an Other entry
  paymentId: number | null
  totalAmount: number
  status: 'POSTED'
  date: string // ISO date
  postedBy: string
  /** what an Other entry is about, empty for the loan-based types */
  description: string
  entries: GlEntry[]
}

const accountNameFor = (code: string) => SAMPLE_ACCOUNTS.find((a) => a.accountCode === code)?.accountName ?? code

type Line = { entryType: 'DEBIT' | 'CREDIT'; accountCode: string; amount: number; description: string }
type Draft = Omit<GlTransaction, 'id' | 'transactionNo' | 'entries'> & { lines: Line[] }

// SAMPLE ONLY: built from the sample loans, payments and write-offs so the ledger always matches the other pages.
// The postings follow /api/gl-workflow:
//   disbursement: Debit LOAN_RECEIVABLE, Credit CASH
//   repayment:    Debit CASH, Credit LOAN_RECEIVABLE (principal), INTEREST_INCOME, PENALTY_INCOME (only if not zero)
//   write-off:    Debit WRITE_OFF_EXPENSE, Credit LOAN_RECEIVABLE
function buildGlTransactions(): GlTransaction[] {
  const drafts: Draft[] = []

  // disbursements, except the one still waiting to be posted
  LOANS.forEach((l) => {
    const record = l.applicationId !== null ? SAMPLE_DISBURSEMENTS[l.applicationId] : undefined
    if (record && record.glStatus === 'PENDING') return
    drafts.push({
      transactionType: 'DISBURSEMENT',
      loanId: l.id,
      loanNo: l.loanNo,
      borrower: l.applicantName,
      paymentId: null,
      totalAmount: l.principal,
      status: 'POSTED',
      date: l.disbursed,
      postedBy: 'System',
      description: '',
      lines: [
        { entryType: 'DEBIT', accountCode: 'LOAN_RECEIVABLE', amount: l.principal, description: 'Loan disbursed' },
        { entryType: 'CREDIT', accountCode: 'CASH', amount: l.principal, description: 'Disbursement paid out' },
      ],
    })
  })

  // repayments, split like the payment allocation
  SAMPLE_PAYMENTS.forEach((p) => {
    const loan = LOANS.find((l) => l.id === p.loanId)
    if (!loan) return
    const sum = (key: 'penalty' | 'interest' | 'principal') => p.allocations.reduce((s, a) => s + a[key], 0)
    const principal = sum('principal')
    const interest = sum('interest')
    const penalty = sum('penalty')
    const total = principal + interest + penalty
    if (total <= 0) return

    const lines: Line[] = [{ entryType: 'DEBIT', accountCode: 'CASH', amount: total, description: 'Payment received' }]
    if (principal > 0) lines.push({ entryType: 'CREDIT', accountCode: 'LOAN_RECEIVABLE', amount: principal, description: 'Principal repayment' })
    if (interest > 0) lines.push({ entryType: 'CREDIT', accountCode: 'INTEREST_INCOME', amount: interest, description: 'Interest income' })
    if (penalty > 0) lines.push({ entryType: 'CREDIT', accountCode: 'PENALTY_INCOME', amount: penalty, description: 'Penalty income' })

    drafts.push({
      transactionType: 'REPAYMENT',
      loanId: loan.id,
      loanNo: loan.loanNo,
      borrower: loan.applicantName,
      paymentId: p.id,
      totalAmount: total,
      status: 'POSTED',
      date: p.date,
      postedBy: 'System',
      description: '',
      lines,
    })
  })

  // write-offs
  SAMPLE_WRITE_OFFS.forEach((w) => {
    drafts.push({
      transactionType: 'WRITE_OFF',
      loanId: w.loanId,
      loanNo: w.loanNo,
      borrower: w.borrower,
      paymentId: null,
      totalAmount: w.amount,
      status: 'POSTED',
      date: w.date,
      postedBy: 'System',
      description: '',
      lines: [
        { entryType: 'DEBIT', accountCode: 'WRITE_OFF_EXPENSE', amount: w.amount, description: 'Loan written off' },
        { entryType: 'CREDIT', accountCode: 'LOAN_RECEIVABLE', amount: w.amount, description: 'Loan balance cleared' },
      ],
    })
  })

  // entries that are not about a loan, made by hand
  const others = [
    { date: '2026-10-02', description: 'Office rent paid for October', amount: 1200000, debit: 'RENT_EXPENSE', credit: 'BANK_CRDB' },
    { date: '2026-10-05', description: 'Staff salaries paid for September', amount: 3600000, debit: 'SALARIES_EXPENSE', credit: 'BANK_CRDB' },
    { date: '2026-10-12', description: 'Reimbursement received from a supplier for damaged goods', amount: 80000, debit: 'CASH', credit: 'OTHER_INCOME' },
    { date: '2026-10-18', description: 'Traffic fine paid for the company vehicle', amount: 45000, debit: 'MISC_EXPENSE', credit: 'CASH' },
  ]
  others.forEach((o) => {
    drafts.push({
      transactionType: 'OTHER',
      loanId: null,
      loanNo: '',
      borrower: '',
      paymentId: null,
      totalAmount: o.amount,
      status: 'POSTED',
      date: o.date,
      postedBy: 'Asha Mrema',
      description: o.description,
      lines: [
        { entryType: 'DEBIT', accountCode: o.debit, amount: o.amount, description: o.description },
        { entryType: 'CREDIT', accountCode: o.credit, amount: o.amount, description: o.description },
      ],
    })
  })

  let entryId = 1
  return drafts
    .sort((a, b) => a.date.localeCompare(b.date) || a.transactionType.localeCompare(b.transactionType))
    .map((d, i) => {
      const { lines, ...rest } = d
      const id = i + 1
      return {
        ...rest,
        id,
        transactionNo: `GLT-${String(id).padStart(5, '0')}`,
        entries: lines.map((l) => ({
          id: entryId++,
          glTransactionId: id,
          accountCode: l.accountCode,
          accountName: accountNameFor(l.accountCode),
          entryType: l.entryType,
          amount: l.amount,
          description: l.description,
        })),
      }
    })
}

export const SAMPLE_GL_TRANSACTIONS: GlTransaction[] = buildGlTransactions()

// one row of GET /api/reports/gl-trial-balance
export type TrialBalanceRow = {
  id: number // the account id, so the table has a key
  accountCode: string
  accountName: string
  accountType: AccountType
  totalDebit: number
  totalCredit: number
  netBalance: number // debit minus credit, like the API
}

// debit and credit totals per account, only for accounts that have entries
export function trialBalanceFor(list: GlTransaction[]): TrialBalanceRow[] {
  const rows = new Map<string, TrialBalanceRow>()
  list
    .flatMap((t) => t.entries)
    .forEach((e) => {
      const account = SAMPLE_ACCOUNTS.find((a) => a.accountCode === e.accountCode)
      const row =
        rows.get(e.accountCode) ??
        ({
          id: account?.id ?? 0,
          accountCode: e.accountCode,
          accountName: e.accountName,
          accountType: account?.accountTypeName ?? 'ASSET',
          totalDebit: 0,
          totalCredit: 0,
          netBalance: 0,
        } as TrialBalanceRow)
      if (e.entryType === 'DEBIT') row.totalDebit += e.amount
      else row.totalCredit += e.amount
      row.netBalance = row.totalDebit - row.totalCredit
      rows.set(e.accountCode, row)
    })
  return [...rows.values()]
}