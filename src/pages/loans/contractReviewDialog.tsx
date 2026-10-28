import { AppIcon } from '../../components/appIcon'
import { useState, type ReactNode } from 'react'
import { Alert, Badge, Button, Checkbox, Modal, Text } from '@mantine/core'
import dayjs from 'dayjs'
import { formatTzs } from '../../utils/format'
import { ContractEditor } from './contractEditor'
import {
  defaultContent,
  fillPlaceholders,
  sameContent,
  validateContent,
  valuesFor,
  type ContractContent,
} from './contractTemplate'
import { contractFor, estimateInstallment, type LoanApplication } from './loanApplicationsData'

type Props = {
  opened: boolean
  application: LoanApplication | null
  /** true while the contract is generated but not sent yet, it is the only time it can be edited */
  canSend: boolean
  /** the edited wording of this contract, null while it still has the default wording */
  edited: ContractContent | null
  onClose: () => void
  onSend: () => void
  onSaveEdit: (content: ContractContent) => void
  onResetEdit: () => void
}

function Clause({ no, title, children }: { no: number; title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h4 className="text-[12px] font-bold uppercase tracking-wide text-gray-800">
        {no}. {title}
      </h4>
      <div className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-gray-700">{children}</div>
    </section>
  )
}

// **word** shows bold
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.length > 4 && part.startsWith('**') && part.endsWith('**') ? (
          <b key={i}>{part.slice(2, -2)}</b>
        ) : (
          part
        ),
      )}
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-800">{value}</span>
    </div>
  )
}

const copy = (c: ContractContent): ContractContent => ({
  title: c.title,
  clauses: c.clauses.map((x) => ({ ...x })),
})

