import { useLayoutEffect, useRef, useState } from "react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

export type SummaryWidget = {
  key: string
  label: string
  value: string
  icon: LucideIcon
  iconClassName: string
  caption?: string
}

type SummaryCardsProps = {
  widgets: SummaryWidget[]
}

// Estimated minimum comfortable width for one card — used only to decide
// whether `widgets.length` cards fit in one row before falling back to the
// carousel. Doesn't constrain the grid's actual rendered card width.
const MIN_CARD_WIDTH = 200
const GAP = 12 // matches gap-3

const WidgetCard = ({ label, value, icon: Icon, iconClassName, caption }: SummaryWidget) => (
  <Card className="relative overflow-visible gap-0 py-0">
    <span
      className={cn(
        "absolute -top-3 left-4 flex size-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm",
        iconClassName
      )}
    >
      <Icon className="size-4" />
    </span>

    <CardContent className="flex flex-col items-end gap-0.5 px-4 py-2.5">
      <div className="flex min-w-0 items-baseline gap-1.5">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        {caption && <p className="truncate text-xs text-muted-foreground">{caption}</p>}
      </div>
      <p className="truncate text-lg font-semibold">{value}</p>
    </CardContent>
  </Card>
)

const SummaryCards = ({ widgets }: SummaryCardsProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [fits, setFits] = useState(true)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    const checkFit = () => {
      const neededWidth = widgets.length * MIN_CARD_WIDTH + (widgets.length - 1) * GAP
      setFits(neededWidth <= el.offsetWidth)
    }

    checkFit()

    const observer = new ResizeObserver(checkFit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [widgets.length])

  return (
    <div ref={containerRef}>
      {fits ? (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${widgets.length}, minmax(0, 1fr))` }}
        >
          {widgets.map(({ key, ...widget }) => (
            <WidgetCard key={key} {...widget} />
          ))}
        </div>
      ) : (
        <Carousel opts={{ align: "start" }} className="w-full px-1">
          <CarouselContent className="-ml-3">
            {widgets.map((widget) => (
              <CarouselItem key={widget.key} className="basis-auto pt-3 pl-3">
                <div className="shrink-0" style={{ width: MIN_CARD_WIDTH }}>
                  <WidgetCard {...widget} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-1 size-7" />
          <CarouselNext className="-right-1 size-7" />
        </Carousel>
      )}
    </div>
  )
}

export default SummaryCards