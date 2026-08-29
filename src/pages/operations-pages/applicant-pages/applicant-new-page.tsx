import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeftIcon, XCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import OnboardingKycStepper from "@/custom-components/operations-components/onboarding-step"
import PersonalDetailsForm from "@/custom-components/applicant-components/applicant-details-form"
import IdentificationDocumentsCard from "@/custom-components/applicant-components/applicant-id-documents-form"
import NidaTinForm from "@/custom-components/applicant-components/applicant-nida-tin-form"
import OtpVerificationForm from "@/custom-components/applicant-components/applicant-otp-verification-form"
import KycResultCard from "@/custom-components/applicant-components/applicant-kyc-results-card"
import StepActionsBar from "@/custom-components/operations-components/steps-action"
import KycResultActionsBar from "@/custom-components/applicant-components/applicant-kyc-results-action"

const stepTitles = ["Personal Details", "ID & Documents", "NIDA / TIN", "OTP Verification", "KYC Result"]

const TOTAL_STEPS = stepTitles.length

const OnboardingKycPage = () => {
  const navigate = useNavigate()
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

  const handleWithdrawRegistration = () => {
    // Wire up: withdraw/cancel the in-progress applicant registration once the endpoint is confirmed
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate("/applicants")}>
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Registration & KYC</h1>
            <p className="text-sm text-muted-foreground">
              {isResultStep ? "KYC verification completed" : "Capture applicant details and complete KYC verification"}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600"
          onClick={handleWithdrawRegistration}
        >
          <XCircleIcon className="size-4" />
          Withdraw Registration
        </Button>
      </div>

      <OnboardingKycStepper currentStep={currentStep} />

      <div className="flex flex-col gap-4">
        {currentStep === 1 && <PersonalDetailsForm />}
        {currentStep === 2 && <IdentificationDocumentsCard />}
        {currentStep === 3 && <NidaTinForm />}
        {currentStep === 4 && <OtpVerificationForm />}
        {currentStep === 5 && <KycResultCard />}

        {isResultStep ? (
          <KycResultActionsBar
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

export default OnboardingKycPage