export function ContractReviewDialog({
  opened,
  application: a,
  canSend,
  edited,
  onClose,
  onSend,
  onSaveEdit,
  onResetEdit,
}: Props) {
  const [reviewed, setReviewed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<ContractContent | null>(null)
  const [problems, setProblems] = useState<string[]>([])

  if (!a) return <Modal opened={false} onClose={onClose} />

  const contract = contractFor(a)
  const installment = Math.round(estimateInstallment(a))
  const defaults = defaultContent(a)
  const current = edited ?? defaults
  const values = valuesFor(a)
  const fill = (text: string) => fillPlaceholders(text, values)

  const reset = () => {
    setReviewed(false)
    setEditing(false)
    setDraft(null)
    setProblems([])
  }

  const close = () => {
    reset()
    onClose()
  }

  const send = () => {
    reset()
    onSend()
  }

  const startEdit = () => {
    setDraft(copy(current))
    setProblems([])
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setDraft(null)
    setProblems([])
  }

  const saveEdit = () => {
    if (!draft) return
    const found = validateContent(draft)
    setProblems(found)
    if (found.length > 0) return

    // TODO: PUT /api/loan-origination/contracts/{contractId} { title, clauses } (only while the contract is GENERATED)
    if (sameContent(draft, defaults)) onResetEdit()
    else onSaveEdit(draft)

    // the officer has to look at the new wording again before sending
    setReviewed(false)
    cancelEdit()
  }

  return (
    <Modal opened={opened} onClose={close} title={editing ? 'Edit contract' : 'Review contract'} size={980} centered>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* the left side: the editor, or the contract as the borrower will see it */}
        {editing && draft ? (
          <div className="max-h-[62vh] overflow-y-auto rounded-md border border-gray-200 p-4">
            <ContractEditor draft={draft} onChange={setDraft} />
          </div>
        ) : (
          <div className="max-h-[62vh] overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-4">
            <div className="mx-auto max-w-[560px] bg-white p-8 font-serif shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
              <div className="border-b border-gray-300 pb-4 text-center">
                <div className="text-[11px] uppercase tracking-[0.2em] text-gray-500">{values.companyName}</div>
                <h3 className="mt-1 text-lg font-bold tracking-wide text-gray-900">{fill(current.title)}</h3>
                <div className="mt-1 text-xs text-gray-500">
                  Contract No. {contract?.contractNo} ·{' '}
                  {contract ? dayjs(contract.generated).format('MMMM D, YYYY') : ''}
                </div>
              </div>

              {current.clauses.map((c, i) => (
                <Clause key={c.id} no={i + 1} title={fill(c.title)}>
                  <Rich text={fill(c.body)} />
                </Clause>
              ))}

              <div className="mt-8 grid grid-cols-2 gap-8 text-[12px] text-gray-700">
                {['Borrower', 'For the Lender'].map((who) => (
                  <div key={who}>
                    <div className="h-10 border-b border-gray-400" />
                    <div className="mt-1 font-medium">{who}</div>
                    <div className="text-gray-500">Name and date</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* before you send */}
        <div className="space-y-4">
          <div>
            <Text size="sm" fw={600} mb={4}>
              Check these first
            </Text>
            <Row label="Borrower" value={a.applicantName} />
            <Row label="Amount" value={formatTzs(a.requestedAmount)} />
            <Row label="Rate and tenure" value={`${a.interestRate}% · ${a.tenure} months`} />
            <Row label="Monthly installment" value={formatTzs(installment)} />
          </div>

          {editing ? (
            <>
              {problems.length > 0 && (
                <Alert color="red" variant="light" icon={<AppIcon name="circle-x" />}>
                  <ul className="list-disc space-y-1 pl-4 text-xs">
                    {problems.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </Alert>
              )}
              <Alert color="blue" variant="light" icon={<AppIcon name="info" />}>
                <Text size="xs">
                  Figures like the amount and the rate come from the loan, so keep them as fields. Changes apply to
                  this contract only, the default wording for other contracts is not touched.
                </Text>
              </Alert>
            </>
          ) : canSend ? (
            <>
              {edited && (
                <Alert color="yellow" variant="light" icon={<AppIcon name="pencil" />}>
                  <Text size="xs">
                    The wording of this contract was changed from the default. Read it again before you send it.
                  </Text>
                </Alert>
              )}
              <Alert color="blue" variant="light" icon={<AppIcon name="info" />}>
                <Text size="xs">
                  The borrower gets an email with a link to print the contract. They sign it and return the hard copy,
                  then you upload the signed scan. The contract cannot be edited after it is sent.
                </Text>
              </Alert>
              <Checkbox
                label="I have reviewed this contract"
                checked={reviewed}
                onChange={(e) => setReviewed(e.currentTarget.checked)}
              />
            </>
          ) : (
            contract && (
              <>
                {edited && (
                  <Badge variant="light" color="yellow" radius="sm" size="sm" tt="none">
                    Edited wording
                  </Badge>
                )}
                <Alert color="gray" variant="light" icon={<AppIcon name="lock-keyhole" />}>
                  <Text size="xs">
                    {contract.status === 'SIGNED'
                      ? `Signed${contract.signed ? ` on ${dayjs(contract.signed).format('MMM D, YYYY')}` : ''}. This copy is read-only.`
                      : `Sent${contract.sent ? ` on ${dayjs(contract.sent).format('MMM D, YYYY')}` : ''}. Waiting for the signed copy. It can no longer be edited.`}
                  </Text>
                </Alert>
              </>
            )
          )}

          <Text size="xs" c="dimmed">
            The default wording is sample text until your contract template is set up.
          </Text>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4">
        {editing ? (
          <>
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              leftSection={<AppIcon name="refresh-cw" />}
              onClick={() => {
                setDraft(copy(defaults))
                setProblems([])
              }}
            >
              Reset to default
            </Button>
            <div className="flex gap-2">
              <Button size="xs" variant="default" onClick={cancelEdit}>
                Cancel
              </Button>
              <Button size="xs" leftSection={<AppIcon name="check" />} onClick={saveEdit}>
                Save changes
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <Button size="xs" variant="default" leftSection={<AppIcon name="printer" />}>
                Print
              </Button>
              {canSend && (
                <Button size="xs" variant="default" leftSection={<AppIcon name="pencil" />} onClick={startEdit}>
                  Edit contract
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="xs" variant="default" onClick={close}>
                {canSend ? 'Review later' : 'Close'}
              </Button>
              {canSend && (
                <Button size="xs" disabled={!reviewed} leftSection={<AppIcon name="send" />} onClick={send}>
                  Send to borrower
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}