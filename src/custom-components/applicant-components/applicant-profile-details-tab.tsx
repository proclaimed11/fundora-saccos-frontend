import { ClipboardIcon } from "lucide-react"
import SectionCard from "../section-card";

const personalInformation = {
  ApplicantId: "APP-1243",
  fullName: "Juma Ali Said",
  dateOfBirth: "May 14, 1990",
  gender: "Male",
  maritalStatus: "Married",
  nationality: "Tanzanian",
  occupation: "Business Owner",
  nationalId: "19900514-12345-00001-23",
  tinNumber: "123-456-789",
  phoneNumber: "+255 712 345 678",
  emailAddress: "juma.said@example.com",
  residentialAddressLine1: "Mikocheni, Biafra Road,",
  residentialAddressLine2: "House No. 123, Dar es Salaam",
}

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start gap-4">
    <p className="w-32 shrink-0 text-sm text-muted-foreground">{label}</p>
    <p className="text-sm font-medium">{value}</p>
  </div>
)

const ApplicantOverviewTab = () => {
  return (
    <div className="flex flex-col gap-4">
      <SectionCard icon={ClipboardIcon} title="Personal Information">
        <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-border">
          <div className="flex flex-col gap-3 md:pr-12">
            <InfoField label="Applicant ID" value={personalInformation.ApplicantId} />
            <InfoField label="Full Name" value={personalInformation.fullName} />
            <InfoField label="Date of Birth" value={personalInformation.dateOfBirth} />
            <InfoField label="Gender" value={personalInformation.gender} />
            <InfoField label="Marital Status" value={personalInformation.maritalStatus} />
            <InfoField label="Nationality" value={personalInformation.nationality} />
            <InfoField label="Occupation" value={personalInformation.occupation} />
          </div>

          <div className="flex flex-col gap-3 md:pl-12">
            <InfoField label="National ID (NIDA)" value={personalInformation.nationalId} />
            <InfoField label="Tin Number" value={personalInformation.tinNumber} />
            <InfoField label="Phone Number" value={personalInformation.phoneNumber} />
            <InfoField label="Email Address" value={personalInformation.emailAddress} />
            <div className="flex items-start gap-4">
              <p className="w-32 shrink-0 text-sm text-muted-foreground">Residential Address</p>
              <p className="text-sm font-medium">
                {personalInformation.residentialAddressLine1}
                <br />
                {personalInformation.residentialAddressLine2}
              </p>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

export default ApplicantOverviewTab