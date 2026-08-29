import { useState } from "react"
import { XCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import StepActionsBar from "@/custom-components/operations-components/steps-action"
import LoanResultActionsBar from "@/custom-components/loan-components/loan-kyc-results-action"
import LoanApplicationStepper from "@/custom-components/operations-components/loan-application-step"
import LoanApplicationDetails from "@/custom-components/loan-components/loan-application-details-form"
import LoanApplicantDetails from "@/custom-components/loan-components/loan-applicant-details-form"
import LoanGurantorsColateralCard from "@/custom-components/loan-components/loan-guarontors-colateral-form"
import LoanDisbursementRepayment from "@/custom-components/loan-components/loan-disbursement-repayment-form"
import LoanReviewSubmissionCard from "@/custom-components/loan-components/loan-applicant-review-submission"
import LoanCreditAssesment from "@/custom-components/loan-components/loan-credit-assessment"
import LoanApplicationApproval from "@/custom-components/loan-components/loan-application-approval-status"
import LoanContract from "@/custom-components/loan-components/loan-application-contract-form"
import LoanApplicationRepaymentSchedule from "@/custom-components/loan-components/loan-application-repayment-schedule"


const stepTitles = ["Loan Details", "Applicant Details", "Guarantors & Colateral", "Credit Assessment", "Approval Status", "Repayment Schedule", "Contract Documentation", "Repaymment & Disbursement",  "Review & Submission"]

const TOTAL_STEPS = stepTitles.length

const LoanNewApplicationPage = () => {
  const [currentStep, setCurrentStep] = useState(1)

  const nextStepLabel = currentStep < TOTAL_STEPS ? stepTitles[currentStep] : null
  const isResultStep = currentStep === TOTAL_STEPS

  const handleNext = () => {
    setCurrentStep((step) => Math.min(step + 1, TOTAL_STEPS))
  }

  const handlePrevious = () => {
    setCurrentStep((step) => Math.max(step - 1, 1))
  }

  const handleSaveAndContinue = () => {
    // Persist the current step's data here, then advance
    handleNext()
  }

  const handleCancel = () => {
    // Reset or navigate away — wire up once routing/back behavior is decided
  }

  const handleContinueToLoanApplication = () => {
    // Navigate to the loan application flow here
  }

  const handleWithdrawApplication = () => {
    // Wire up: POST /api/loan-applications/{id}/withdraw (or equivalent) once available
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">New Loan Application</h1>
          <p className="text-sm text-muted-foreground">
            {isResultStep ? "KYC verification completed" : "Capture applicant details and complete KYC verification"}
          </p>
        </div>

        <Button
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600"
          onClick={handleWithdrawApplication}
        >
          <XCircleIcon className="size-4" />
          Withdraw Application
        </Button>
      </div>

      <LoanApplicationStepper currentStep={currentStep} />

      <div className="flex flex-col gap-4">
        {currentStep === 1 && <LoanApplicationDetails />}
        {currentStep === 2 && <LoanApplicantDetails />}
        {currentStep === 3 && <LoanGurantorsColateralCard/>}
        {currentStep === 4 && <LoanCreditAssesment/>}
        {currentStep === 5 && <LoanApplicationApproval/>}
        {currentStep === 6 && <LoanApplicationRepaymentSchedule/>}
        {currentStep === 7 && <LoanContract/>}
        {currentStep === 8 && <LoanDisbursementRepayment/>}
        {currentStep === 9 && <LoanReviewSubmissionCard />}

        {isResultStep ? (
          <LoanResultActionsBar
            onBack={handlePrevious}
            onContinueToLoanApplication={handleContinueToLoanApplication}
          />
        ) : (
          <StepActionsBar
            onPrevious={handlePrevious}
            onCancel={handleCancel}
            onSaveAndContinue={handleSaveAndContinue}
            onNext={handleNext}
            showPrevious={currentStep > 1}
            nextStepLabel={nextStepLabel}
          />
        )}
      </div>
    </div>
  )
}

export default LoanNewApplicationPage