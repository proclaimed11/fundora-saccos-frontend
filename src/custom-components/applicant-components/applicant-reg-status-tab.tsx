import OnboardingKycStepper from "@/custom-components/operations-components/onboarding-step"
import IdentityDocumentsTable from "@/custom-components/applicant-components/applicant-id-documents-table"

const ApplicantRegStatusTab = () => {
  return (
    <div className="flex flex-col gap-4">
      <OnboardingKycStepper currentStep={3} />
      <IdentityDocumentsTable
        onView={(doc) => console.log("view", doc)}
        onDownload={(doc) => console.log("download", doc)}
        onDelete={(doc) => console.log("delete", doc)}
      />
    </div>
  )
}

export default ApplicantRegStatusTab