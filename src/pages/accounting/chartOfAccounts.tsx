import { AppIcon } from '../../components/appIcon'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ActionIcon, Alert, Badge, Button, Drawer, Menu, Text } from '@mantine/core'
import { DashboardLayout } from '../../components/layout/dashboardLayout'
import { CustomTable, type CustomTableColumn } from '../../components/customTable/customTable'
import { formatTzs } from '../../utils/format'
import { ContractConfirmDialog } from '../loans/contractDialogs'
import { AccountDialog, type AccountInput } from './accountDialogs'
import {
  ACCOUNT_TYPE,
  ACCOUNT_TYPES,
  SAMPLE_ACCOUNTS,
  SYSTEM_USAGE,
  deleteBlockReason,
  isSystemAccount,
  rangeLabel,
  type Account,
  type AccountType,
} from './accountingData'

const CARD = 'rounded-md bg-white shadow-[0_10px_30px_rgba(76,87,125,0.12)]'

type TypeFilter = AccountType | 'ALL'
type Notice = { text: string; color: 'green' | 'blue' } | null
type DialogState = { kind: 'create' } | { kind: 'edit' | 'delete'; id: number } | null

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

function TypeBadge({ type }: { type: AccountType }) {
  return (
    <Badge variant="light" color={ACCOUNT_TYPE[type].color} radius="sm" size="sm">
      {ACCOUNT_TYPE[type].label}
    </Badge>
  )
}

// one compact card per account type: it is the summary and the filter at the same time
type TypeCardProps = {
  type: AccountType
  count: number
  total: number
  selected: boolean
  onClick: () => void
}

function TypeCard({ type, count, total, selected, onClick }: TypeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-md border bg-white px-3 py-2.5 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 ${
        selected ? 'border-brand ring-2 ring-brand' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ACCOUNT_TYPE[type].hex }} aria-hidden="true" />
          <span className="text-xs font-semibold text-gray-700">{ACCOUNT_TYPE[type].label}</span>
        </div>
        <span className="text-lg font-semibold leading-none text-gray-800">{count}</span>
      </div>
      <div className="mt-1.5 truncate text-xs text-gray-500">{formatTzs(total)}</div>
      <div className="text-[11px] text-gray-400">
        {rangeLabel(type)} · {ACCOUNT_TYPE[type].normal}
     </div>
    </button>
  )
}

/* ---------- account drawer ---------- */

type DrawerProps = {
  account: Account
  onEdit: (a: Account) => void
  onDelete: (a: Account) => void
  onTransactions: (a: Account) => void
}

