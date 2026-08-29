import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"

const NidaTinForm = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">NIDA / TIN</CardTitle>
        <CardDescription>Enter the applicant's national identity and taxpayer numbers</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nidaNumber">
              NIDA Number <span className="text-destructive">*</span>
            </Label>
            <Input id="nidaNumber" type="text" inputMode="numeric" placeholder="19900514-12345-00001-23" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tinNumber">TIN Number</Label>
            <Input id="tinNumber" type="text" inputMode="numeric" placeholder="123-456-789" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default NidaTinForm