import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AwaitingMyApprovalTable, { awaitingMyApprovalData } from "@/custom-components/loan-components/loan-awaiting-myapprovals-tab"
import AllPendingApprovalsTable, { allPendingApprovalsData } from "@/custom-components/loan-components/loan-all-pendingapprovals-tab"

const LoanApprovalsPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Review and act on loan applications pending approval
        </p>
      </div>

      <Tabs defaultValue="awaiting-my-approval">
        <TabsList variant="line" className="h-auto w-fit gap-6 bg-transparent p-0">
          <TabsTrigger
            value="awaiting-my-approval"
            className="rounded-none border-none px-0 pb-3 text-muted-foreground data-active:bg-transparent data-active:text-primary after:bg-primary"
          >
            Awaiting My Approval
            <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
              {awaitingMyApprovalData.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="all-pending-approvals"
            className="rounded-none border-none px-0 pb-3 text-muted-foreground data-active:bg-transparent data-active:text-primary after:bg-primary"
          >
            All Pending Approvals
            <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
              {allPendingApprovalsData.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="awaiting-my-approval" className="mt-4">
          <AwaitingMyApprovalTable />
        </TabsContent>

        <TabsContent value="all-pending-approvals" className="mt-4">
          <AllPendingApprovalsTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default LoanApprovalsPage