function AccountDrawerBody({ account: a, onEdit, onDelete, onTransactions }: DrawerProps) {
  const system = isSystemAccount(a)
  const blocked = deleteBlockReason(a)
  const change = a.currentBalance - a.openingBalance
  const usage = SYSTEM_USAGE[a.accountCode]

  const tiles = [
    { label: 'Opening balance', value: formatTzs(a.openingBalance) },
    { label: 'Current balance', value: formatTzs(a.currentBalance) },
    { label: 'Change since opening', value: `${change > 0 ? '+' : ''}${formatTzs(change)}` },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <TypeBadge type={a.accountTypeName} />
        <Badge variant="outline" color={system ? 'gray' : 'brand'} radius="sm" size="sm">
          {system ? 'System account' : 'Custom account'}
        </Badge>
        <Text size="xs" c="dimmed">
          {a.accountCode}
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-md bg-gray-50 px-4 py-3">
            <div className="text-xs text-gray-500">{t.label}</div>
            <div className="text-base font-medium text-gray-800">{t.value}</div>
          </div>
        ))}
      </div>

      <div>
        <SectionTitle>Account details</SectionTitle>
        <Field label="Account number" value={String(a.accountNo)} />
        <Field label="Account code" value={a.accountCode} />
        <Field label="Account name" value={a.accountName} />
        <Field label="Type" value={ACCOUNT_TYPE[a.accountTypeName].label} />
        <Field label="Normal balance" value={ACCOUNT_TYPE[a.accountTypeName].normal} />
      </div>

      <div>
        <SectionTitle>What posts to this account</SectionTitle>
        {usage ? (
          <ul className="mt-2 space-y-2">
            {usage.map((u) => (
              <li key={u} className="flex items-start gap-2.5 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700">
                <AppIcon name="arrow-left-right" className="mt-0.5 shrink-0 text-gray-400" />
                {u}
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-md border border-dashed border-gray-200 px-4 py-5 text-center text-xs text-gray-500">
            No automatic posting uses this account. It is for entries made by hand.
          </div>
        )}
        <p className="mt-2 text-xs text-gray-500">{ACCOUNT_TYPE[a.accountTypeName].hint}.</p>
      </div>

      {blocked && (
        <Alert color="gray" variant="light" icon={<AppIcon name="lock-keyhole" />}>
          <Text size="sm">{blocked}</Text>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="xs" leftSection={<AppIcon name="pencil" />} onClick={() => onEdit(a)}>
          Edit
        </Button>
        <Button size="xs" variant="default" leftSection={<AppIcon name="book" />} onClick={() => onTransactions(a)}>
          View transactions
        </Button>
        <Button
          size="xs"
          color="red"
          variant="light"
          disabled={!!blocked}
          leftSection={<AppIcon name="trash" />}
          onClick={() => onDelete(a)}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}

/* ---------- page ---------- */

export function ChartOfAccountsPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  // UI only: changes made in this session, nothing is saved yet
  const [accounts, setAccounts] = useState<Account[]>(SAMPLE_ACCOUNTS)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL')
  const [dialog, setDialog] = useState<DialogState>(null)
  const [notice, setNotice] = useState<Notice>(null)

  // success banners fade away on their own
  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 9000)
    return () => clearTimeout(t)
  }, [notice])

  const typeTotals = ACCOUNT_TYPES.map((t) => {
    const list = accounts.filter((a) => a.accountTypeName === t)
    return { type: t, count: list.length, total: list.reduce((s, a) => s + a.currentBalance, 0) }
  })

  const visible = typeFilter === 'ALL' ? accounts : accounts.filter((a) => a.accountTypeName === typeFilter)

  // /chart-of-accounts?account=5 opens the drawer for account 5
  const accountParam = params.get('account')
  const selected = accountParam ? (accounts.find((a) => String(a.id) === accountParam) ?? null) : null
  const openView = (id: number) => setParams({ account: String(id) }, { replace: true })
  const closeView = () => setParams({}, { replace: true })

  const dialogAccount = dialog && dialog.kind !== 'create' ? accounts.find((a) => a.id === dialog.id) : undefined

  // clicking the chosen type again shows every account
  const pickType = (t: AccountType) => setTypeFilter((current) => (current === t ? 'ALL' : t))

  const filterLabel = typeFilter === 'ALL' ? 'All accounts' : `${ACCOUNT_TYPE[typeFilter].label} accounts`

  /* ---------- actions ---------- */

  const save = (input: AccountInput) => {
    if (dialog?.kind === 'create') {
      // TODO: POST /api/chart-of-accounts { accountCode, accountName, accountTypeName, openingBalance, currentBalance }
      const id = Math.max(0, ...accounts.map((a) => a.id)) + 1
      setAccounts((list) => [...list, { id, ...input, currentBalance: input.openingBalance }])
      setNotice({ color: 'green', text: `Account ${input.accountCode} was created.` })
    } else if (dialogAccount) {
      // TODO: PUT /api/chart-of-accounts/{id}
      setAccounts((list) =>
        list.map((a) =>
          a.id === dialogAccount.id
            ? {
                ...a,
                accountNo: input.accountNo,
                accountCode: input.accountCode,
                accountName: input.accountName,
                accountTypeName: input.accountTypeName,
            }
            : a,
        ),
      )
      setNotice({ color: 'green', text: `Account ${input.accountCode} was updated.` })
    }
    setDialog(null)
  }

  const remove = () => {
    if (!dialogAccount || deleteBlockReason(dialogAccount)) return
    // TODO: DELETE /api/chart-of-accounts/{id}
    setAccounts((list) => list.filter((a) => a.id !== dialogAccount.id))
    setNotice({ color: 'blue', text: `Account ${dialogAccount.accountCode} was deleted.` })
    if (selected?.id === dialogAccount.id) closeView()
    setDialog(null)
  }

  // the drawer buttons close the drawer first, then open the dialog
  const edit = (a: Account) => {
    closeView()
    setDialog({ kind: 'edit', id: a.id })
  }

  const askDelete = (a: Account) => {
    closeView()
    setDialog({ kind: 'delete', id: a.id })
  }

  // the GL Transactions page filters by account code
  const transactions = (a: Account) => navigate(`/gl-transactions?account=${a.accountCode}`)

  /* ---------- columns ---------- */

  const columns: CustomTableColumn<Account>[] = [
    {
      accessor: 'accountNo',
      header: 'No.',
      width: 90,
      render: (a) => (
        <span className="whitespace-nowrap font-mono text-xs font-semibold text-gray-800">{a.accountNo}</span>
      ),
      exportValue: (a) => a.accountNo,
    },
    {
      accessor: 'accountCode',
      header: 'Account',
      render: (a) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-gray-800">{a.accountCode}</span>
            {isSystemAccount(a) && (
              <Badge variant="outline" color="gray" radius="sm" size="xs">
                System
              </Badge>
            )}
          </div>
          <div className="truncate text-xs text-gray-500">{a.accountName}</div>
        </div>
      ),
      exportValue: (a) => `${a.accountCode} (${a.accountName})`,
    },
    {
      accessor: 'accountTypeName',
      header: 'Type',
      sortable: false,
      render: (a) => (
        <div>
          <TypeBadge type={a.accountTypeName} />
          <div className="mt-0.5 text-[11px] text-gray-500">{ACCOUNT_TYPE[a.accountTypeName].normal} balance</div>
        </div>
      ),
      exportValue: (a) => ACCOUNT_TYPE[a.accountTypeName].label,
    },
    {
      accessor: 'openingBalance',
      header: 'Opening balance',
      render: (a) => <span className="whitespace-nowrap text-sm text-gray-800">{formatTzs(a.openingBalance)}</span>,
      exportValue: (a) => a.openingBalance,
    },
    {
      accessor: 'currentBalance',
      header: 'Current balance',
      render: (a) => {
        const change = a.currentBalance - a.openingBalance
        return (
          <div>
            <div className="whitespace-nowrap text-sm font-medium text-gray-800">{formatTzs(a.currentBalance)}</div>
            <div
              className={`whitespace-nowrap text-xs ${
                change === 0 ? 'text-gray-400' : change > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change === 0 ? 'No change' : `${change > 0 ? '+' : ''}${formatTzs(change)} since opening`}
            </div>
          </div>
        )
      },
      exportValue: (a) => a.currentBalance,
    },
    {
      // the ⋮ menu holds every action; "id" is only used as the accessor
      accessor: 'id',
      header: 'Actions',
      sortable: false,
      align: 'right',
      width: 80,
      render: (a) => {
        const blocked = deleteBlockReason(a)
        return (
          // stop the click so the row doesn't also open the drawer
          <div onClick={(e) => e.stopPropagation()}>
            <Menu position="bottom-end" shadow="md" width={230}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="sm" aria-label={`Actions for ${a.accountCode}`}>
                  <AppIcon name="ellipsis-vertical" />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item fw={500} leftSection={<AppIcon name="pencil" />} onClick={() => setDialog({ kind: 'edit', id: a.id })}>
                  Edit account
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<AppIcon name="eye" />} onClick={() => openView(a.id)}>
                  View details
                </Menu.Item>
                <Menu.Item leftSection={<AppIcon name="book" />} onClick={() => transactions(a)}>
                  View transactions
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  disabled={!!blocked}
                  leftSection={<AppIcon name="trash" />}
                  onClick={() => setDialog({ kind: 'delete', id: a.id })}
                >
                  {blocked ? 'Cannot delete' : 'Delete account'}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        )
      },
    },
  ]

  return (
    <DashboardLayout
      title="Chart of Accounts"
      subtitle="The master list of accounts used for double-entry posting"
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Accounting' }, { label: 'Chart of Accounts' }]}
      actions={
        <Button size="xs" leftSection={<AppIcon name="plus" />} onClick={() => setDialog({ kind: 'create' })}>
          New account
        </Button>
      }
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

        {/* row 1: the account types, they summarise the books and filter the table */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {typeTotals.map((t) => (
            <TypeCard
              key={t.type}
              type={t.type}
              count={t.count}
              total={t.total}
              selected={typeFilter === t.type}
              onClick={() => pickType(t.type)}
            />
          ))}
        </div>

        {/* row 2: table in a plain card */}
        <div className={`${CARD} p-4`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <Text size="xs" c="dimmed">
              {filterLabel} · showing {visible.length} of {accounts.length} accounts · 5 system accounts are needed
              for automatic posting and cannot be deleted
            </Text>
            {typeFilter !== 'ALL' && (
              <Button size="compact-xs" variant="subtle" color="gray" onClick={() => setTypeFilter('ALL')}>
                Clear filter
              </Button>
            )}
          </div>

          <CustomTable<Account>
            size="md"
            data={visible}
            columns={columns}
            searchInput
            searchPlaceholder="Search account code or name"
            searchKeys={['accountCode', 'accountName']}
            // grouped by type, then by code
            defaultSort={{ accessor: 'accountNo', direction: 'asc' }}
            noRecordText="No accounts match this filter"
            onRowClick={(row) => openView(row.id)}
            exportCsv
            exportFileName="chart-of-accounts"
            print
            printTitle="Chart of Accounts"
          />
        </div>
      </div>

      {/* account drawer */}
      <Drawer opened={!!selected} onClose={closeView} position="right" size="lg" title={selected?.accountName ?? ''}>
        {selected && (
          <AccountDrawerBody account={selected} onEdit={edit} onDelete={askDelete} onTransactions={transactions} />
        )}
      </Drawer>

        <AccountDialog
        opened={dialog?.kind === 'create' || dialog?.kind === 'edit'}
        account={dialog?.kind === 'edit' ? (dialogAccount ?? null) : null}
        existingCodes={accounts.map((a) => a.accountCode)}
        existingNumbers={accounts.map((a) => a.accountNo)}
        onClose={() => setDialog(null)}
        onSubmit={save}
        />

      <ContractConfirmDialog
        opened={dialog?.kind === 'delete' && !!dialogAccount}
        title="Delete account"
        message={`Delete ${dialogAccount?.accountCode ?? 'this account'} (${dialogAccount?.accountName ?? ''}) from the chart of accounts? This cannot be undone.`}
        confirmLabel="Delete account"
        onClose={() => setDialog(null)}
        onConfirm={remove}
      />
    </DashboardLayout>
  )
}