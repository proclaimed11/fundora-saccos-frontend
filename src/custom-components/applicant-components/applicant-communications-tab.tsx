import ApplicantsCommunicationsTable from "./applicant-communications-table"

const ApplicantCommunicationsTab  = () => {
  const handleSendMessage = () => {
    // Open a compose/send-message dialog here
  }

  return (
    <div className="flex flex-col gap-4">
        <ApplicantsCommunicationsTable
        onSendMessage={handleSendMessage}
        communications={[
          {
            id: "1",
            date: "May 14, 2024 10:32 AM",
            isoDate: "2024-05-14",
            type: "Notification",
            typeValue: "notification",
            channel: "SMS",
            message: "Your KYC verification has been completed successfully.",
            sentBy: "System",
            status: "Delivered",
            reference: "COM-001",
          },
          {
            id: "2",
            date: "May 14, 2024 09:15 AM",
            isoDate: "2024-05-14",
            type: "Application",
            typeValue: "application",
            channel: "Email",
            message: "Your loan application #LN-000241 has been created.",
            sentBy: "System",
            status: "Delivered",
            reference: "COM-002",
          },
          {
            id: "3",
            date: "May 13, 2024 04:45 PM",
            isoDate: "2024-05-13",
            type: "Reminder",
            typeValue: "reminder",
            channel: "SMS",
            message: "Reminder: Please complete your OTP verification.",
            sentBy: "System",
            status: "Delivered",
            reference: "COM-003",
          },
          {
            id: "4",
            date: "May 13, 2024 11:20 AM",
            isoDate: "2024-05-13",
            type: "Document Request",
            typeValue: "document_request",
            channel: "Email",
            message: "Please upload proof of address to continue.",
            sentBy: "Amina Mohamed",
            status: "Pending",
            reference: "COM-004",
          }
        ]}
      />

      
    </div>
  )
}

export default ApplicantCommunicationsTab