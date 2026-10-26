import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/authContext'
import { Login } from './pages/auth/login'
import { Dashboard } from './pages/dashboard'
import { Applicants } from './pages/applicants/allApplicants'
import { NewApplicantPage } from './pages/applicants/newApplicant'
import { ApplicantProfile } from './pages/applicants/applicantProfile'
import { KycReview } from './pages/applicants/applicantsKYCReview'
import { Preloader } from './components/preloader'
import { LoanApplications } from './pages/loans/loanApplications'
import { LoanApplicationProfile } from './pages/loans/loanApplicationProfile'
import { NewLoanApplicationPage } from './pages/loans/newLoanApplication'
import { ApprovalsPage } from './pages/loans/approvals'
import { ContractsPage } from './pages/loans/contracts'
import { DisbursementsPage } from './pages/loans/disbursements'
import { LoansPage } from './pages/loans/loans'
import { LoanProfile } from './pages/loans/loanProfile'
import { ThemeSettingsPage } from './pages/themeSettings'
import { PaymentsPage } from './pages/loans/payments'
import { PenaltiesPage } from './pages/loans/penalties'
import { CollectionCasesPage } from './pages/collections/collectionCases'
import { RecoveryCasesPage } from './pages/collections/recoveryCases'
import { NplPage } from './pages/collections/npl'
import { ChartOfAccountsPage } from './pages/accounting/chartOfAccounts'
import { GlTransactionsPage } from './pages/accounting/glTransactions'
import { ReportsPage } from './pages/reports/reports'

// pages inside this route need a logged-in user
function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function LoginRoute() {
  const { isAuthenticated, login } = useAuth()
  // already logged in -> skip the login page
  if (isAuthenticated) return <Navigate to="/" replace />
  return <Login onLogin={login} />
}

function App() {
  return (
    <>
      <Preloader />
      <Routes>
        <Route path="/login" element={<LoginRoute />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />

          {/* applicants */}
          <Route path="/applicants" element={<Applicants />} />
          <Route path="/applicants/new" element={<NewApplicantPage />} />
          <Route path="/applicants/:id" element={<ApplicantProfile />} />
          <Route path="/kyc-review" element={<KycReview />} />

           {/* loans */}
          <Route path="/loan-applications" element={<LoanApplications />} />
          <Route path="/loan-applications/new" element={<NewLoanApplicationPage />} />
          <Route path="/loan-applications/:id" element={<LoanApplicationProfile />} />
          <Route path="/loan-approvals" element={<ApprovalsPage />} />
          <Route path="/loan-contracts" element={<ContractsPage />} />
          <Route path="/loan-disbursements" element={<DisbursementsPage />} />
          <Route path="/loans" element={<LoansPage />} />
          <Route path="/loans/:id" element={<LoanProfile />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/penalties" element={<PenaltiesPage />} />
          <Route path="/collection-cases" element={<CollectionCasesPage />} />
          <Route path="/recovery-cases" element={<RecoveryCasesPage />} />
          <Route path="/npl" element={<NplPage />} />

          {/* accounting */}
          <Route path="/chart-of-accounts" element={<ChartOfAccountsPage />} />
          <Route path="/gl-transactions" element={<GlTransactionsPage />} />

          {/* reports */}
          <Route path="/reports" element={<ReportsPage />} />




          <Route path="/theme-settings" element={<ThemeSettingsPage />} />
          {/* new pages go here, using the path from navItems.tsx */}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App