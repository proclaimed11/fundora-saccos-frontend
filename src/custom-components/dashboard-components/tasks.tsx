import { useEffect, useState } from "react"
import { CheckIcon, ListChecksIcon } from "lucide-react"
import SectionCard from "../section-card"
import { Button } from "../../components/ui/button"
import { Skeleton } from "../../components/ui/skeleton"
import SectionCardSkeleton from "../skeleton-loaders/skeleton-summary-loader"

type TaskRow = {
  label: string
  count: number
}

const TasksCard = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [taskRows, setTaskRows] = useState<TaskRow[] | null>(null)

  useEffect(() => {
    setIsLoading(true)
    // Replace with your real fetch, e.g. fetch(`/api/tasks?assignedTo=me`)
    const timer = setTimeout(() => {
      setTaskRows([
        { label: "Review pending applications", count: 14 },
        { label: "Approve loans", count: 7 },
        { label: "Upload disbursement proofs", count: 5 },
        { label: "Verify guarantor documents", count: 9 },
      ])
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading || !taskRows) {
    return (
      <SectionCardSkeleton variant="custom" titleWidth="w-20" showHeaderAction>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-5 shrink-0 rounded-sm" />
              <Skeleton className="h-3.5 flex-1" />
              <Skeleton className="h-3.5 w-6" />
            </div>
          ))}
        </div>
      </SectionCardSkeleton>
    )
  }

  return (
    <SectionCard
      icon={ListChecksIcon}
      title="Tasks"
      headerAction={
        <Button variant="link" size="sm" className="h-auto p-0 text-sm">
          View All
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {taskRows.map((task) => (
          <div key={task.label} className="flex items-center gap-3">
            <div className="flex size-5 shrink-0 items-center justify-center rounded-sm border border-emerald-500 bg-emerald-500 text-white">
              <CheckIcon className="size-3.5" />
            </div>
            <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{task.label}</p>
            <p className="text-sm font-semibold">{task.count}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

export default TasksCard