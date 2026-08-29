import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"

const OtpVerificationForm = () => {
  const [otpSent, setOtpSent] = useState(false)

  const handleRequestOtp = () => {
    // Trigger OTP send here (API call), then flip state so the OTP field becomes relevant
    setOtpSent(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">OTP Verification</CardTitle>
        <CardDescription>Verify the applicant's email with a one-time passcode</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="otpEmail">
            Email Address <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <Input id="otpEmail" type="email" placeholder="juma.said@example.com" className="flex-1" />
            <Button type="button" variant="secondary" onClick={handleRequestOtp} className="shrink-0">
              Request OTP
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="otpCode">
            OTP Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id="otpCode"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter the 6-digit code"
            className="max-w-xs"
          />
          {otpSent && (
            <p className="text-xs text-muted-foreground">A code was sent — check the applicant's inbox.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default OtpVerificationForm