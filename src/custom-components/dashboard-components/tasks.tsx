import { CheckIcon, ListChecksIcon } from "lucide-react"
import SectionCard from "../section-card"
import { Button } from "../../components/ui/button"

type TaskRow = {
  label: string
  count: number
}

const taskRows: TaskRow[] = [
  { label: "Review pending applications", count: 14 },
  { label: "Approve loans", count: 7 },
  { label: "Upload disbursement proofs", count: 5 },
  { label: "Verify guarantor documents", count: 9 },
]

const TasksCard = () => {
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