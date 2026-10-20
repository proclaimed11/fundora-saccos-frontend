import { useState } from 'react'
import { Avatar, Badge, Drawer, Group, Stack, Text } from '@mantine/core'
import dayjs from 'dayjs'
import { CustomTable, type CustomTableColumn } from './components/customTable'

const ISO = 'YYYY-MM-DD'

const dateFields = [
  { key: 'joined', label: 'Joined' },
  { key: 'created', label: 'Created' },
  { key: 'updated', label: 'Updated' },
  { key: 'lastLogin', label: 'Last login' },
  { key: 'contractStart', label: 'Contract start' },
  { key: 'contractEnd', label: 'Contract end' },
  { key: 'renewal', label: 'Renewal' },
  { key: 'review', label: 'Review' },
] as const

type DateKey = (typeof dateFields)[number]['key']

type Person = {
  id: number
  name: string
  role: string
  experience: number
  company: string
  extra: number
  score: number
  description: string
}

type Row = Person & Record<DateKey, string>

const people: Person[] = [
  { id: 1, name: 'Maya Thompson', role: 'Whole seller', experience: 3, company: 'ACE Homes LLC', extra: 2, score: 12054, description: 'Specializes in off-market deals across the downtown area. Closed 14 contracts this year and mentors two junior sellers.' },
  { id: 2, name: 'Ethan Carter', role: 'Property manager', experience: 5, company: 'A&H Realty', extra: 0, score: 12054, description: 'Oversees a portfolio of 40+ rental units. Known for fast tenant turnaround and low vacancy rates.' },
  { id: 3, name: 'Sophie Lee', role: 'Investor', experience: 1, company: 'NestHub LLC', extra: 1, score: 12054, description: 'New to the platform with a focus on small multi-family properties. Currently building her first portfolio.' },
  { id: 4, name: 'Liam Johnson', role: 'Whole seller', experience: 3, company: 'PrimeKey Co.', extra: 0, score: 12054, description: 'Works mostly with distressed properties. Strong network of local contractors and cash buyers.' },
  { id: 5, name: 'Olivia Brown', role: 'Fix & Flip', experience: 5, company: '4Walls Group', extra: 0, score: 12054, description: 'Runs full renovation projects from purchase to resale. Average project turnaround is under four months.' },
  { id: 6, name: 'Noah Davis', role: 'Whole seller', experience: 1, company: 'Urban Flow', extra: 1, score: 12054, description: 'Focuses on urban infill lots and quick assignments. Still ramping up his buyer list.' },
  { id: 7, name: 'Ava Wilson', role: 'Property manager', experience: 3, company: 'HomeX Ventures', extra: 0, score: 12054, description: 'Handles maintenance coordination and lease renewals for mid-size residential buildings.' },
  { id: 8, name: 'Lucas Martinez', role: 'Investor', experience: 5, company: 'GRN Properties', extra: 0, score: 12054, description: 'Long-term buy-and-hold investor with a mix of residential and light commercial assets.' },
  { id: 9, name: 'Isabella Garcia', role: 'Whole seller', experience: 1, company: 'ACE Homes LLC', extra: 2, score: 12054, description: 'Joined recently from a brokerage background. Strong at negotiating with first-time sellers.' },
  { id: 10, name: 'Mason Rodriguez', role: 'Fix & Flip', experience: 3, company: 'Brickline', extra: 1, score: 12054, description: 'Specializes in kitchen and bathroom remodels that boost resale value on older homes.' },
]

// dummy dates, one per date field
const data: Row[] = people.map((p, i) => {
  const dates = {} as Record<DateKey, string>
  dateFields.forEach((d, j) => {
    dates[d.key] = dayjs('2026-10-01')
      .subtract((i * 7 + j * 13) % 150, 'day')
      .format(ISO)
  })
  return { ...p, ...dates }
})

// every date field gets a date-range filter
const dateFilters = Object.fromEntries(
  dateFields.map((d) => [d.key, 'date' as const])
) as Record<DateKey, 'date'>

/* ---------- column definitions (reused by several tables) ---------- */

const nameColumn: CustomTableColumn<Row> = {
  accessor: 'name',
  header: 'Name',
  render: (r) => (
    <Group gap="xs" wrap="nowrap">
      <Avatar size={24} radius="xl" color="gray" name={r.name} />
      <Text size="xs" fw={500} className="whitespace-nowrap">
        {r.name}
      </Text>
    </Group>
  ),
}

