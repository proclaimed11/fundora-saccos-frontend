import { Navigate, Route, Routes } from "react-router-dom"
import { useState } from "react"
import Layout from "./custom-components/layout"
import TopLoadingBar from "./custom-components/top-loader"
import DashboardPage from "@/pages/dashboard-page"
import OnboardingKycPage from "./pages/operations-pages/applicant-pages/applicant-new-page"
import LoginPage from "./pages/auth-pages/login-page"
import ForgotPasswordPage from "./pages/auth-pages/forgot-password-page"
import ResetPasswordPage from "./pages/auth-pages/reset-password-page"

//Applicants pages
import ApplicantAuditTrailTab from "./custom-components/applicant-components/applicant-audit-trail-tab"
import ApplicantCommunicationsTab from "./custom-components/applicant-components/applicant-communications-tab"
import ApplicantLoanApplicationsTab from "./custom-components/applicant-components/applicant-loan-applications-tab"
import ApplicantOverviewTab from "./custom-components/applicant-components/applicant-profile-details-tab"
import AllApplicantsPage from "./pages/operations-pages/applicant-pages/all-applicants-page"
import ApplicantProfilePage from "./pages/operations-pages/applicant-pages/applicant-profile-page"

//loan pages
import LoansProfilePage from "./pages/operations-pages/loan-pages/loan-profile-page"
import ApplicantRegStatusTab from "./custom-components/applicant-components/applicant-reg-status-tab"
import LoanOverviewTab from "./custom-components/loan-components/loan-profile-details-tab";
import LoanApprovalsTab from "./custom-components/loan-components/loan-approvals-status-tab"
import LoanGuarantorsTab from "./custom-components/loan-components/loan-guarantors-tab"
import LoanRepaymentHistoryTab from "./custom-components/loan-components/loan-repayment-tab"
import LoanContractsDocumentsTab from "./custom-components/loan-components/loan-contracts-documents-tab"
import LoanApplicationStatusTab from "./custom-components/loan-components/loan-application-status-tab"
import LoansApplicationsPage from "./pages/operations-pages/loan-pages/loan-applications-page"
import LoanNewApplicationPage from "./pages/operations-pages/loan-pages/loan-new-application-page"
import LoanApprovalsPage from "./pages/operations-pages/loan-pages/loan-approvals-page"

//account pages
import ChartOfAccountsPage from "./pages/operations-pages/accounting-pages/charts-accounts-page"
import NewAccountPage from "./pages/operations-pages/accounting-pages/chart-account-new"
import AccountProfilePage from "./pages/operations-pages/accounting-pages/chart-account-profile-page"


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <>
      <TopLoadingBar />
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
            )
          }
        />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/applicants/onboarding" element={<OnboardingKycPage />} />
          <Route path="/applicants" element={<AllApplicantsPage />} />
          <Route path="/applicants/:applicantId" element={<ApplicantProfilePage />}>
            <Route index element={<Navigate to="applicant-details" replace />} />
            <Route path="applicant-details" element={<ApplicantOverviewTab />} />
            <Route path="registration-status" element={<ApplicantRegStatusTab/>} />
            <Route path="loan-applications" element={<ApplicantLoanApplicationsTab />} />
            <Route path="communications" element={<ApplicantCommunicationsTab />} />
            <Route path="audit-trail" element={<ApplicantAuditTrailTab />} />
          </Route>

          {/* Entry point #1 — reached from an applicant's "Loan Applications" tab */}
          <Route path="/applicants/:applicantId/loan-applications/:loanId" element={<LoansProfilePage />}>
            <Route index element={<Navigate to="loan-details" replace />} />
            <Route path="loan-details" element={<LoanOverviewTab />} />
            <Route path="loan-application-status" element={<LoanApplicationStatusTab />} />
            <Route path="approvals-status" element={<LoanApprovalsTab />} />
            <Route path="contracts-documents" element={<LoanContractsDocumentsTab />} />
            <Route path="guarantors" element={<LoanGuarantorsTab />} />
            <Route path="repayment-history" element={<LoanRepaymentHistoryTab />} />
          </Route>

          {/* Entry point #2 — reached from the standalone Loans page or Approvals page */}
          <Route path="/loans/:loanId" element={<LoansProfilePage />}>
            <Route index element={<Navigate to="loan-details" replace />} />
            <Route path="loan-details" element={<LoanOverviewTab />} />
            <Route path="loan-application-status" element={<LoanApplicationStatusTab />} />
            <Route path="approvals-status" element={<LoanApprovalsTab />} />
            <Route path="contracts-documents" element={<LoanContractsDocumentsTab />} />
            <Route path="guarantors" element={<LoanGuarantorsTab />} />
            <Route path="repayment-history" element={<LoanRepaymentHistoryTab />} />
          </Route>

          <Route path="/loans" element={<LoansApplicationsPage />} />
          <Route path="/loans/approvals" element={<LoanApprovalsPage />} />
          <Route path="/loans/new-application" element={<LoanNewApplicationPage />} />


          <Route path="/accounts" element={<ChartOfAccountsPage />}/>
          <Route path="/accounts/new-account" element={<NewAccountPage />}/>
          <Route path="/accounts/:accountId" element={<AccountProfilePage />}/>

        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </>
  )
}

export default App