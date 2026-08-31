import { useEffect, useState } from "react"
import {
  ArrowLeftIcon,
  PencilIcon,
  ArchiveIcon
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import AccountProfileHeader, { type AccountProfileHeaderData } from "@/custom-components/accounting-components/account-profile-header-card"
import AccountSummaryCard from "@/custom-components/accounting-components/account-summary-card"
import AccountTransactionsTable from "@/custom-components/accounting-components/account-transactions-table"

const AccountProfilePage = () => {
  const navigate = useNavigate()
  const { accountId } = useParams<{ accountId: string }>()
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [headerData, setHeaderData] = useState<AccountProfileHeaderData | null>(null)

  useEffect(() => {
    setIsLoading(true)
    // Replace with your real fetch, e.g. fetch(`/api/chart-of-accounts/${accountId}`)
    const timer = setTimeout(() => {
      setHeaderData({
        accountCode: "1001-00",
        accountName: "Bank - Main Operational Account",
        accountType: "Asset",
        status: "Active",
        currency: "TZS",
      })
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [accountId])

  const summaryData = {
    openingBalance: "TZS 23,500,000.00",
    totalDebits: "TZS 482,750,000.00",
    totalCredits: "TZS 505,250,000.00",
    closingBalance: "TZS 46,000,000.00",
    availableBalance: "TZS 46,000,000.00",
  }

  const handleArchive = () => {
    console.log("archive", accountId)
    setArchiveDialogOpen(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate("/accounts")}>
          <ArrowLeftIcon className="size-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            className="text-white"
            onClick={() => navigate("/applicants/onboarding", { state: { accountId } })}
          >
            <PencilIcon className="size-4" />
            Edit Account
          </Button>

          <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
            <AlertDialogTrigger
              render={
                <Button variant="outline" className="text-red-600 hover:text-red-600">
                  <ArchiveIcon className="size-4" />
                  Archive
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Archive this account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will archive {headerData?.accountName ?? "this account"}. It will no longer appear in the
                  active chart of accounts, but its records will be preserved and can be restored later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={handleArchive}
                >
                  Archive
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {isLoading || !headerData ? (
        <AccountProfileHeader isLoading />
      ) : (
        <AccountProfileHeader data={headerData} />
      )}
      <AccountSummaryCard data={summaryData} />
      <AccountTransactionsTable
        transactions={[
            {
            id: "1",
            date: "May 14, 2024",
            isoDate: "2024-05-14",
            referenceNo: "TRX-0004587",
            description: "Loan Disbursement - LA-0000241 (Juma Ali Said)",
            type: "Debit",
            debit: "25,000,000.00",
            credit: "-",
            balance: "46,000,000.00",
            },
            {
            id: "2",
            date: "May 14, 2024",
            isoDate: "2024-05-14",
            referenceNo: "TRX-0004586",
            description: "Repayment Received - LA-0000239 (Fatma Salim Rashid)",
            type: "Credit",
            debit: "-",
            credit: "1,850,000.00",
            balance: "71,000,000.00",
            },
            {
            id: "3",
            date: "May 13, 2024",
            isoDate: "2024-05-13",
            referenceNo: "TRX-0004585",
            description: "Interest Received - LA-0000239",
            type: "Credit",
            debit: "-",
            credit: "312,500.00",
            balance: "69,150,000.00",
            },
            {
            id: "4",
            date: "May 13, 2024",
            isoDate: "2024-05-13",
            referenceNo: "TRX-0004584",
            description: "Cash Deposit",
            type: "Credit",
            debit: "-",
            credit: "10,000,000.00",
            balance: "68,837,500.00",
            },
            {
            id: "5",
            date: "May 12, 2024",
            isoDate: "2024-05-12",
            referenceNo: "TRX-0004583",
            description: "Bank Charges",
            type: "Debit",
            debit: "15,000.00",
            credit: "-",
            balance: "58,837,500.00",
            },
        ]}
        />
    </div>
  )
}

export default AccountProfilePage