import { useState } from "react"
import { CheckIcon, ClockIcon, XIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { cn } from "@/lib/utils"

type ApprovalStatus = "approved" | "pending" | "waiting"

type ApprovalStep = {
  id: string
  level: string
  role: string
  name: string
  initials: string
  status: ApprovalStatus
  statusLabel: string
  fieldOneLabel: string
  fieldOneValue: string
  commentLabel: string
  commentValue: string
  rightLabel: string
  rightValue: string
  isCurrent?: boolean
}

const steps: ApprovalStep[] = [
  {
    id: "1",
    level: "Level 1",
    role: "Admin",
    name: "Amina Mohamed",
    initials: "AM",
    status: "approved",
    statusLabel: "Approved",
    fieldOneLabel: "Decision",
    fieldOneValue: "Approved",
    commentLabel: "Comment",
    commentValue: "All good",
    rightLabel: "Approved On",
    rightValue: "May 14, 2024 10:35 AM",
  },
  {
    id: "2",
    level: "Level 2",
    role: "Manager",
    name: "Hassan Bakari",
    initials: "HB",
    status: "pending",
    statusLabel: "Pending",
    fieldOneLabel: "Status",
    fieldOneValue: "Awaiting Approval",
    commentLabel: "Comment",
    commentValue: "–",
    rightLabel: "Action Required",
    rightValue: "Your approval is required",
    isCurrent: true,
  },
  {
    id: "3",
    level: "Level 3",
    role: "Committee",
    name: "Loan Committee",
    initials: "CM",
    status: "waiting",
    statusLabel: "Pending",
    fieldOneLabel: "Status",
    fieldOneValue: "Waiting for Manager approval",
    commentLabel: "Comment",
    commentValue: "–",
    rightLabel: "Action Required",
    rightValue: "Pending",
  },
]

const statusIconStyles: Record<ApprovalStatus, string> = {
  approved: "bg-primary text-primary-foreground",
  pending: "bg-amber-400 text-white",
  waiting: "bg-muted text-muted-foreground border border-border",
}

const statusBadgeStyles: Record<ApprovalStatus, string> = {
  approved: "bg-primary/10 text-primary hover:bg-primary/10",
  pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  waiting: "bg-muted text-muted-foreground hover:bg-muted",
}

const avatarStyles: Record<ApprovalStatus, string> = {
  approved: "bg-primary/10 text-primary",
  pending: "bg-amber-100 text-amber-700",
  waiting: "bg-muted text-muted-foreground",
}

const MAX_COMMENT_LENGTH = 500

const StepIcon = ({ status }: { status: ApprovalStatus }) => {
  return (
    <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", statusIconStyles[status])}>
      {status === "approved" && <CheckIcon className="size-4" />}
      {status === "pending" && <ClockIcon className="size-4" />}
    </div>
  )
}

const ApprovalStepCard = ({ step, isLast }: { step: ApprovalStep; isLast: boolean }) => {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <StepIcon status={step.status} />
        {!isLast && <div className="w-px flex-1 bg-border" />}
      </div>

      <Card className="mb-6 flex-1 gap-0 bg-card py-4">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarFallback className={avatarStyles[step.status]}>{step.initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">
                {step.role} <span className="text-muted-foreground">({step.level})</span>
              </p>
              <p className="text-sm text-muted-foreground">{step.name}</p>
              <Badge className={cn("w-fit", statusBadgeStyles[step.status])} variant="secondary">
                {step.statusLabel}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-1 sm:w-32">
            <p className="text-xs text-muted-foreground">{step.fieldOneLabel}</p>
            <p
              className={cn(
                "text-sm font-medium",
                step.status === "approved" && "text-primary"
              )}
            >
              {step.fieldOneValue}
            </p>
          </div>

          <div className="flex flex-col gap-1 sm:w-32">
            <p className="text-xs text-muted-foreground">{step.commentLabel}</p>
            <p className="text-sm">{step.commentValue}</p>
          </div>

          {step.isCurrent ? (
            <div className="flex flex-col gap-2 sm:w-52">
              <p className="text-xs text-muted-foreground">{step.rightLabel}</p>
              <div className="flex flex-row gap-2">
                <Button size="sm" className="gap-1.5">
                  <CheckIcon className="size-4" />
                  Approve
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50">
                  <XIcon className="size-4" />
                  Reject
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 sm:w-44">
              <p className="text-xs text-muted-foreground">{step.rightLabel}</p>
              <p className="text-sm font-medium">{step.rightValue}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const LoanApprovalStatusCard = () => {
  const [comment, setComment] = useState("")

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold">Approval Hierarchy</h2>
          <p className="text-sm text-muted-foreground">
            Approval follows the default hierarchy: Admin → Manager → Committee
          </p>
        </div>

        <div className="flex flex-col">
          {steps.map((step, idx) => (
            <ApprovalStepCard key={step.id} step={step} isLast={idx === steps.length - 1} />
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t pt-4">
          <Label htmlFor="approval-comment" className="text-sm font-medium">
            Comments (Optional)
          </Label>
          <Textarea
            id="approval-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
            maxLength={MAX_COMMENT_LENGTH}
            placeholder="Add any comments or instructions for the next approver..."
            className="min-h-24 resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {comment.length}/{MAX_COMMENT_LENGTH} characters
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoanApprovalStatusCard