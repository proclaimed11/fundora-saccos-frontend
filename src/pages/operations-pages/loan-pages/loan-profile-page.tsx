import {
  ArrowLeftIcon,
  ClipboardCheckIcon,
  ReceiptIcon,
  Undo2Icon,
  RefreshCwIcon,
  ChevronDown,
} from "lucide-react"
import { Outlet, useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import LoansProfileHeader from "@/custom-components/loan-components/loan-profile-header-card"
import LoanProfileTabs from "@/custom-components/loan-components/loan-profile-tabs"

const LoansProfilePage = () => {
  const navigate = useNavigate()
  // Present only when reached via /applicants/:applicantId/loan-applications/:loanId
  // undefined when reached via /loans/:loanId
  const { applicantId } = useParams<{ applicantId: string }>()

  const loanData = {
    applicationNo: "LA-0000241",
    applicantName: "Juma Ali Said",
    applicantId: "APP-1786436767272",
    loanType: "Personal Loan",
    submittedOn: "May 10, 2024 09:15 AM",
  }

  const backTo = applicantId ? `/applicants/${applicantId}/loan-applications` : "/loans"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate(backTo)}>
          <ArrowLeftIcon className="size-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            className="text-white"
            onClick={() => console.log("complete application")}
          >
            <ClipboardCheckIcon className="size-4" />
            Complete Application
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button className="text-white">
                  <ChevronDown className="size-4" />
                  Actions
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem onClick={() => console.log("process payment")}>
                <ReceiptIcon className="size-4" />
                Process Payment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log("restructure loan")}>
                <RefreshCwIcon className="size-4" />
                Restructure Loan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => console.log("withdraw application")}>
                <Undo2Icon className="size-4" />
                Withdraw Application
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <LoansProfileHeader data={loanData} />

      <LoanProfileTabs />

      <Outlet />
    </div>
  )
}

export default LoansProfilePage