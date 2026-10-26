import { AppIcon } from '../../components/appIcon'
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Badge, Button, Select, Text } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { DashboardLayout } from '../../components/layout/dashboardLayout'
import { AgingView, EfficiencyView, NplView, PortfolioView, TrialView } from './reportViews'
import {
  REPORTS,
  buildReport,
  csvFor,
  dateText,
  effectiveTo,
  presetGroups,
  rangeFor,
  rangeText,
  reportPickerData,
  type PresetKey,
  type ReportKey,
} from './reportsData'

const CARD = 'rounded-md bg-white shadow-[0_10px_30px_rgba(76,87,125,0.12)]'
const FMT = 'YYYY-MM-DD'

// the filters a report was generated with
type Applied = { key: ReportKey; from: string; to: string; at: string }

// a CSV file built in the browser and downloaded
function downloadCsv(fileName: string, rows: (string | number)[][]) {
  const body = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  // the leading mark lets Excel read the file as UTF-8
  const blob = new Blob(['\ufeff' + body], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

const isReport = (v: string | null): v is ReportKey => REPORTS.some((r) => r.key === v)

export function ReportsPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const current = rangeFor('this-month')

  // /reports?report=aging picks that report, nothing is shown until a report is picked
  const urlKey = params.get('report')
  const [reportKey, setReportKey] = useState<ReportKey | null>(() => (isReport(urlKey) ? urlKey : null))
  const [preset, setPreset] = useState<PresetKey>('this-month')
  const [from, setFrom] = useState(current.from)
  const [to, setTo] = useState(current.to)
  const [applied, setApplied] = useState<Applied | null>(() =>
    isReport(urlKey) ? { key: urlKey, from: current.from, to: current.to, at: dayjs().format('HH:mm') } : null,
  )

  const info = REPORTS.find((r) => r.key === reportKey)
  const invalid = dayjs(from).isAfter(dayjs(to), 'day')
  const dirty = applied !== null && (applied.from !== from || applied.to !== to)

  const generated = useMemo(
    () => (applied ? buildReport(applied.key, { from: applied.from, to: applied.to }) : null),
    [applied],
  )
  const appliedInfo = applied ? REPORTS.find((r) => r.key === applied.key) : undefined

  /* ---------- filters ---------- */

  const stamp = () => dayjs().format('HH:mm')

  // picking a report shows it straight away, for the period that is set
  const pickReport = (v: string | null) => {
    if (!isReport(v)) {
      setReportKey(null)
      setApplied(null)
      setParams({}, { replace: true })
      return
    }
    setReportKey(v)
    setApplied(invalid ? null : { key: v, from, to, at: stamp() })
    setParams({ report: v }, { replace: true })
  }

  const pickPreset = (v: string | null) => {
    if (!v) return
    const p = v as PresetKey
    setPreset(p)
    if (p !== 'custom') {
      const r = rangeFor(p)
      setFrom(r.from)
      setTo(r.to)
    }
  }

  const changeFrom = (v: string | null) => {
    if (!v) return
    setFrom(dayjs(v).format(FMT))
    setPreset('custom')
  }

  const changeTo = (v: string | null) => {
    if (!v) return
    setTo(dayjs(v).format(FMT))
    setPreset('custom')
  }

  const run = () => {
    if (!reportKey || invalid) return
    setApplied({ key: reportKey, from, to, at: stamp() })
  }

  /* ---------- the viewer ---------- */

  const appliedRange = applied ? { from: applied.from, to: applied.to } : null
  const upToToday = applied ? effectiveTo(applied.to) !== applied.to : false
  const periodText = !applied
    ? ''
    : appliedInfo && !appliedInfo.usesFrom
      ? `As at ${dateText(effectiveTo(applied.to))}`
      : rangeText({ from: applied.from, to: effectiveTo(applied.to) })

  const exportCsv = () => {
    if (!generated || !appliedRange || !appliedInfo) return
    const { fileName, rows } = csvFor(generated, appliedRange)
    downloadCsv(fileName, [[appliedInfo.label], [periodText], [], ...rows])
  }

  const go = (path: string) => navigate(path)

  return (
    <DashboardLayout
      title="Reports"
      subtitle="Pick a report, choose the period and generate it"
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Reports' }]}
    >
      <div className="space-y-4">
        {/* the filters */}
        <div className={`${CARD} p-4`}>
          <div className="flex flex-wrap items-end gap-3">
            <Select
              label="Report"
              placeholder="Select a report"
              size="sm"
              className="w-full sm:w-64"
              data={reportPickerData}
              value={reportKey}
              onChange={pickReport}
              clearable
              leftSection={<AppIcon name={info?.icon ?? 'chart-column-increasing'} />}
            />
            <Select
              label="Period"
              size="sm"
              className="w-full sm:w-44"
              data={presetGroups()}
              allowDeselect={false}
              value={preset}
              onChange={pickPreset}
            />
            <DateInput
              label="From"
              size="sm"
              className="w-full sm:w-40"
              valueFormat="MMM D, YYYY"
              value={from}
              maxDate={to}
              onChange={changeFrom}
              disabled={info ? !info.usesFrom : false}
            />
            <DateInput
              label="To"
              size="sm"
              className="w-full sm:w-40"
              valueFormat="MMM D, YYYY"
              value={to}
              minDate={from}
              onChange={changeTo}
            />

            <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
              <Button size="sm" leftSection={<AppIcon name="refresh-cw" />} disabled={!reportKey || invalid} onClick={run}>
                Generate
              </Button>
              <Button size="sm" variant="default" leftSection={<AppIcon name="download" />} disabled={!generated} onClick={exportCsv}>
                Export CSV
              </Button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            {invalid && (
              <Text size="xs" c="red">
                The start date must be before the end date.
              </Text>
            )}
            {!invalid && dirty && (
              <Badge variant="light" color="yellow" radius="sm" size="sm" tt="none">
                Filters changed. Click Generate to refresh the report.
              </Badge>
            )}
            {info && (
              <Text size="xs" c="dimmed">
                {info.hint}
              </Text>
            )}
          </div>
        </div>

        {/* nothing is picked yet */}
        {!applied && (
          <div className={`${CARD} flex flex-col items-center justify-center px-6 py-16 text-center`}>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <AppIcon name="chart-column-increasing" size={26} />
            </div>
            <div className="mt-3 text-base font-medium text-gray-800">No report selected</div>
            <div className="mt-1 max-w-sm text-sm text-gray-500">
              Pick a report above. It opens for the current month, and you can change the period and generate it
              again.
            </div>
          </div>
        )}

        {/* the viewer, only after a report is picked */}
        {applied && appliedInfo && generated && (
          <div className={`${CARD} p-5`}>
            <div className="mb-5 border-b border-gray-100 pb-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-brand-dark">
                    <AppIcon name={appliedInfo.icon} size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-gray-800">{appliedInfo.label}</div>
                    <div className="text-xs text-gray-500">{appliedInfo.description}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="light" color="brand" radius="sm" size="sm" tt="none">
                    {periodText}
                  </Badge>
                  {upToToday && (
                    <Badge variant="outline" color="gray" radius="sm" size="sm" tt="none">
                      Up to today
                    </Badge>
                  )}
                </div>
              </div>
              <div className="mt-2 text-[11px] text-gray-400">
                Generated at {applied.at} · Source: GET {appliedInfo.endpoint} · the API has no date filter yet, so the
                period is applied here on sample data
              </div>
            </div>

            {generated.key === 'portfolio' && <PortfolioView data={generated.data} go={go} />}
            {generated.key === 'npl' && <NplView data={generated.data} go={go} />}
            {generated.key === 'aging' && <AgingView data={generated.data} go={go} />}
            {generated.key === 'efficiency' && <EfficiencyView data={generated.data} go={go} />}
            {generated.key === 'trial' && <TrialView data={generated.data} go={go} />}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}