import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import { Button } from "../../components/ui/button"

type StepActionsBarProps = {
  onPrevious: () => void
  onCancel: () => void
  onSaveAndContinue: () => void
  onNext: () => void
  showPrevious: boolean
  nextStepLabel: string | null
}

const StepActionsBar = ({
  onPrevious,
  onCancel,
  onSaveAndContinue,
  onNext,
  showPrevious,
  nextStepLabel,
}: StepActionsBarProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {showPrevious && (
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeftIcon className="size-4" />
            Previous
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onSaveAndContinue}>
          Save & Continue
        </Button>
        {nextStepLabel && (
          <Button onClick={onNext}>
            Next: {nextStepLabel}
            <ArrowRightIcon className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default StepActionsBar