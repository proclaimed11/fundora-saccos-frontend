import { CheckIcon } from "lucide-react"
import { Card, CardContent } from "../../components/ui/card"
import { cn } from "../../lib/utils"

type StepStatus = "completed" | "active" | "pending"

type LoanApplicationStep = {
  step: number
  title: string
  statusLabel: string
}


const steps: LoanApplicationStep[] = [
  { step: 1, title: "Loan Details", statusLabel: "In Progress" },
  { step: 2, title: "Applicant Details", statusLabel: "Pending" },
  { step: 3, title: "Guarantors & Colateral", statusLabel: "Pending" },
  { step: 4, title: "Credit Assessment", statusLabel: "Pending" },
  { step: 5, title: "Approval Status", statusLabel: "Pending" },
  { step: 6, title: "Repayment Schedule", statusLabel: "Pending" },
  { step: 7, title: "Contract Document", statusLabel: "Pending" },
  { step: 8, title: "Repayment & Disbursement", statusLabel: "Pending" },
  { step: 9, title: "Review & Submission", statusLabel: "Pending" },
]

// currentStep drives completed / active / pending state for every step below it
const getStatus = (step: number, currentStep: number): StepStatus => {
  if (step < currentStep) return "completed"
  if (step === currentStep) return "active"
  return "pending"
}

type LoanApplicationStepperProps = {
  currentStep?: number
}

const LoanApplicationStepper = ({ currentStep = 1 }: LoanApplicationStepperProps) => {
  return (
    <Card>
      <CardContent className="flex items-start">
        {steps.map((item, index) => {
          const status = getStatus(item.step, currentStep)
          const isLast = index === steps.length - 1

          return (
            <div key={item.step} className={cn("flex items-center", !isLast && "flex-1")}>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                    (status === "completed" || status === "active") && "bg-primary text-primary-foreground",
                    status === "pending" && "bg-muted text-muted-foreground"
                  )}
                >
                  {status === "completed" ? <CheckIcon className="size-4" /> : item.step}
                </div>
                <div className="flex flex-col">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      status === "pending" ? "text-muted-foreground" : "text-foreground"
                    )}
                  >
                    {item.title}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      status === "active" && "text-primary",
                      status === "completed" && "text-muted-foreground",
                      status === "pending" && "text-muted-foreground"
                    )}
                  >
                    {item.statusLabel}
                  </p>
                </div>
              </div>

              {!isLast && (
                <div
                  className={cn(
                    "mx-4 h-px flex-1",
                    status === "completed" ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default LoanApplicationStepper