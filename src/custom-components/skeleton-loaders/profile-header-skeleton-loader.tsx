import { Card, CardContent } from "../../components/ui/card"
import { Skeleton } from "../../components/ui/skeleton"
import { cn } from "../../lib/utils"

type ProfileHeaderSkeletonProps = {
  /** Shape of the leading avatar/icon placeholder. */
  leadingShape?: "circle" | "square"
  /** Tailwind size class for the leading placeholder, e.g. "size-12". */
  leadingSize?: string
  /** Number of text-line skeletons beside the leading icon (title, subtitle, etc.). */
  leadingLines?: number
  /** Adds a small pill-shaped skeleton under the leading text lines, mimicking a Badge. */
  showLeadingBadge?: boolean
  /** Number of label+value field skeletons rendered after the leading block. */
  fieldCount?: number
}

const ProfileHeaderSkeleton = ({
  leadingShape = "square",
  leadingSize = "size-12",
  leadingLines = 2,
  showLeadingBadge = false,
  fieldCount = 3,
}: ProfileHeaderSkeletonProps) => {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 divide-y divide-border md:flex-row md:items-center md:divide-x md:divide-y-0">
          <div className="flex items-center gap-3 pb-4 md:pb-0 md:pr-6">
            <Skeleton
              className={cn(leadingSize, "shrink-0", leadingShape === "circle" ? "rounded-full" : "rounded-lg")}
            />
            <div className="flex flex-col gap-1.5">
              {Array.from({ length: leadingLines }).map((_, i) => (
                <Skeleton key={i} className={cn("h-4", i === 0 ? "w-32" : "w-24")} />
              ))}
              {showLeadingBadge && <Skeleton className="h-5 w-16 rounded-full" />}
            </div>
          </div>

          {Array.from({ length: fieldCount }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5 pt-4 md:px-6 md:pt-0">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default ProfileHeaderSkeleton