import { AppIcon } from '../../components/appIcon'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { ActionIcon, Alert, Badge, Button, Drawer, Menu, SegmentedControl, Text } from '@mantine/core'
import { DashboardLayout } from '../../components/layout/dashboardLayout'
import { StatWidget } from '../../components/statsWidgets'
import { CustomTable, type CustomTableColumn } from '../../components/customTable/customTable'
import { formatTzs } from '../../utils/format'
import { CURRENT_USER } from './disbursementDialog'
import { RemarksDialog } from '../collections/collectionDialogs'
import { useRoles } from '../administration/roles/rolesContext'
import { STATUS as APPLICATION_STATUS } from './loanApplicationsData'
import {
  ASSET_ROWS,
  GUARANTOR_ROWS,
  MAX_GUARANTOR_EXPOSURE,
  type AssetRow,
  type GuarantorRow,
} from './securitiesData'

const CARD = 'rounded-md bg-white shadow-[0_10px_30px_rgba(76,87,125,0.12)]'

type TabKey = 'assets' | 'guarantors'
type AssetStatus = 'PENDING' | 'HELD' | 'RELEASABLE' | 'RELEASED'
type Release = { date: string; by: string; remarks: string }
type AssetView = AssetRow & { status: AssetStatus; release: Release | null }
type Notice = { text: string; color: 'green' | 'blue' } | null

const ASSET_STATUS: Record<AssetStatus, { label: string; color: string }> = {
  PENDING: { label: 'Not verified', color: 'gray' },
  HELD: { label: 'Held as security', color: 'blue' },
  RELEASABLE: { label: 'Can be released', color: 'yellow' },
  RELEASED: { label: 'Released', color: 'teal' },
}

const statusOptions = (Object.keys(ASSET_STATUS) as AssetStatus[]).map((s) => ({
  value: s,
  label: ASSET_STATUS[s].label,
}))

const TAB_EMPTY: Record<TabKey, string> = {
  assets: 'No collateral has been recorded yet',
  guarantors: 'No guarantors have been recorded yet',
}

/* ---------- small pieces ---------- */

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-800">{value}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text size="sm" fw={600} mb={4}>
      {children}
    </Text>
  )
}

function StatusBadge({ status }: { status: AssetStatus }) {
  return (
    <Badge variant="light" color={ASSET_STATUS[status].color} radius="sm" size="sm">
      {ASSET_STATUS[status].label}
    </Badge>
  )
}

/* ---------- collateral drawer ---------- */

type AssetDrawerProps = {
  row: AssetView
  canRelease: boolean
  onRelease: (r: AssetView) => void
  onOpenApplication: (r: AssetView) => void
  onOpenLoan: (r: AssetView) => void
}

