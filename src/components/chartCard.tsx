import { AppIcon } from './appIcon'
import { useState, type ReactNode } from 'react'
import { ActionIcon, Button, Menu, Modal } from '@mantine/core'
import { ContentCard } from './contentCard'
import { DateRangeFilter } from './dashboard/dateRangeFilter'

const DOWNLOADS = [
  { label: 'CSV', icon: 'file-text' },
  { label: 'PDF', icon: 'file-text' },
  { label: 'Image', icon: 'file-image' },
]

// dark text/icons for the card header
const HEADER_TEXT = '#1f2937' // gray-800

type ChartCardProps = {
  title: string
  className?: string
  /** chart body; receives the height to draw at (small in the card, large in the modal) */
  children: (height: number) => ReactNode
  /** line under the chart, e.g. a total. Shown in the card and in the modal */
  footer?: ReactNode
  /** chart height inside the card, in px */
  cardHeight?: number
}

export function ChartCard({
  title,
  className,
  children,
  footer,
  cardHeight = 240,
}: ChartCardProps) {
  const [open, setOpen] = useState(false)

  // dark icons with a subtle dark hover
  const iconBtn = 'text-gray-800 hover:bg-black/10'

  const actions = (
    <div className="flex items-center gap-1">
      <Menu position="bottom-end" shadow="md" width={170}>
        <Menu.Target>
          <ActionIcon
            variant="transparent"
            size="sm"
            className={iconBtn}
            aria-label={`Download ${title}`}
          >
            <AppIcon name="download" />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Download as</Menu.Label>
          {DOWNLOADS.map((d) => (
            <Menu.Item key={d.label} leftSection={<AppIcon name={d.icon} />}>
              {d.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>

      <ActionIcon
        variant="transparent"
        size="sm"
        className={iconBtn}
        aria-label={`View ${title} larger`}
        onClick={() => setOpen(true)}
      >
        <AppIcon name="maximize" />
      </ActionIcon>
    </div>
  )

  return (
    <>
      <ContentCard
        title={title}
        headerColor="#fcfdfc"
        headerTextColor={HEADER_TEXT}
        action={actions}
        className={className}
      >
        {children(cardHeight)}
        {footer && (
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
            {footer}
          </div>
        )}
      </ContentCard>

      <Modal opened={open} onClose={() => setOpen(false)} title={title} size={960} centered>
        <div className="space-y-4">
          {/* filters + report downloads */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <DateRangeFilter onApply={() => {}} />
            <div className="flex items-center gap-2">
              {DOWNLOADS.map((d) => (
                <Button
                  key={d.label}
                  size="xs"
                  variant="default"
                  leftSection={<AppIcon name={d.icon} />}
                >
                  {d.label}
                </Button>
              ))}
            </div>
          </div>

          {/* the same chart, drawn larger */}
          {children(380)}

          {footer && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              {footer}
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}