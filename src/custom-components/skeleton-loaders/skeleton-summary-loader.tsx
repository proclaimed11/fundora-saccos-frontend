import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type SectionCardSkeletonVariant = "text" | "table" | "chart" | "list" | "grid" | "custom"

type SectionCardSkeletonProps = {
  /** Shows a small icon placeholder in the header, matching SectionCard's optional icon prop. */
  showIcon?: boolean
  /** Width of the title-bar skeleton in the header. */
  titleWidth?: string
  /** Shows a small placeholder on the right side of the header, matching SectionCard's headerAction prop. */
  showHeaderAction?: boolean
  /** Shape of the body content skeleton. */
  variant?: SectionCardSkeletonVariant
  /** Number of rows for "text", "table", and "list" variants. */
  rows?: number
  /** Number of columns for "table" and "grid" variants. */
  columns?: number
  /** Height class for the "chart" variant, e.g. "h-64". */
  chartHeight?: string
  /** For "custom": render your own body skeleton shape while still getting the SectionCard header chrome. */
  children?: React.ReactNode
  className?: string
  contentClassName?: string
}

const SectionCardSkeleton = ({
  showIcon = true,
  titleWidth = "w-32",
  showHeaderAction = false,
  variant = "text",
  rows = 3,
  columns = 4,
  chartHeight = "h-64",
  children,
  className,
  contentClassName,
}: SectionCardSkeletonProps) => {
  return (
    <Card className={className}>
      <CardContent className={cn("flex flex-col gap-4", contentClassName)}>
        <div className="flex flex-col">
          <div className="-mx-(--card-spacing) -mt-(--card-spacing) flex h-9 items-center justify-between gap-2 rounded-tl-xl border-l-4 border-l-primary px-3">
            <div className="flex items-center gap-2">
              {showIcon && <Skeleton className="size-5 rounded-sm" />}
              <Skeleton className={cn("h-4", titleWidth)} />
            </div>
            {showHeaderAction && <Skeleton className="h-7 w-20 rounded-md" />}
          </div>

          <Separator className="-mx-(--card-spacing) mt-0 w-auto bg-border/50" />
        </div>

        {variant === "custom" ? (
          children
        ) : variant === "text" ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            ))}
          </div>
        ) : variant === "list" ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : variant === "table" ? (
          <div className="flex flex-col gap-3">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-3.5 w-3/4" />
              ))}
            </div>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-4 w-full" />
                ))}
              </div>
            ))}
          </div>
        ) : variant === "grid" ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: rows * columns || 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-lg border p-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : variant === "chart" ? (
          <Skeleton className={cn("w-full rounded-lg", chartHeight)} />
        ) : null}
      </CardContent>
    </Card>
  )
}

export default SectionCardSkeleton