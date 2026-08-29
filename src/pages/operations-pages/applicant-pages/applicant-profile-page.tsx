import { useState } from "react"
import {
  ArrowLeftIcon,
  PencilIcon,
  ArchiveIcon,
  ClipboardCheckIcon,
} from "lucide-react"
import { Outlet, useNavigate, useParams } from "react-router-dom"
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
import ApplicantProfileHeader from "@/custom-components/applicant-components/applicant-profile-header-card"
import ApplicantProfileTabs from "@/custom-components/applicant-components/applicant-profile-tabs"

const ApplicantProfilePage = () => {
  const navigate = useNavigate()
  const { applicantId } = useParams<{ applicantId: string }>()
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)

  const profileData = {
    fullName: "Juma Ali Said",
    applicantTag: "Verified",
    phone: "+255 712 345 678",
    email: "juma.said@example.com",
    addressLine1: "Mikocheni, Biafra Road,",
    addressLine2: "House No. 123, Dar es Salaam, Tanzania",
    applicantId: "APP-1243",
    nationality: "Tanzanian",
  }

  const handleArchive = () => {
    console.log("archive", applicantId)
    setArchiveDialogOpen(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate("/applicants")}>
          <ArrowLeftIcon className="size-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            className="text-white"
            onClick={() => navigate("/applicants/onboarding", { state: { applicantId } })}
          >
            <ClipboardCheckIcon className="size-4" />
            Complete Application
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/applicants/onboarding", { state: { applicantId } })}
          >
            <PencilIcon className="size-4" />
            Edit Profile
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
                <AlertDialogTitle>Archive this applicant?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will archive {profileData.fullName}'s profile. They'll no longer appear in the active
                  applicants list, but their records will be preserved and can be restored later.
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

      <ApplicantProfileHeader data={profileData} />

      <ApplicantProfileTabs />

      <Outlet />
    </div>
  )
}

export default ApplicantProfilePage