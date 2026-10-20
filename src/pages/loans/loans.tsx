import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { ActionIcon, Badge, Menu, Progress, SegmentedControl, Text } from '@mantine/core'
import { DashboardLayout } from '../../components/layout/dashboardLayout'
import { StatWidget } from '../../components/statsWidgets'
import { CustomTable, type CustomTableColumn } from '../../components/customTable/customTable'
import { formatTzs } from '../../utils/format'
import {
  LOANS,
  LOAN_STATE,
  NPL_STYLE,
  SAMPLE_PAYMENTS,
  SAMPLE_PENALTIES,
  methodLabel,
  viewOf,
  type LoanState,
  type LoanView,
} from './loanApplicationsData'

const CARD = 'rounded-md bg-white shadow-[0_10px_30px_rgba(76,87,125,0.12)]'

type TabKey = 'active' | 'overdue' | 'npl' | 'closed' | 'all'

const TAB_EMPTY: Record<TabKey, string> = {
  active: 'No loans are being repaid',
  overdue: 'No loans are overdue',
  npl: 'No loans are non-performing',
  closed: 'No loans have been fully repaid yet',
  all: 'No loans have been disbursed yet',
}

const stateOptions = (Object.keys(LOAN_STATE) as LoanState[]).map((s) => ({
  value: s,
  label: LOAN_STATE[s].label,
}))

// SAMPLE ONLY: replaced by GET /api/loans and the balance endpoint later
const ROWS: LoanView[] = LOANS.map((l) => viewOf(l, SAMPLE_PAYMENTS, SAMPLE_PENALTIES))

