import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { useAuth } from './auth/authContext'
import { Login } from './pages/auth/login'
import { TwoFactor } from './pages/auth/twoFactor'
import { ForgotPassword } from './pages/auth/forgotPassword'
import { ResetPassword } from './pages/auth/resetPassword'
import { MyAccountPage } from './pages/auth/myAccount'
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
import { ThemeSettingsPage } from './pages/administration/themeSettings'
import { PaymentsPage } from './pages/loans/payments'
import { PenaltiesPage } from './pages/loans/penalties'
import { CollectionCasesPage } from './pages/collections/collectionCases'
import { RecoveryCasesPage } from './pages/collections/recoveryCases'
import { NplPage } from './pages/collections/npl'
import { ChartOfAccountsPage } from './pages/accounting/chartOfAccounts'
import { GlTransactionsPage } from './pages/accounting/glTransactions'
import { ReportsPage } from './pages/reports/reports'
import { UsersPage } from './pages/administration/users/users'
import { RolesPage } from './pages/administration/roles/roles'
import { ApprovalHierarchyPage } from './pages/administration/approvalHierarchy/approvalHierarchy'
import { CompanyProfilePage } from './pages/administration/companyProfile/companyProfile'
import { SecurityPage } from './pages/administration/security/security'
import { NotificationsPage } from './pages/administration/notifications/notifications'
import { AuditPage } from './pages/administration/audit/audit'

// pages inside this route need a logged-in user
function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function LoginRoute() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  // already logged in -> skip the login page
  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <Login
      onLogin={async (username, password) => {
        // UI only: signing in as "2fa" shows the two-factor step so it can be previewed.
        // TODO: replace with the real response of POST /api/auth/login (requiresTwoFactor, twoFactorToken)
        if (username.toLowerCase() === '2fa') {
          navigate('/two-factor', { state: { username, email: 'ad***@gmail.com' } })
          return
        }
        await login(username, password)
      }}
    />
  )
}

function TwoFactorRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />
  return <TwoFactor />
}

function ForgotPasswordRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />
  return <ForgotPassword />
}

function ResetPasswordRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />
  return <ResetPassword />
}

function App() {
  return (
    <>
      <Preloader />
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/two-factor" element={<TwoFactorRoute />} />
        <Route path="/forgot-password" element={<ForgotPasswordRoute />} />
        <Route path="/reset-password" element={<ResetPasswordRoute />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<MyAccountPage />} />
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

          {/* Administration */}
         <Route path="/users" element={<UsersPage />} />
         <Route path="/roles" element={<RolesPage />} />
         <Route path="/approval-hierarchy" element={<ApprovalHierarchyPage />} />
         <Route path="/company-profile" element={<CompanyProfilePage />} />
         <Route path="/security" element={<SecurityPage />} />
         <Route path="/notifications" element={<NotificationsPage />} />
         <Route path="/audit" element={<AuditPage />} />



          <Route path="/theme-settings" element={<ThemeSettingsPage />} />
          {/* new pages go here, using the path from navItems.tsx */}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App