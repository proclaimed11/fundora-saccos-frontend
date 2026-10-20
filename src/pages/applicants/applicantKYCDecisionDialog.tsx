import { AppIcon } from '../../components/appIcon'
import { useState } from 'react'
import { Alert, Badge, Button, Modal, Text, Textarea } from '@mantine/core'
import { STATUS, nidaFor, type Applicant } from './applicantsData'

export type KycDecision = 'APPROVED' | 'REJECTED'

type KycDecisionDialogProps = {
  /** the applicant under review, null keeps the dialog closed */
  applicant: Applicant | null
  onClose: () => void
  /** called after the reviewer confirms */
  onDecided?: (applicant: Applicant, decision: KycDecision, remarks: string) => void
}

// SAMPLE ONLY: real files come from the applicant's KYC documents
const DOCUMENTS = [
  { name: 'NIDA document', file: 'nida-document.pdf', icon: 'file-text' },
  { name: 'ID scan', file: 'id-scan.jpg', icon: 'file-image' },
]

export function KycDecisionDialog({ applicant, onClose, onDecided }: KycDecisionDialogProps) {
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState<KycDecision | null>(null) // set = showing the confirm step
  const [preview, setPreview] = useState<string | null>(null)

  const close = () => {
    setRemarks('')
    setError(undefined)
    setPending(null)
    setPreview(null)
    onClose()
  }

  const choose = (decision: KycDecision) => {
    if (decision === 'REJECTED' && !remarks.trim()) {
      setError('Add a remark explaining the rejection')
      return
    }
    setError(undefined)
    setPending(decision)
  }

  const confirm = () => {
    if (!applicant || !pending) return
    // TODO: call POST /api/onboarding/kyc/decision with the decision and remarks here
    onDecided?.(applicant, pending, remarks.trim())
    close()
  }

  const approving = pending === 'APPROVED'

  return (
    <>
      <Modal
        opened={!!applicant}
        onClose={close}
        title={pending ? 'Confirm decision' : 'KYC decision'}
        size="lg"
        centered
      >
        {applicant && (
          <div className="space-y-5">
            {/* who is being reviewed */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Text fw={600}>{applicant.name}</Text>
                <Text size="xs" c="dimmed">
                  {applicant.applicantNo}
                </Text>
              </div>
              <div className="flex gap-2">
                <Badge variant="light" color={STATUS[applicant.status].color} radius="sm" size="sm">
                  {STATUS[applicant.status].label}
                </Badge>
                <Badge variant="outline" color={applicant.isReturning ? 'brand' : 'gray'} radius="sm" size="sm">
                  {applicant.isReturning ? 'Returning' : 'New'}
                </Badge>
              </div>
            </div>

            {pending ? (
              /* step 2: confirm */
              <div className="space-y-4">
                <Text size="sm">
                  {approving
                    ? `Approve KYC for ${applicant.name}? They will be able to start a loan application. Approval is valid for 12 months.`
                    : `Reject KYC for ${applicant.name}? This stops their loan application.`}
                </Text>
                {remarks.trim() && (
                  <div className="rounded-md bg-gray-50 px-3 py-2">
                    <Text size="xs" c="dimmed">
                      Remarks
                    </Text>
                    <Text size="sm">{remarks.trim()}</Text>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button size="xs" radius="xs" variant="default" onClick={() => setPending(null)}>
                    Back
                  </Button>
                  <Button size="xs" radius="xs" color={approving ? undefined : 'red'} onClick={confirm}>
                    {approving ? 'Confirm approval' : 'Confirm rejection'}
                  </Button>
                </div>
              </div>
            ) : (
              /* step 1: review */
              <>
                {applicant.isReturning && (
                  <Alert color="blue" variant="light" icon={<AppIcon name="refresh-cw" />}>
                    <Text size="sm">
                      Returning applicant. A valid KYC from the last 12 months can let them skip full review.
                    </Text>
                  </Alert>
                )}

                <div>
                  <Text size="sm" fw={600} mb={6}>
                    Documents
                  </Text>
                  <ul className="space-y-2">
                    {DOCUMENTS.map((d) => (
                      <li
                        key={d.name}
                        className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2"
                      >
                        <AppIcon name={d.icon} className="text-xl text-gray-400"  size={20} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-800">{d.name}</div>
                          <div className="truncate text-xs text-gray-500">{d.file}</div>
                        </div>
                        <Button size="compact-xs" variant="light" onClick={() => setPreview(d.name)}>
                          View
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <Text size="sm" fw={600} mb={4}>
                    Details to match
                  </Text>
                  <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                    {[
                      ['NIDA number', nidaFor(applicant)],
                      ['Name', applicant.name],
                      ['Phone', applicant.phone],
                      ['Nationality', applicant.nationality],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4 border-b border-gray-100 py-2 text-sm">
                        <span className="text-gray-500">{label}</span>
                        <span className="text-right font-medium text-gray-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Textarea
                  label="Remarks"
                  description="Required to reject, optional to approve"
                  placeholder="Add a note about the documents checked"
                  minRows={3}
                  autosize
                  value={remarks}
                  onChange={(e) => {
                    setRemarks(e.currentTarget.value)
                    setError(undefined)
                  }}
                  error={error}
                />

                <div className="flex justify-end gap-2">
                  <Button size="xs" radius="xs" color="red" variant="light" onClick={() => choose('REJECTED')}>
                    Reject
                  </Button>
                  <Button size="xs" radius="xs" onClick={() => choose('APPROVED')}>
                    Approve
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* document preview, a placeholder until real files are connected */}
      <Modal opened={preview !== null} onClose={() => setPreview(null)} title={preview ?? ''} size="lg" centered>
        <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-md bg-gray-50 text-center">
          <AppIcon name="file" className="text-4xl text-gray-300"  size={36} />
          <Text size="sm" c="dimmed">
            The document preview appears here once files are connected.
          </Text>
        </div>
      </Modal>
    </>
  )
}