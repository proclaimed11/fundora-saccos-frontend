import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { ChartCard } from '../chartCard'
import { formatTzs } from '../../utils/format'
import { useAppTheme } from '../../theme/themeContext'

export type TrendPoint = { month: string; disbursed: number; collected: number }

// 1500000 -> "1.5M"
const compact = (n: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

type TrendChartProps = {
  data: TrendPoint[]
}

export function TrendChart({ data }: TrendChartProps) {
  const { surfaceColors } = useAppTheme()
  const option: EChartsOption = {
    animationDuration: 350,
    grid: { top: 12, right: 12, bottom: 48, left: 48 },
    legend: {
      bottom: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { fontSize: 12, color: '#495057' },
    },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value) => formatTzs(Number(value)),
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map((point) => point.month),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { fontSize: 11, color: '#868e96' },
    },
    yAxis: {
      type: 'value',
      min: 0,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        fontSize: 11,
        color: '#868e96',
        formatter: (value: number) => compact(value),
      },
      splitLine: { lineStyle: { color: '#e9ecef', type: 'dashed' } },
    },
    series: [
      {
        name: 'Disbursed',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: data.map((point) => point.disbursed),
        lineStyle: { width: 2, color: '#45bdfc' },
        itemStyle: { color: '#45bdfc' },
      },
      {
        name: 'Collected',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: data.map((point) => point.collected),
        lineStyle: { width: 2, color: surfaceColors.primary },
        itemStyle: { color: surfaceColors.primary },
      },
    ],
  }

  return (
    <ChartCard
      title="Disbursed vs Collected"
      className="lg:col-span-2"
      cardHeight={256}
    >
      {(height) => (
        <ReactECharts
          option={option}
          notMerge
          style={{ height, width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      )}
    </ChartCard>
  )
}