export function LoansPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabKey>('active')

  const active = ROWS.filter((r) => r.state !== 'CLOSED')
  const overdue = ROWS.filter((r) => r.state === 'OVERDUE')
  const npl = ROWS.filter((r) => r.isNpl)
  const closed = ROWS.filter((r) => r.state === 'CLOSED')
  const outstanding = active.reduce((s, r) => s + r.outstanding, 0)
  const collected = SAMPLE_PAYMENTS.filter((p) => dayjs(p.date).isSame(dayjs(), 'month')).reduce(
    (s, p) => s + p.amount,
    0,
  )

  const tabData: Record<TabKey, LoanView[]> = { active, overdue, npl, closed, all: ROWS }

  // here `color` is the icon color
  const stats = [
    { label: 'Active Loans', value: active.length, icon: 'fa-briefcase', color: '#45bdfc' },
    { label: 'Overdue', value: overdue.length, icon: 'fa-clock-o', color: '#e08a1e' },
    { label: 'Non-performing', value: npl.length, icon: 'fa-exclamation-triangle', color: '#ef4444' },
    { label: 'Total Outstanding', value: formatTzs(outstanding), miniLabel: 'TZS', icon: 'fa-money', color: '#8e44ad' },
    { label: 'Collected This Month', value: formatTzs(collected), miniLabel: 'TZS', icon: 'fa-check-circle-o', color: '#39d128' },
  ]

  const columns: CustomTableColumn<LoanView>[] = [
    {
      accessor: 'applicantName',
      header: 'Borrower',
      render: (r) => (
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-gray-800">{r.applicantName}</div>
          <div className="truncate text-xs text-gray-500">{r.loanNo}</div>
        </div>
      ),
      exportValue: (r) => `${r.loanNo} (${r.applicantName})`,
    },
    {
      accessor: 'principal',
      header: 'Loan',
      render: (r) => (
        <div>
          <div className="whitespace-nowrap text-sm font-medium text-gray-800">{formatTzs(r.principal)}</div>
          <div className="whitespace-nowrap text-xs text-gray-500">
            {r.tenure} months · {r.interestRate}% · {methodLabel(r.interestMethod)}
          </div>
        </div>
      ),
      exportValue: (r) => r.principal,
    },
    {
      accessor: 'outstanding',
      header: 'Outstanding',
      render: (r) => (
        <div className="w-36">
          <div className="whitespace-nowrap text-sm font-medium text-gray-800">{formatTzs(r.outstanding)}</div>
          <Progress value={r.repaidPct} size="xs" radius="xl" color="brand" mt={4} />
          <div className="mt-0.5 text-[11px] text-gray-500">{r.repaidPct}% repaid</div>
        </div>
      ),
      exportValue: (r) => r.outstanding,
    },
    {
      // sorting by this puts the worst overdue loans first
      accessor: 'overdueDays',
      header: 'Next due',
      render: (r) => {
        if (!r.next) return <span className="text-xs text-gray-400">Fully repaid</span>

        if (r.overdueDays > 0) {
          return (
            <div>
              <div className="whitespace-nowrap text-sm font-medium text-red-600">
                <i className="fa fa-exclamation-triangle mr-1" aria-hidden="true" />
                {r.overdueDays} days overdue
              </div>
              <div className="whitespace-nowrap text-xs text-gray-500">{formatTzs(r.overdueAmount)} past due</div>
            </div>
          )
        }

        const days = dayjs(r.next.dueDate).startOf('day').diff(dayjs().startOf('day'), 'day')
        return (
          <div>
            <div className="whitespace-nowrap text-sm text-gray-800">{dayjs(r.next.dueDate).format('MMM D, YYYY')}</div>
            <div className="whitespace-nowrap text-xs text-gray-500">
              {days === 0 ? 'Due today' : `In ${days} days`} · {formatTzs(r.next.outstanding)}
            </div>
          </div>
        )
      },
      exportValue: (r) => r.overdueDays,
    },
    {
      accessor: 'state',
      header: 'Status',
      sortable: false,
      render: (r) => (
        <div className="space-y-1">
          <Badge variant="light" color={LOAN_STATE[r.state].color} radius="sm" size="sm">
            {LOAN_STATE[r.state].label}
          </Badge>
          {r.state === 'OVERDUE' && (
            <div>
              <Badge variant="outline" color={NPL_STYLE[r.classification].color} radius="sm" size="sm">
                {r.isNpl ? 'NPL · ' : ''}
                {NPL_STYLE[r.classification].label}
              </Badge>
            </div>
          )}
        </div>
      ),
      exportValue: (r) => LOAN_STATE[r.state].label,
    },
    {
      accessor: 'disbursed',
      header: 'Disbursed',
      type: 'date',
    },
    {
      // the ⋮ menu holds every action; "id" is only used as the accessor
      accessor: 'id',
      header: 'Actions',
      sortable: false,
      align: 'right',
      width: 80,
      render: (r) => (
        // stop the click so the row doesn't also open the loan
        <div onClick={(e) => e.stopPropagation()}>
          <Menu position="bottom-end" shadow="md" width={220}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm" aria-label={`Actions for ${r.loanNo}`}>
                <i className="fa fa-ellipsis-v" aria-hidden="true" />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {r.state !== 'CLOSED' && (
                <>
                  <Menu.Item
                    fw={500}
                    leftSection={<i className="fa fa-money" aria-hidden="true" />}
                    onClick={() => navigate(`/loans/${r.id}?pay=1`)}
                  >
                    Record payment
                  </Menu.Item>
                  <Menu.Divider />
                </>
              )}
              <Menu.Item leftSection={<i className="fa fa-eye" aria-hidden="true" />} onClick={() => navigate(`/loans/${r.id}`)}>
                View loan
              </Menu.Item>
              <Menu.Item
                leftSection={<i className="fa fa-user-o" aria-hidden="true" />}
                onClick={() => navigate(`/applicants/${r.applicantId}`)}
              >
                View borrower
              </Menu.Item>
              {r.applicationId && (
                <Menu.Item
                  leftSection={<i className="fa fa-file-text-o" aria-hidden="true" />}
                  onClick={() => navigate(`/loan-applications/${r.applicationId}`)}
                >
                  View application
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout
      title="Loans"
      subtitle="Disbursed loans and their repayments"
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Loans' }, { label: 'Active loans' }]}
    >
      <div className="space-y-4">
        {/* row 1: key numbers */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map((s) => (
            <StatWidget key={s.label} {...s} />
          ))}
        </div>

        {/* row 2: table in a plain card */}
        <div className={`${CARD} p-4`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-full overflow-x-auto">
              <SegmentedControl
                size="xs"
                value={tab}
                onChange={(v) => setTab(v as TabKey)}
                data={[
                  { value: 'active', label: `Active (${active.length})` },
                  { value: 'overdue', label: `Overdue (${overdue.length})` },
                  { value: 'npl', label: `Non-performing (${npl.length})` },
                  { value: 'closed', label: `Closed (${closed.length})` },
                  { value: 'all', label: `All (${ROWS.length})` },
                ]}
              />
            </div>
            <Text size="xs" c="dimmed">
              Outstanding {formatTzs(outstanding)} · Past due {formatTzs(overdue.reduce((s, r) => s + r.overdueAmount, 0))}
            </Text>
          </div>

          <CustomTable<LoanView>
            size="md"
            data={tabData[tab]}
            columns={columns}
            searchInput
            searchPlaceholder="Search borrower or loan"
            searchKeys={['loanNo', 'applicantName', 'loanOfficer']}
            filters={{ state: stateOptions, disbursed: 'date' }}
            // the most overdue loans first
            defaultSort={{ accessor: 'overdueDays', direction: 'desc' }}
            noRecordText={TAB_EMPTY[tab]}
            onRowClick={(row) => navigate(`/loans/${row.id}`)}
            exportCsv
            exportFileName="loans"
            print
            printTitle="Loans"
          />
        </div>
      </div>
    </DashboardLayout>
  )
}