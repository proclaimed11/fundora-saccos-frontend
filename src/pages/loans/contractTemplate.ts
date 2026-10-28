import dayjs from 'dayjs'
import { formatTzs } from '../../utils/format'
import { SAMPLE_PROFILE } from '../administration/companyProfile/companyProfileData'
import {
  contractFor,
  estimateInstallment,
  methodLabel,
  scheduleFor,
  totalRepayable,
  type LoanApplication,
} from './loanApplicationsData'

export type ContractClause = { id: number; title: string; body: string }
export type ContractContent = { title: string; clauses: ContractClause[] }

// the fields a clause can use, written as {{key}}
export const PLACEHOLDERS = [
  { key: 'companyName', label: 'Company name' },
  { key: 'borrowerName', label: 'Borrower name' },
  { key: 'applicationNo', label: 'Application number' },
  { key: 'contractNo', label: 'Contract number' },
  { key: 'contractDate', label: 'Contract date' },
  { key: 'principal', label: 'Principal amount' },
  { key: 'interestRate', label: 'Interest rate' },
  { key: 'interestMethod', label: 'Interest method' },
  { key: 'tenure', label: 'Tenure' },
  { key: 'installment', label: 'Monthly installment' },
  { key: 'firstDueDate', label: 'First due date' },
  { key: 'totalRepayable', label: 'Total repayable' },
  { key: 'penaltyRate', label: 'Penalty rate' },
] as const

// these must stay in the contract so the figures always match the loan
const REQUIRED = ['principal', 'interestRate', 'tenure'] as const

const labelOf = (key: string) => PLACEHOLDERS.find((p) => p.key === key)?.label ?? key

// the real values for one application
export function valuesFor(a: LoanApplication): Record<string, string> {
  const contract = contractFor(a)
  const firstDue = scheduleFor(a)[0]?.dueDate
  return {
    companyName: SAMPLE_PROFILE.companyName, // TODO: from GET /api/company-profiles/current
    borrowerName: a.applicantName,
    applicationNo: a.applicationNo,
    contractNo: contract?.contractNo ?? '',
    contractDate: contract ? dayjs(contract.generated).format('MMMM D, YYYY') : '',
    principal: formatTzs(a.requestedAmount),
    interestRate: `${a.interestRate}% per year`,
    interestMethod: methodLabel(a.interestMethod),
    tenure: `${a.tenure} months`,
    installment: formatTzs(Math.round(estimateInstallment(a))),
    firstDueDate: firstDue ? dayjs(firstDue).format('MMMM D, YYYY') : 'the agreed date',
    totalRepayable: formatTzs(Math.round(totalRepayable(a))),
    penaltyRate: `${a.penaltyRate}%`,
  }
}

// swaps {{key}} for its value, an unknown key is left as it is
export const fillPlaceholders = (text: string, values: Record<string, string>) =>
  text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => values[key] ?? match)

// the default wording, used until someone edits this contract
export function defaultContent(a: LoanApplication): ContractContent {
  const clauses: Omit<ContractClause, 'id'>[] = [
    {
      title: 'Parties',
      body: 'This agreement is made between **{{companyName}}** (the Lender) and **{{borrowerName}}** (the Borrower), on the application **{{applicationNo}}**.',
    },
    {
      title: 'The loan',
      body: 'Principal amount: {{principal}}\nInterest rate: {{interestRate}}\nInterest method: {{interestMethod}}\nTenure: {{tenure}}',
    },
    {
      title: 'Repayment',
      body: 'The Borrower repays the loan in monthly installments of about **{{installment}}** over {{tenure}}, the first due on {{firstDueDate}}. The total repayable is about **{{totalRepayable}}**. Each payment is applied to penalties first, then interest, then principal.',
    },
    {
      title: 'Late payment',
      body: 'A penalty of {{penaltyRate}} is charged on each installment that is paid late.',
    },
  ]

  if (a.guarantorRequired || a.collateralRequired) {
    clauses.push({
      title: 'Security',
      body: [
        a.guarantorRequired ? 'The loan is guaranteed by the guarantor(s) named in the application.' : '',
        a.collateralRequired ? 'The loan is secured by the collateral listed in the application.' : '',
      ]
        .filter(Boolean)
        .join(' '),
    })
  }

  return {
    title: SAMPLE_PROFILE.contractTitle, // TODO: from the company profile
    clauses: clauses.map((c, i) => ({ id: i + 1, ...c })),
  }
}

// the problems that stop an edited contract from being saved, empty means it is fine
export function validateContent(c: ContractContent): string[] {
  const problems: string[] = []

  if (!c.title.trim()) problems.push('The contract heading cannot be empty.')
  if (c.clauses.length === 0) problems.push('The contract needs at least one clause.')
  c.clauses.forEach((cl, i) => {
    if (!cl.title.trim() || !cl.body.trim()) problems.push(`Clause ${i + 1} needs a title and some text.`)
  })

  const text = [c.title, ...c.clauses.flatMap((cl) => [cl.title, cl.body])].join('\n')

  const known: string[] = PLACEHOLDERS.map((p) => p.key)
  const unknown = [...new Set([...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))].filter((k) => !known.includes(k))
  if (unknown.length > 0) {
    problems.push(`Unknown field: ${unknown.map((k) => `{{${k}}}`).join(', ')}. Pick fields from the list.`)
  }

  const missing = REQUIRED.filter((k) => !text.includes(`{{${k}}}`))
  if (missing.length > 0) {
    problems.push(
      `These fields must stay in the contract so the figures match the loan: ${missing.map(labelOf).join(', ')}.`,
    )
  }

  return problems
}

export const sameContent = (a: ContractContent, b: ContractContent) =>
  JSON.stringify({ t: a.title, c: a.clauses.map((x) => [x.title, x.body]) }) ===
  JSON.stringify({ t: b.title, c: b.clauses.map((x) => [x.title, x.body]) })