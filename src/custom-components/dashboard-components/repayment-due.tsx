import { ClockIcon } from "lucide-react"
import SectionCard from "../section-card"
import { Button } from "../../components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"

type RepaymentDue = {
  loanee: string
  loanId: string
  amount: string
  daysOverdue: number
}

const repaymentsDue: RepaymentDue[] = [
  { loanee: "Salim Juma", loanId: "LN-2024-0892", amount: "1,250,000", daysOverdue: 0 },
  { loanee: "Neema Issa", loanId: "LN-2024-0771", amount: "750,000", daysOverdue: 0 },
  { loanee: "Yusuf Khamis", loanId: "LN-2024-0663", amount: "1,500,000", daysOverdue: 0 },
  { loanee: "Maryam Said", loanId: "LN-2024-0910", amount: "980,000", daysOverdue: 0 },
  { loanee: "Rajab Mussa", loanId: "LN-2024-0588", amount: "2,300,000", daysOverdue: 0 },
]

const RepaymentDueTodayTable = () => {
  return (
    <SectionCard
      icon={ClockIcon}
      title="Repayment Due Today"
      headerAction={
        <Button variant="link" size="sm" className="h-auto p-0 text-sm">
          View All
        </Button>
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Loanee</TableHead>
            <TableHead>Loan ID</TableHead>
            <TableHead>Amount (TZS)</TableHead>
            <TableHead>Days Overdue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repaymentsDue.map((repayment) => (
            <TableRow key={repayment.loanId}>
              <TableCell className="font-medium">{repayment.loanee}</TableCell>
              <TableCell className="text-muted-foreground">{repayment.loanId}</TableCell>
              <TableCell>{repayment.amount}</TableCell>
              <TableCell className="font-medium text-emerald-600">{repayment.daysOverdue}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionCard>
  )
}

export default RepaymentDueTodayTable