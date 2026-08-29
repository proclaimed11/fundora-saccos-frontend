import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

const PersonalDetailsForm = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Personal Details</CardTitle>
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
            <Label htmlFor="dob">
              Date of Birth <span className="text-destructive">*</span>
            </Label>
            <Input id="dob" type="date" />
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
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="maritalStatus">
              Marital Status <span className="text-destructive">*</span>
            </Label>
            <Select>
              <SelectTrigger id="maritalStatus" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="juma.said@example.com" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address">
            Address (Text) <span className="text-destructive">*</span>
          </Label>
          <Input id="address" placeholder="Mikocheni, Biafra Road, House No. 123, Dar es Salaam, Tanzania" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nationality">
              Nationality <span className="text-destructive">*</span>
            </Label>
            <Select defaultValue="tanzanian">
              <SelectTrigger id="nationality" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tanzanian">Tanzanian</SelectItem>
                <SelectItem value="kenyan">Kenyan</SelectItem>
                <SelectItem value="ugandan">Ugandan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="occupation">
              Occupation <span className="text-destructive">*</span>
            </Label>
            <Input id="occupation" placeholder="Business Owner" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PersonalDetailsForm