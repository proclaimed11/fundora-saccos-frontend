import { AppIcon } from '../../components/appIcon'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { Alert, Badge, Button, Tabs, Text } from '@mantine/core'
import { DashboardLayout } from '../../components/layout/dashboardLayout'
import {
  STATUS,
  applicants,
  initials,
  stageActions,
  type ApplicantStatus,
} from './applicantsData'
import {
  AccountsTab,
  ActivityTab,
  FinancialTab,
  KycTab,
  LoansTab,
  OverviewTab,
} from './applicantProfileTabs'
import { KycDecisionDialog } from './applicantKYCDecisionDialog'
import { ApplicantEditDialog, type ApplicantEditInput } from './applicantEditDialog'
import { ContractConfirmDialog } from '../loans/contractDialogs'
import { LOANS, applications } from '../loans/loanApplicationsData'

const CARD = 'rounded-md bg-white shadow-[0_10px_30px_rgba(76,87,125,0.12)]'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'kyc', label: 'KYC and documents' },
  { value: 'financial', label: 'Financial' },
  { value: 'accounts', label: 'Accounts' },
  { value: 'loans', label: 'Loans' },
  { value: 'activity', label: 'Activity' },
]

export function ApplicantProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [reviewOpen, setReviewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  // UI only: a decision changes the status for this session, nothing is saved yet
  const [statusOverride, setStatusOverride] = useState<ApplicantStatus | null>(null)
  // UI only: edits made in this session, nothing is saved yet
  const [changes, setChanges] = useState<ApplicantEditInput | null>(null)

  // success banner fades away on its own
  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 9000)
    return () => clearTimeout(t)
  }, [notice])

  const base = applicants.find((a) => String(a.id) === id)
  const applicant = base ? { ...base, ...changes, status: statusOverride ?? base.status } : undefined

  if (!applicant) {
    return (
      <DashboardLayout
        title="Applicant not found"
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Applicants', to: '/applicants' },
          { label: 'Not found' },
        ]}
      >
        <div className={`${CARD} p-6`}>
          <Text size="sm">We couldn't find that applicant.</Text>
          <Button mt="md" size="xs" variant="default" onClick={() => navigate('/applicants')}>
            Back to applicants
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const saveEdit = (input: ApplicantEditInput) => {
    // TODO: PUT /api/applicants/{id}
    setChanges(input)
    setNotice(`${input.name}'s details were updated.`)
    setEditOpen(false)
  }

  // our own rule, the API does not say when an applicant can be deleted
  const loanCount = LOANS.filter((l) => l.applicantId === applicant.id).length
  const applicationCount = applications.filter((a) => a.applicantId === applicant.id).length
  const deleteBlock =
    loanCount > 0 || applicationCount > 0
      ? `${applicant.name} has ${applicationCount} loan ${applicationCount === 1 ? 'application' : 'applications'} and ${loanCount} ${loanCount === 1 ? 'loan' : 'loans'} on record, so the profile cannot be deleted.`
      : null

  const removeApplicant = () => {
    if (deleteBlock) return
    // TODO: DELETE /api/applicants/{id}
    setDeleteOpen(false)
    navigate('/applicants', { replace: true })
  }

  const status = STATUS[applicant.status]
  const details = [
    { icon: 'phone', value: applicant.phone },
    { icon: 'mail', value: applicant.email },
    { icon: 'map-pin', value: applicant.location },
    { icon: 'flag', value: applicant.nationality },
    { icon: 'calendar-days', value: `Registered ${dayjs(applicant.registered).format('MMM D, YYYY')}` },
  ]

  return (
    <DashboardLayout
      title={applicant.name}
      subtitle={applicant.applicantNo}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Applicants', to: '/applicants' },
        { label: applicant.name },
      ]}
      actions={
        // only Review KYC is wired so far, the rest stay inactive
        <>
          <Button
            size="xs"
            variant="default"
            leftSection={<AppIcon name="pen-line" />}
            onClick={() => setEditOpen(true)}
          >
            Edit
          </Button>
          {stageActions(applicant).map((x) => (
            <Button
              key={x.label}
              size="xs"
              leftSection={<AppIcon name={x.icon} />}
              onClick={x.label === 'Review KYC' ? () => setReviewOpen(true) : undefined}
            >
              {x.label}
            </Button>
          ))}
          <Button
            size="xs"
            color="red"
            leftSection={<AppIcon name="trash" />}
            onClick={() => setDeleteOpen(true)}
          >
            Delete profile
          </Button>
        </>
      }
    >
      {notice && (
        <Alert
          color="green"
          variant="light"
          withCloseButton
          onClose={() => setNotice(null)}
          icon={<AppIcon name="circle-check" />}
          mb="md"
        >
          <Text size="sm">{notice}</Text>
        </Alert>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* profile summary */}
        <div className={`${CARD} p-5`}>
          <div className="flex flex-col items-center border-b border-gray-100 pb-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-subtle text-xl font-medium text-brand-dark">
              {initials(applicant.name)}
            </div>
            <div className="mt-3 text-base font-medium text-gray-800">{applicant.name}</div>
            <div className="text-xs text-gray-500">{applicant.occupation}</div>
            <div className="mt-3 flex gap-2">
              <Badge variant="light" color={status.color} radius="sm" size="sm">
                {status.label}
              </Badge>
              <Badge variant="outline" color={applicant.isReturning ? 'brand' : 'gray'} radius="sm" size="sm">
                {applicant.isReturning ? 'Returning' : 'New'}
              </Badge>
            </div>
          </div>

          <ul className="space-y-3 pt-4">
            {details.map((d) => (
              <li key={d.icon} className="flex items-start gap-3 text-sm text-gray-700">
                <AppIcon name={d.icon} className="mt-0.5 w-4 text-center text-gray-400" />
                <span className="min-w-0 break-words">{d.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* tabs */}
        <div className={CARD}>
          <Tabs defaultValue="overview" color="brand">
            <Tabs.List className="flex-nowrap overflow-x-auto px-3">
              {TABS.map((t) => (
                <Tabs.Tab key={t.value} value={t.value} className="whitespace-nowrap">
                  {t.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>

            <div className="p-5">
              <Tabs.Panel value="overview">
                <OverviewTab applicant={applicant} />
              </Tabs.Panel>
              <Tabs.Panel value="kyc">
                <KycTab applicant={applicant} onReview={() => setReviewOpen(true)} />
              </Tabs.Panel>
              <Tabs.Panel value="financial">
                <FinancialTab applicant={applicant} />
              </Tabs.Panel>
              <Tabs.Panel value="accounts">
                <AccountsTab applicant={applicant} />
              </Tabs.Panel>
              <Tabs.Panel value="loans">
                <LoansTab applicant={applicant} />
              </Tabs.Panel>
              <Tabs.Panel value="activity">
                <ActivityTab applicant={applicant} />
              </Tabs.Panel>
            </div>
          </Tabs>
        </div>
      </div>

      <KycDecisionDialog
        applicant={reviewOpen ? applicant : null}
        onClose={() => setReviewOpen(false)}
        onDecided={(_, decision) =>
          setStatusOverride(decision === 'APPROVED' ? 'KYC_APPROVED' : 'REJECTED')
        }
      />

      <ApplicantEditDialog
        opened={editOpen}
        applicant={applicant}
        onClose={() => setEditOpen(false)}
        onSubmit={saveEdit}
      />

      <ContractConfirmDialog
        opened={deleteOpen}
        title={deleteBlock ? 'Cannot delete profile' : 'Delete profile'}
        message={
          deleteBlock ??
          `Delete ${applicant.name} (${applicant.applicantNo})? Their documents and KYC records are removed with the profile. This cannot be undone.`
        }
        confirmLabel="Delete profile"
        onClose={() => setDeleteOpen(false)}
        onConfirm={removeApplicant}
      />
    </DashboardLayout>
  )
}