import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Switch } from "../../components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

const LoanApplicantDetails = () => {
  const [isReturning, setIsReturning] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Applicant Details</CardTitle>
        <p className="text-sm text-muted-foreground">Capture comprehensive information about the applicant</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="firstName">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input id="firstName" placeholder="Juma" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="middleName">Middle Name</Label>
            <Input id="middleName" placeholder="Ali" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lastName">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input id="lastName" placeholder="Said" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dateOfBirth">
              Date of Birth <span className="text-destructive">*</span>
            </Label>
            <Input id="dateOfBirth" type="date" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gender">
              Gender <span className="text-destructive">*</span>
            </Label>
            <Select>
              <SelectTrigger id="gender" className="w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nationality">
              Nationality <span className="text-destructive">*</span>
            </Label>
            <Select defaultValue="Tanzanian">
              <SelectTrigger id="nationality" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tanzanian">Tanzanian</SelectItem>
                <SelectItem value="Kenyan">Kenyan</SelectItem>
                <SelectItem value="Ugandan">Ugandan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t pt-5">
          <h3 className="text-sm font-semibold">Contact Information</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Select defaultValue="+255">
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+255">+255</SelectItem>
                    <SelectItem value="+254">+254</SelectItem>
                    <SelectItem value="+256">+256</SelectItem>
                  </SelectContent>
                </Select>
                <Input id="phone" placeholder="712 345 678" className="flex-1" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input id="email" type="email" placeholder="juma.said@example.com" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">
              Residential Address <span className="text-destructive">*</span>
            </Label>
            <Input id="address" placeholder="Mikocheni, Biafra Road, House No. 123, Dar es Salaam, Tanzania" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="locationName">
              Location Name <span className="text-destructive">*</span>
            </Label>
            <Input id="locationName" placeholder="Dar es Salaam City Center" />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t pt-5">
          <h3 className="text-sm font-semibold">Other</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="occupation">
                Occupation <span className="text-destructive">*</span>
              </Label>
              <Input id="occupation" placeholder="Business Owner" />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Returning Applicant</p>
                <p className="text-xs text-muted-foreground">
                  Existing, still-valid KYC on file
                </p>
              </div>
              <Switch checked={isReturning} onCheckedChange={setIsReturning} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoanApplicantDetails