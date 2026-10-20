import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { Badge, Button, Tabs, Text } from '@mantine/core'
import { DashboardLayout } from '../../components/layout/dashboardLayout'
import { formatTzs } from '../../utils/format'
import {
  applications,
  contractFor,
  methodLabel,
  STATUS,
  type LoanApplication,
} from './loanApplicationsData'
import {
  ActivityTab,
  ApprovalsTab,
  ContractTab,
  OverviewTab,
  RequirementsTab,
  ScheduleTab,
} from './loanApplicationProfileTabs'
import { SignedContractDialog } from './contractDialogs'

const CARD = 'rounded-md bg-white shadow-[0_10px_30px_rgba(76,87,125,0.12)]'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'requirements', label: 'Requirements' },
  { value: 'approvals', label: 'Approvals' },
  { value: 'contract', label: 'Contract' },
  { value: 'schedule', label: 'Repayment estimate' },
  { value: 'activity', label: 'Activity' },
]

const today = () => dayjs().format('YYYY-MM-DD')

export function LoanApplicationProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState<string | null>('overview')
  const [uploadOpen, setUploadOpen] = useState(false)
  // UI only: the signed upload changes the application for this session, nothing is saved yet
  const [changes, setChanges] = useState<Partial<LoanApplication>>({})

  const base = applications.find((a) => String(a.id) === id)
  const application = base ? { ...base, ...changes } : undefined

  if (!application) {
    return (
      <DashboardLayout
        title="Application not found"
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Loan applications', to: '/loan-applications' },
          { label: 'Not found' },
        ]}
      >
        <div className={`${CARD} p-6`}>
          <Text size="sm">We couldn't find that loan application.</Text>
          <Button mt="md" size="xs" variant="default" onClick={() => navigate('/loan-applications')}>
            Back to applications
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const status = STATUS[application.status]
  const contract = contractFor(application)

  const apply = (patch: Partial<LoanApplication>, nextTab = 'contract') => {
    setChanges((c) => ({ ...c, ...patch }))
    setUploadOpen(false)
    setTab(nextTab) // show the result of the action
  }

  const details = [
    {
      icon: 'fa-percent',
      label: 'Interest',
      value: `${application.interestRate}% p.a. · ${methodLabel(application.interestMethod)}`,
    },
    { icon: 'fa-calendar', label: 'Tenure', value: `${application.tenure} months` },
    { icon: 'fa-briefcase', label: 'Loan officer', value: application.loanOfficer },
    { icon: 'fa-calendar-o', label: 'Created', value: dayjs(application.created).format('MMM D, YYYY') },
    {
      icon: 'fa-paper-plane-o',
      label: 'Submitted',
      value: application.submittedAt ? dayjs(application.submittedAt).format('MMM D, YYYY') : 'Not yet',
    },
  ]

  return (
    <DashboardLayout
      title={application.applicationNo}
      subtitle={application.applicantName}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Loan applications', to: '/loan-applications' },
        { label: application.applicationNo },
      ]}
      actions={
        // the same three buttons for every application, whatever its stage
        <>
          <Button
            size="xs"
            radius="xs"
            variant="default"
            leftSection={<i className="fa fa-user-o" aria-hidden="true" />}
            onClick={() => navigate(`/applicants/${application.applicantId}`)}
          >
            View applicant
          </Button>
          <Button
            size="xs"
            radius="xs"
            leftSection={<i className="fa fa-pencil" aria-hidden="true" />}
            onClick={() => navigate(`/loan-applications/new?applicantId=${application.applicantId}`)}
          >
            Continue application
          </Button>
          {/* inactive for now: no click handler until cancelling is wired up */}
          <Button
            size="xs"
            radius="xs"
            color="red"
            leftSection={<i className="fa fa-times" aria-hidden="true" />}
          >
            Cancel application
          </Button>
        </>
      }
    >
      <div className="grid items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* application summary */}
        <div className={`${CARD} p-5`}>
          <div className="flex flex-col items-center border-b border-gray-100 pb-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
              <i className="fa fa-file-text-o" aria-hidden="true" />
            </div>
            <div className="mt-3 text-lg font-medium text-gray-800">
              {formatTzs(application.requestedAmount)}
            </div>
            <button
              type="button"
              className="text-xs text-green-700 hover:underline"
              onClick={() => navigate(`/applicants/${application.applicantId}`)}
            >
              {application.applicantName}
            </button>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Badge variant="light" color={status.color} radius="sm" size="sm">
                {status.label}
              </Badge>
              <Badge variant="outline" color="gray" radius="sm" size="sm">
                {methodLabel(application.interestMethod)}
              </Badge>
            </div>
            {contract && (
              <div className="mt-2 text-[11px] text-gray-500">
                Contract: {contract.status.charAt(0) + contract.status.slice(1).toLowerCase()}
              </div>
            )}
            {application.status === 'DRAFT' && (
              <div className="mt-2 text-[11px] text-gray-500">
                Stopped at: {application.currentStage.replaceAll('_', ' ').toLowerCase()}
              </div>
            )}
          </div>

          <ul className="space-y-3 pt-4">
            {details.map((d) => (
              <li key={d.label} className="flex items-start gap-3 text-sm text-gray-700">
                <i className={`fa ${d.icon} mt-0.5 w-4 text-center text-gray-400`} aria-hidden="true" />
                <div className="min-w-0">
                  <div className="text-[11px] text-gray-400">{d.label}</div>
                  <div className="break-words">{d.value}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* tabs */}
        <div className={CARD}>
          <Tabs value={tab} onChange={setTab} color="brand">
            <Tabs.List className="flex-nowrap overflow-x-auto px-3">
              {TABS.map((t) => (
                <Tabs.Tab key={t.value} value={t.value} className="whitespace-nowrap">
                  {t.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>

            <div className="p-5">
              <Tabs.Panel value="overview">
                <OverviewTab application={application} />
              </Tabs.Panel>
              <Tabs.Panel value="requirements">
                <RequirementsTab application={application} />
              </Tabs.Panel>
              <Tabs.Panel value="approvals">
                <ApprovalsTab application={application} />
              </Tabs.Panel>
              <Tabs.Panel value="contract">
                <ContractTab application={application} onUploadSigned={() => setUploadOpen(true)} />
              </Tabs.Panel>
              <Tabs.Panel value="schedule">
                <ScheduleTab application={application} />
              </Tabs.Panel>
              <Tabs.Panel value="activity">
                <ActivityTab application={application} />
              </Tabs.Panel>
            </div>
          </Tabs>
        </div>
      </div>

      {/* opened from the Upload signed contract button in the Contract tab */}
      <SignedContractDialog
        opened={uploadOpen}
        contractNo={contract?.contractNo ?? ''}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => apply({ status: 'CONTRACT_SIGNED', contractSignedAt: today() })}
      />
    </DashboardLayout>
  )
}