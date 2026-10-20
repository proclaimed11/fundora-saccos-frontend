import { useState } from 'react'
import { Badge, Button, Drawer, Modal, Stepper, Text, Textarea } from '@mantine/core'
import dayjs from 'dayjs'
import { DashboardLayout } from '../../components/layout/dashboardLayout'
import { StatWidget } from '../../components/statsWidgets'
import { CustomTable,type CustomTableColumn  } from '../../components/customTable/customTable'
import { useNavigate } from 'react-router-dom'

type ApplicantStatus = 'PENDING_OTP' | 'PENDING_KYC' | 'KYC_APPROVED' | 'REJECTED'

type Applicant = {
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
const applicants: Applicant[] = [
  { id: 1, applicantNo: 'APP-1786436767272', name: 'John Doe', phone: '0700000000', email: 'john@example.com', occupation: 'Software Engineer', location: 'Dar es Salaam City Center', nationality: 'Tanzanian', status: 'KYC_APPROVED', isReturning: false, registered: '2026-08-11' },
  { id: 2, applicantNo: 'APP-1786436767301', name: 'Amina Juma', phone: '0712345678', email: 'amina@example.com', occupation: 'Trader', location: 'Kariakoo', nationality: 'Tanzanian', status: 'PENDING_KYC', isReturning: true, registered: '2026-09-02' },
  { id: 3, applicantNo: 'APP-1786436767455', name: 'Peter Mwakyusa', phone: '0755111222', email: 'peter@example.com', occupation: 'Teacher', location: 'Mbeya', nationality: 'Tanzanian', status: 'PENDING_OTP', isReturning: false, registered: '2026-09-14' },
  { id: 4, applicantNo: 'APP-1786436767512', name: 'Grace Mushi', phone: '0766333444', email: 'grace@example.com', occupation: 'Nurse', location: 'Arusha', nationality: 'Tanzanian', status: 'REJECTED', isReturning: false, registered: '2026-09-20' },
  { id: 5, applicantNo: 'APP-1786436767690', name: 'Hassan Said', phone: '0688555666', email: 'hassan@example.com', occupation: 'Driver', location: 'Dodoma', nationality: 'Tanzanian', status: 'KYC_APPROVED', isReturning: true, registered: '2026-09-28' },
  { id: 6, applicantNo: 'APP-1786436767744', name: 'Neema Kileo', phone: '0654777888', email: 'neema@example.com', occupation: 'Shop Owner', location: 'Moshi', nationality: 'Tanzanian', status: 'PENDING_KYC', isReturning: false, registered: '2026-10-01' },
]

// here `color` is the icon color
const stats = [
  { label: 'Total Applicants', value: 6, icon: 'fa-users', color: '#45bdfc' },
  { label: 'Pending OTP', value: 1, icon: 'fa-hourglass-half', color: '#8e44ad' },
  { label: 'Pending KYC', value: 2, icon: 'fa-id-card-o', color: '#e08a1e' },
  { label: 'KYC Approved', value: 2, icon: 'fa-check-circle-o', color: '#39d128' },
  { label: 'Rejected', value: 1, icon: 'fa-times-circle-o', color: '#ef4444' },
]

const STATUS: Record<ApplicantStatus, { label: string; color: string; step: number }> = {
  PENDING_OTP: { label: 'Pending OTP', color: 'gray', step: 1 },
  PENDING_KYC: { label: 'Pending KYC', color: 'yellow', step: 2 },
  KYC_APPROVED: { label: 'KYC Approved', color: 'green', step: 3 },
  REJECTED: { label: 'Rejected', color: 'red', step: 2 },
}

// dropdown options for the Status header filter
const statusOptions = (Object.keys(STATUS) as ApplicantStatus[]).map((s) => ({
  value: s,
  label: STATUS[s].label,
}))

// dropdown options for the Type header filter (values are the true/false text of isReturning)
const typeOptions = [
  { value: 'true', label: 'Returning' },
  { value: 'false', label: 'New' },
]

// which buttons show for each stage (display only)
function stageActions(a: Applicant): { label: string; icon: string }[] {
  const list: { label: string; icon: string }[] = []
  if (a.status === 'PENDING_OTP') list.push({ label: 'Send OTP', icon: 'fa-envelope-o' })
  if (a.status === 'PENDING_KYC') list.push({ label: 'Review KYC', icon: 'fa-id-card-o' })
  if (a.isReturning && a.status !== 'REJECTED') list.push({ label: 'Re-check KYC', icon: 'fa-refresh' })
  if (a.status === 'KYC_APPROVED') list.push({ label: 'Start loan application', icon: 'fa-file-text-o' })
  return list
}

function StatusBadge({ status }: { status: ApplicantStatus }) {
  return (
    <Badge variant="light" color={STATUS[status].color} radius="sm" size="sm">
      {STATUS[status].label}
    </Badge>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-800">{value}</span>
    </div>
  )
}

export function Applicants() {
  // open/close only, so every screen can be previewed
  const navigate = useNavigate()
  const [selected, setSelected] = useState<Applicant | null>(null)
  const [kycFor, setKycFor] = useState<Applicant | null>(null)

  const columns: CustomTableColumn<Applicant>[] = [
    {
      accessor: 'name',
      header: 'Applicant',
      render: (a) => (
        <div className="min-w-0">
            <div className="truncate text-sm font-medium text-gray-800">{a.name}</div>
            <div className="truncate text-xs text-gray-500">{a.applicantNo}</div>
        </div>
      ),
    },
    {
      accessor: 'phone',
      header: 'Contact',
      render: (a) => (
        <div>
          <div className="text-xs text-gray-800">{a.phone}</div>
          <div className="text-[11px] text-gray-500">{a.email}</div>
        </div>
      ),
    },
    {
      accessor: 'occupation',
      header: 'Occupation',
      render: (a) => (
        <div>
          <div className="text-xs text-gray-800">{a.occupation}</div>
          <div className="text-[11px] text-gray-500">{a.location}</div>
        </div>
      ),
    },
    {
      accessor: 'status',
      header: 'Status',
      render: (a) => <StatusBadge status={a.status} />,
    },
    {
      accessor: 'isReturning',
      header: 'Type',
      render: (a) => (
        <Badge variant="outline" color={a.isReturning ? 'brand' : 'gray'} radius="sm" size="sm">
          {a.isReturning ? 'Returning' : 'New'}
        </Badge>
      ),
      exportValue: (a) => (a.isReturning ? 'Returning' : 'New'),
    },
    {
      accessor: 'registered',
      header: 'Registered',
      type: 'date',
    },
  ]

  return (
    <DashboardLayout
      title="Applicants"
      subtitle="Manage all applicants"
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Applicants' }]}
      actions={
        // inactive for now: no click handler until the form is built
      <Button
        size="xs"
        radius="xs"
        leftSection={<i className="fa fa-user-plus" aria-hidden="true" />}
        onClick={() => navigate('/applicants/new')}
      >
        New applicant
      </Button>
      }
    >
      {/* row 1: key numbers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((s) => (
          <StatWidget key={s.label} {...s} />
        ))}
      </div>

      {/* row 2: table in a plain card, no heading */}
      <div className="mt-4 rounded-md bg-white p-4 shadow-[0_10px_30px_rgba(76,87,125,0.12)]">
        <CustomTable<Applicant>
        size="md"
        data={applicants}
        columns={columns}
        searchInput
        searchPlaceholder="Search applicant"
        searchKeys={['name', 'applicantNo', 'phone']}
        filters={{ status: statusOptions, isReturning: typeOptions, registered: 'date' }}
        selectCheckbox
        onDelete={() => {}} // UI only for now: shows the Delete selected button and confirm dialog
        defaultSort={{ accessor: 'registered', direction: 'desc' }}
        onRowClick={(row) => navigate(`/applicants/${row.id}`)}
        exportCsv
        exportFileName="applicants"
        print
        printTitle="Applicants"
        />
      </div>

      {/* detail drawer */}
      <Drawer
        opened={!!selected}
        onClose={() => setSelected(null)}
        position="right"
        size="md"
        title={selected?.name ?? ''}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <StatusBadge status={selected.status} />
              <Text size="xs" c="dimmed">
                {selected.applicantNo}
              </Text>
            </div>

            <Stepper
              active={STATUS[selected.status].step}
              size="xs"
              color={selected.status === 'REJECTED' ? 'red' : 'brand'}
            >
              <Stepper.Step label="Registered" />
              <Stepper.Step label="OTP verified" />
              <Stepper.Step label="KYC approved" />
            </Stepper>

            <div>
              <Field label="Phone" value={selected.phone} />
              <Field label="Email" value={selected.email} />
              <Field label="Nationality" value={selected.nationality} />
              <Field label="Occupation" value={selected.occupation} />
              <Field label="Location" value={selected.location} />
              <Field label="Returning" value={selected.isReturning ? 'Yes' : 'No'} />
              <Field label="Registered" value={dayjs(selected.registered).format('MMM D, YYYY')} />
            </div>

            <div className="flex flex-wrap gap-2">
              {stageActions(selected).map((x) => (
                <Button
                  key={x.label}
                  size="xs"
                  radius="xs"
                  variant={x.label === 'Start loan application' ? 'filled' : 'default'}
                  leftSection={<i className={`fa ${x.icon}`} aria-hidden="true" />}
                  onClick={x.label === 'Review KYC' ? () => setKycFor(selected) : undefined}
                >
                  {x.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Drawer>

      {/* KYC decision dialog */}
      <Modal opened={!!kycFor} onClose={() => setKycFor(null)} title="KYC decision" centered>
        {kycFor && (
          <div className="space-y-4">
            <div>
              <Text fw={600}>{kycFor.name}</Text>
              <Text size="xs" c="dimmed">
                {kycFor.applicantNo}
              </Text>
            </div>
            <Textarea
              label="Remarks"
              placeholder="Add a note about the documents checked"
              minRows={3}
              autosize
            />
            <Text size="xs" c="dimmed">
              Rejecting stops this applicant's loan application. Approval is valid for 12 months.
            </Text>
            <div className="flex justify-end gap-2">
              <Button size="xs" radius="xs" color="red" variant="light">
                Reject
              </Button>
              <Button size="xs" radius="xs">
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}