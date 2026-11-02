import { AppIcon } from '../../components/appIcon'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { Alert, Badge, Button, Text } from '@mantine/core'
import { Can } from '../auth/requirePermission'
import { ContractConfirmDialog } from '../loans/contractDialogs'
import { CURRENT_USER } from '../loans/disbursementDialog'
import { identificationsFor, type Applicant } from './applicantsData'

type Done = Record<number, { by: string; at: string }>

export function IdentificationSection({ applicant }: { applicant: Applicant }) {
  // UI only: what was marked verified in this session, nothing is saved yet
  const [done, setDone] = useState<Done>({})
  const [targetId, setTargetId] = useState<number | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 9000)
    return () => clearTimeout(t)
  }, [notice])

  const list = identificationsFor(applicant).map((i) =>
    done[i.id] ? { ...i, verified: true, verifiedBy: done[i.id].by, verifiedAt: done[i.id].at } : i,
  )
  const target = list.find((i) => i.id === targetId)
  const nida = list.find((i) => i.type === 'NIDA')
  const hasTin = list.some((i) => i.type === 'TIN')

  const verify = () => {
    if (!target) return
    // TODO: POST /api/onboarding/identification/verify { identificationId, verifiedBy }
    setDone((d) => ({ ...d, [target.id]: { by: CURRENT_USER, at: dayjs().format('YYYY-MM-DD') } }))
    setNotice(`${target.type} ${target.number} was marked as verified.`)
    setTargetId(null)
  }

  return (
    <div className="mt-4">
      <Text size="sm" fw={600} mb={4}>
        Identification
      </Text>

      {notice && (
        <Alert color="green" variant="light" withCloseButton onClose={() => setNotice(null)} icon={<AppIcon name="circle-check" />} mb="xs">
          <Text size="xs">{notice}</Text>
        </Alert>
      )}

      {applicant.status === 'PENDING_KYC' && nida && !nida.verified && (
        <Alert color="yellow" variant="light" icon={<AppIcon name="triangle-alert" />} mb="xs">
          <Text size="xs">The NIDA number is not verified yet. Check it before you approve the KYC.</Text>
        </Alert>
      )}

      <ul className="space-y-2">
        {list.map((i) => (
          <li key={i.id} className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <AppIcon name="contact-round" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-800">{i.type} number</div>
              <div className="font-mono text-xs text-gray-500">{i.number}</div>
              {i.verified && i.verifiedBy && i.verifiedAt && (
                <div className="text-[11px] text-gray-400">
                  Verified by {i.verifiedBy} on {dayjs(i.verifiedAt).format('MMM D, YYYY')}
                </div>
              )}
            </div>
            <Badge variant="light" color={i.verified ? 'green' : 'gray'} radius="sm" size="sm">
              {i.verified ? 'Verified' : 'Not verified'}
            </Badge>
            {!i.verified && (
              <Can area="applicants" page="applicants" action="edit">
                <Button size="compact-xs" variant="light" onClick={() => setTargetId(i.id)}>
                  Mark verified
                </Button>
              </Can>
            )}
          </li>
        ))}
      </ul>

      {!hasTin && <p className="mt-2 text-xs text-gray-500">No TIN number on file. It is optional.</p>}

      <ContractConfirmDialog
        opened={!!target}
        title="Mark as verified"
        message={`Confirm that the ${target?.type ?? ''} number ${target?.number ?? ''} of ${applicant.name} was checked against the official record.`}
        confirmLabel="Mark verified"
        onClose={() => setTargetId(null)}
        onConfirm={verify}
      />
    </div>
  )
}