function AssetDrawerBody({ row: r, canRelease, onRelease, onOpenApplication, onOpenLoan }: AssetDrawerProps) {
  const share = r.value > 0 ? Math.round((r.loanAmount / r.value) * 100) : 0
  const tiles = [
    { label: 'Estimated value', value: formatTzs(r.value) },
    { label: 'Loan amount', value: formatTzs(r.loanAmount) },
    { label: 'Loan as share of value', value: `${share}%` },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={r.status} />
        <Text size="xs" c="dimmed">
          {r.applicationNo} · {r.applicantName}
        </Text>
      </div>

      {r.status === 'RELEASABLE' && (
        <div className="rounded-md border border-brand/20 bg-brand-subtle p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-dark">Next step</div>
          <p className="mt-1 text-sm text-gray-700">
            {r.releaseReason}, so this asset is no longer needed as security. Release it and hand the papers back to
            the borrower.
          </p>
          <div className="mt-3">
            <Button size="xs" disabled={!canRelease} leftSection={<AppIcon name="undo-2" />} onClick={() => onRelease(r)}>
              Release collateral
            </Button>
            {!canRelease && (
              <p className="mt-2 text-xs text-gray-500">Your role cannot release collateral.</p>
            )}
          </div>
        </div>
      )}

      {r.status === 'RELEASED' && r.release && (
        <Alert color="teal" variant="light" icon={<AppIcon name="circle-check" />}>
          <Text size="sm">
            Released on {dayjs(r.release.date).format('MMM D, YYYY')} by {r.release.by}. "{r.release.remarks}"
          </Text>
        </Alert>
      )}

      {r.status === 'PENDING' && (
        <Alert color="yellow" variant="light" icon={<AppIcon name="triangle-alert" />}>
          <Text size="sm">Ownership and existing pledges have not been verified yet. Verify it on the application.</Text>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-md bg-gray-50 px-4 py-3">
            <div className="text-xs text-gray-500">{t.label}</div>
            <div className="text-base font-medium text-gray-800">{t.value}</div>
          </div>
        ))}
      </div>

      <div>
        <SectionTitle>Asset details</SectionTitle>
        <Field label="Type" value={r.type} />
        <Field label="Description" value={r.description} />
        <Field label="Borrower" value={r.applicantName} />
        <Field label="Application" value={r.applicationNo} />
        <Field label="Loan" value={r.loanNo || 'No loan yet'} />
        <Field label="Verification" value={r.verified ? 'Ownership and pledge checked' : 'Not verified'} />
      </div>

      <div>
        <SectionTitle>Document</SectionTitle>
        {r.document ? (
          <div className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2.5">
            <AppIcon name="file-text" className="text-gray-400" size={20} />
            <div className="min-w-0 flex-1 truncate text-sm text-gray-800">{r.document}</div>
            <Button size="compact-xs" variant="subtle" color="brand">
              View
            </Button>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-gray-200 px-3 py-2.5 text-xs text-gray-500">
            No document uploaded
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="xs" variant="default" leftSection={<AppIcon name="external-link" />} onClick={() => onOpenApplication(r)}>
          View application
        </Button>
        {r.loanId !== null && (
          <Button size="xs" variant="default" leftSection={<AppIcon name="hand-coins" />} onClick={() => onOpenLoan(r)}>
            View loan
          </Button>
        )}
      </div>
    </div>
  )
}

/* ---------- guarantor drawer ---------- */

function GuarantorDrawerBody({ row: g, onOpenApplication }: { row: GuarantorRow; onOpenApplication: (id: number) => void }) {
  const tiles = [
    { label: 'Live exposure', value: formatTzs(g.exposure) },
    { label: 'Live guarantees', value: String(g.liveCount) },
    { label: 'Exposure limit', value: formatTzs(MAX_GUARANTOR_EXPOSURE) },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="light" color={g.overLimit ? 'red' : 'green'} radius="sm" size="sm">
          {g.overLimit ? 'Over limit' : 'Within limit'}
        </Badge>
        <Text size="xs" c="dimmed">
          {g.phone}
        </Text>
      </div>

      {g.overLimit && (
        <Alert color="red" variant="light" icon={<AppIcon name="triangle-alert" />}>
          <Text size="sm">
            This guarantor stands behind {formatTzs(g.exposure)} of live loans, which is{' '}
            {formatTzs(g.exposure - MAX_GUARANTOR_EXPOSURE)} over the limit. Be careful before accepting them again.
          </Text>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-md bg-gray-50 px-4 py-3">
            <div className="text-xs text-gray-500">{t.label}</div>
            <div className="text-base font-medium text-gray-800">{t.value}</div>
          </div>
        ))}
      </div>

      <div>
        <SectionTitle>{`Guaranteed loans (${g.guaranteed.length})`}</SectionTitle>
        <p className="mb-2 text-xs text-gray-500">
          Only loans that are still running count toward the exposure. Rejected, cancelled and fully repaid ones do not.
        </p>
        <ul className="space-y-2">
          {g.guaranteed.map((x) => (
            <li key={x.applicationId} className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-800">{x.borrower}</div>
                <div className="truncate text-xs text-gray-500">
                  {x.applicationNo}
                  {x.loanNo ? ` · ${x.loanNo}` : ''} · {x.relationship} · {formatTzs(x.amount)}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="light" color={APPLICATION_STATUS[x.status].color} radius="sm" size="sm">
                  {APPLICATION_STATUS[x.status].label}
                </Badge>
                <Text size="xs" c={x.live ? undefined : 'dimmed'}>
                  {x.live ? 'Counts' : 'Not counted'}
                </Text>
              </div>
              <ActionIcon variant="subtle" color="gray" size="sm" aria-label={`Open ${x.applicationNo}`} onClick={() => onOpenApplication(x.applicationId)}>
                <AppIcon name="external-link" />
              </ActionIcon>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---------- page ---------- */

export function SecuritiesPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { can } = useRoles()
  const canRelease = can('loans', 'edit', 'securities')

  // UI only: releases made in this session, nothing is saved yet
  const [releases, setReleases] = useState<Record<string, Release>>({})
  const [tab, setTab] = useState<TabKey>('assets')
  const [releaseId, setReleaseId] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice>(null)

  // success banners fade away on their own
  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 9000)
    return () => clearTimeout(t)
  }, [notice])

  const assets = useMemo<AssetView[]>(
    () =>
      ASSET_ROWS.map((r) => {
        const release = releases[r.id] ?? null
        const status: AssetStatus = release ? 'RELEASED' : r.releasable ? 'RELEASABLE' : r.verified ? 'HELD' : 'PENDING'
        return { ...r, status, release }
      }),
    [releases],
  )

  const held = assets.filter((r) => r.status === 'HELD' || r.status === 'PENDING')
  const releasable = assets.filter((r) => r.status === 'RELEASABLE')
  const notVerified = assets.filter((r) => r.status === 'PENDING')
  const overLimit = GUARANTOR_ROWS.filter((g) => g.overLimit)

  // here `color` is the icon color
  const stats = [
    { label: 'Assets Held', value: held.length, icon: 'shield', color: '#45bdfc' },
    { label: 'Value Held', value: formatTzs(held.reduce((s, r) => s + r.value, 0)), icon: 'banknote', color: '#8e44ad' },
    { label: 'Can Be Released', value: releasable.length, icon: 'undo-2', color: '#e08a1e' },
    { label: 'Not Verified', value: notVerified.length, icon: 'triangle-alert', color: '#0077b5' },
    { label: 'Guarantors Over Limit', value: overLimit.length, icon: 'user-round', color: '#ef4444' },
  ]

  // /collateral-guarantors?asset=3-1 or ?guarantor=joseph-massawe opens that drawer
  const assetParam = params.get('asset')
  const guarantorParam = params.get('guarantor')
  const selectedAsset = assetParam ? (assets.find((r) => r.id === assetParam) ?? null) : null
  const selectedGuarantor = guarantorParam ? (GUARANTOR_ROWS.find((g) => g.id === guarantorParam) ?? null) : null
  const openAsset = (id: string) => setParams({ asset: id }, { replace: true })
  const openGuarantor = (id: string) => setParams({ guarantor: id }, { replace: true })
  const closeView = () => setParams({}, { replace: true })

  const releasing = releaseId ? assets.find((r) => r.id === releaseId && r.status === 'RELEASABLE') : undefined

  const release = (remarks: string) => {
    if (!releasing || !canRelease) return
    // TODO: POST /api/collateral-releases (raw CRUD, there is no workflow endpoint yet)
    //       { collateralId, releasedBy, remarks }
    setReleases((all) => ({
      ...all,
      [releasing.id]: { date: dayjs().format('YYYY-MM-DD'), by: CURRENT_USER, remarks },
    }))
    setNotice({ color: 'green', text: `The ${releasing.type.toLowerCase()} of ${releasing.applicantName} was released.` })
    setReleaseId(null)
  }

  /* ---------- columns ---------- */

  const assetColumns: CustomTableColumn<AssetView>[] = [
    {
      accessor: 'type',
      header: 'Asset',
      render: (r) => (
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-gray-800">{r.type}</div>
          <div className="max-w-[260px] truncate text-xs text-gray-500">{r.description}</div>
        </div>
      ),
      exportValue: (r) => `${r.type} (${r.description})`,
    },
    {
      accessor: 'applicantName',
      header: 'Borrower',
      render: (r) => (
        <div className="min-w-0">
          <div className="truncate text-sm text-gray-800">{r.applicantName}</div>
          <div className="truncate text-xs text-gray-500">{r.applicationNo}</div>
        </div>
      ),
      exportValue: (r) => `${r.applicationNo} (${r.applicantName})`,
    },
    {
      accessor: 'value',
      header: 'Value',
      render: (r) => <span className="whitespace-nowrap text-sm font-medium text-gray-800">{formatTzs(r.value)}</span>,
      exportValue: (r) => r.value,
    },
    {
      accessor: 'loanNo',
      header: 'Loan',
      render: (r) =>
        r.loanNo ? (
          <div>
            <div className="text-sm text-gray-800">{r.loanNo}</div>
            <div className="text-xs text-gray-500">{r.loanState === 'CLOSED' ? 'Fully repaid' : 'Running'}</div>
          </div>
        ) : (
          <span className="text-xs text-gray-400">No loan yet</span>
        ),
      exportValue: (r) => r.loanNo,
    },
    {
      accessor: 'status',
      header: 'Status',
      sortable: false,
      render: (r) => <StatusBadge status={r.status} />,
      exportValue: (r) => ASSET_STATUS[r.status].label,
    },
    {
      // the ⋮ menu holds every action; "id" is only used as the accessor
      accessor: 'id',
      header: 'Actions',
      sortable: false,
      align: 'right',
      width: 80,
      render: (r) => (
        // stop the click so the row doesn't also open the drawer
        <div onClick={(e) => e.stopPropagation()}>
          <Menu position="bottom-end" shadow="md" width={230}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm" aria-label={`Actions for ${r.type} of ${r.applicantName}`}>
                <AppIcon name="ellipsis-vertical" />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {r.status === 'RELEASABLE' && (
                <>
                  <Menu.Item
                    fw={500}
                    disabled={!canRelease}
                    leftSection={<AppIcon name="undo-2" />}
                    onClick={() => setReleaseId(r.id)}
                  >
                    {canRelease ? 'Release collateral' : 'Release (no permission)'}
                  </Menu.Item>
                  <Menu.Divider />
                </>
              )}
              <Menu.Item leftSection={<AppIcon name="eye" />} onClick={() => openAsset(r.id)}>
                View details
              </Menu.Item>
              <Menu.Item leftSection={<AppIcon name="external-link" />} onClick={() => navigate(`/loan-applications/${r.applicationId}`)}>
                View application
              </Menu.Item>
              {r.loanId !== null && (
                <Menu.Item leftSection={<AppIcon name="hand-coins" />} onClick={() => navigate(`/loans/${r.loanId}`)}>
                  View loan
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </div>
      ),
    },
  ]

  const guarantorColumns: CustomTableColumn<GuarantorRow>[] = [
    {
      accessor: 'name',
      header: 'Guarantor',
      render: (g) => (
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-gray-800">{g.name}</div>
          <div className="truncate text-xs text-gray-500">{g.phone}</div>
        </div>
      ),
      exportValue: (g) => `${g.name} (${g.phone})`,
    },
    {
      accessor: 'liveCount',
      header: 'Guarantees',
      render: (g) => (
        <div>
          <div className="text-sm text-gray-800">
            {g.liveCount} live of {g.guaranteed.length}
          </div>
          <div className="max-w-[260px] truncate text-xs text-gray-500">
            {g.guaranteed.map((x) => x.borrower).join(', ')}
          </div>
        </div>
      ),
      exportValue: (g) => g.liveCount,
    },
    {
      accessor: 'exposure',
      header: 'Live exposure',
      render: (g) => (
        <div>
          <div className={`whitespace-nowrap text-sm font-medium ${g.overLimit ? 'text-red-600' : 'text-gray-800'}`}>
            {formatTzs(g.exposure)}
          </div>
          <div className="whitespace-nowrap text-xs text-gray-500">Limit {formatTzs(MAX_GUARANTOR_EXPOSURE)}</div>
        </div>
      ),
      exportValue: (g) => g.exposure,
    },
    {
      accessor: 'overLimit',
      header: 'Status',
      sortable: false,
      render: (g) => (
        <Badge variant="light" color={g.overLimit ? 'red' : 'green'} radius="sm" size="sm">
          {g.overLimit ? 'Over limit' : 'Within limit'}
        </Badge>
      ),
      exportValue: (g) => (g.overLimit ? 'Over limit' : 'Within limit'),
    },
    {
      accessor: 'id',
      header: 'Actions',
      sortable: false,
      align: 'right',
      width: 80,
      render: (g) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Menu position="bottom-end" shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm" aria-label={`Actions for ${g.name}`}>
                <AppIcon name="ellipsis-vertical" />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<AppIcon name="eye" />} onClick={() => openGuarantor(g.id)}>
                View details
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout
      title="Collateral & Guarantors"
      subtitle="The security behind each loan: assets held and what each guarantor stands behind"
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Loans' }, { label: 'Collateral & Guarantors' }]}
    >
      <div className="space-y-4">
        {notice && (
          <Alert
            color={notice.color}
            variant="light"
            withCloseButton
            onClose={() => setNotice(null)}
            icon={<AppIcon name={notice.color === 'green' ? 'circle-check' : 'info'} />}
          >
            <Text size="sm">{notice.text}</Text>
          </Alert>
        )}

        {releasable.length > 0 && (
          <Alert color="yellow" variant="light" icon={<AppIcon name="triangle-alert" />}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Text size="sm">
                {releasable.length} {releasable.length === 1 ? 'asset can' : 'assets can'} be released. Their loans are
                fully repaid or their applications were stopped.
              </Text>
              <Button size="compact-xs" variant="default" onClick={() => setTab('assets')}>
                Show them
              </Button>
            </div>
          </Alert>
        )}

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
                  { value: 'assets', label: `Collateral (${assets.length})` },
                  { value: 'guarantors', label: `Guarantors (${GUARANTOR_ROWS.length})` },
                ]}
              />
            </div>
            <Text size="xs" c="dimmed">
              {tab === 'assets'
                ? 'Release an asset once its loan is repaid'
                : `A guarantor above ${formatTzs(MAX_GUARANTOR_EXPOSURE)} is flagged`}
            </Text>
          </div>

          {tab === 'assets' ? (
            <CustomTable<AssetView>
              size="md"
              data={assets}
              columns={assetColumns}
              searchInput
              searchPlaceholder="Search borrower, asset or loan"
              searchKeys={['applicantName', 'applicationNo', 'type', 'description', 'loanNo']}
              filters={{ type: 'select', status: statusOptions }}
              // the most valuable first
              defaultSort={{ accessor: 'value', direction: 'desc' }}
              noRecordText={TAB_EMPTY.assets}
              onRowClick={(row) => openAsset(row.id)}
              exportCsv
              exportFileName="collateral"
              print
              printTitle="Collateral"
            />
          ) : (
            <CustomTable<GuarantorRow>
              size="md"
              data={GUARANTOR_ROWS}
              columns={guarantorColumns}
              searchInput
              searchPlaceholder="Search guarantor or borrower"
              searchKeys={['name', 'phone']}
              // the highest exposure first
              defaultSort={{ accessor: 'exposure', direction: 'desc' }}
              noRecordText={TAB_EMPTY.guarantors}
              onRowClick={(row) => openGuarantor(row.id)}
              exportCsv
              exportFileName="guarantors"
              print
              printTitle="Guarantors"
            />
          )}
        </div>
      </div>

      {/* collateral drawer */}
      <Drawer opened={!!selectedAsset} onClose={closeView} position="right" size="lg" title={selectedAsset ? `${selectedAsset.type} · ${selectedAsset.applicantName}` : ''}>
        {selectedAsset && (
          <AssetDrawerBody
            row={selectedAsset}
            canRelease={canRelease}
            onRelease={(r) => {
              closeView()
              setReleaseId(r.id)
            }}
            onOpenApplication={(r) => navigate(`/loan-applications/${r.applicationId}`)}
            onOpenLoan={(r) => navigate(`/loans/${r.loanId}`)}
          />
        )}
      </Drawer>

      {/* guarantor drawer */}
      <Drawer opened={!!selectedGuarantor} onClose={closeView} position="right" size="lg" title={selectedGuarantor?.name ?? ''}>
        {selectedGuarantor && (
          <GuarantorDrawerBody row={selectedGuarantor} onOpenApplication={(id) => navigate(`/loan-applications/${id}`)} />
        )}
      </Drawer>

      <RemarksDialog
        opened={!!releasing}
        title="Release collateral"
        message={`Release the ${releasing?.type.toLowerCase() ?? 'asset'} of ${releasing?.applicantName ?? 'the borrower'}? It is no longer held as security and the papers go back to the borrower. This cannot be undone.`}
        confirmLabel="Release"
        placeholder="Loan fully repaid, title deed handed back"
        onClose={() => setReleaseId(null)}
        onSubmit={release}
      />
    </DashboardLayout>
  )
}