const roleColumn: CustomTableColumn<Row> = {
  accessor: 'role',
  header: 'Role',
  render: (r) => (
    <Badge
      color="gray"
      variant="light"
      radius="sm"
      size="sm"
      tt="none"
      fw={500}
      leftSection={<span className="block h-1 w-1 rounded-full bg-gray-500" />}
    >
      {r.role}
    </Badge>
  ),
}

const experienceColumn: CustomTableColumn<Row> = {
  accessor: 'experience',
  header: 'Experience',
  render: (r) => (
    <Text size="xs" className="whitespace-nowrap">
      {r.experience} {r.experience === 1 ? 'year' : 'years'}
    </Text>
  ),
  exportValue: (r) => `${r.experience} ${r.experience === 1 ? 'year' : 'years'}`,
}

const companyColumn: CustomTableColumn<Row> = {
  accessor: 'company',
  header: 'Company',
  render: (r) => (
    <Group gap={4} wrap="nowrap">
      <Text size="xs" className="whitespace-nowrap">
        {r.company}
      </Text>
      {r.extra > 0 && (
        <Badge color="gray" variant="light" radius="xl" size="xs">
          +{r.extra}
        </Badge>
      )}
    </Group>
  ),
  exportValue: (r) => (r.extra > 0 ? `${r.company} (+${r.extra})` : r.company),
}

const scoreColumn: CustomTableColumn<Row> = {
  accessor: 'score',
  header: 'Score',
  type: 'number',
}

const fullColumns: CustomTableColumn<Row>[] = [
  nameColumn,
  roleColumn,
  experienceColumn,
  companyColumn,
  ...dateFields.map(
    (d): CustomTableColumn<Row> => ({ accessor: d.key, header: d.label, type: 'date' })
  ),
  scoreColumn,
]

const simpleColumns: CustomTableColumn<Row>[] = [nameColumn, roleColumn, companyColumn, scoreColumn]

function App() {
  const [rows, setRows] = useState<Row[]>(data)
  const [activeRow, setActiveRow] = useState<Row | null>(null)

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-4">
      {/* 1. everything switched on */}
      <section className="space-y-2">
        <Text fw={600}>1. Everything on</Text>
        <CustomTable
          data={rows}
          columns={fullColumns}
          searchInput
          filters={{
            role: 'select',
            experience: [
              { value: '1', label: '1 year' },
              { value: '3', label: '3 years' },
              { value: '5', label: '5 years' },
            ],
            company: 'select',
            ...dateFilters,
          }}
          selectCheckbox
          onDelete={(selected) =>
            setRows((prev) => prev.filter((r) => !selected.some((s) => s.id === r.id)))
          }
          collapsible
          renderExpanded={(r) => (
            <div className="space-y-2">
              <Text size="xs" fw={600}>
                About {r.name}
              </Text>
              <Text size="xs" c="dimmed" maw={640}>
                {r.description}
              </Text>
            </div>
          )}
          exportCsv
          exportFileName="team"
          print
          printTitle="Team members"
          verticalBorders
          horizontalBorders
          maxHeight={380}
          pageSizeOptions={[5, 8, 20]}
          onRowClick={setActiveRow}
          noRecordText="No team members available"
        />
      </section>

      {/* 2. light version: search + export, boxed and striped, one dropdown filter */}
      <section className="space-y-2">
        <Text fw={600}>2. Light version</Text>
        <CustomTable
          data={rows}
          columns={simpleColumns}
          searchInput
          filters={{ role: ['Whole seller', 'Property manager', 'Investor', 'Fix & Flip'] }}
          exportCsv
          exportFileName="team-summary"
          outerBorder
          striped
          pageSize={5}
          noRecordText="No team members available"
        />
      </section>

      {/* 3. bare table with custom empty message and no pagination */}
      <section className="space-y-2">
        <Text fw={600}>3. Bare table, empty data</Text>
        <CustomTable
          data={[]}
          columns={simpleColumns}
          pagination={false}
          horizontalBorders={false}
          noRecordText="No archived members yet"
        />
      </section>

      <Drawer
        opened={activeRow !== null}
        onClose={() => setActiveRow(null)}
        position="right"
        size="sm"
        title={activeRow?.name}
      >
        {activeRow && (
          <Stack gap="sm">
            <Text size="xs" c="dimmed">
              {activeRow.role} · {activeRow.company}
            </Text>
            <Text size="sm">{activeRow.description}</Text>
          </Stack>
        )}
      </Drawer>
    </div>
  )
}

export default App