import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Calendar } from "../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"

const DashboardDatePicker = () => {
  const [date, setDate] = useState<Date | undefined>(new Date(2025, 4, 14))

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" className="gap-2 font-normal bg-white">
            <CalendarIcon className="size-4 text-muted-foreground" strokeWidth={0.7}/>
            {date ? format(date, "MMM d, yyyy") : "Pick a date"}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </PopoverContent>
    </Popover>
  )
}

const DashboardGreeting = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Good morning, Amina 👋</h2>
        <p className="text-sm text-muted-foreground">Here's what's happening with your loan portfolio today.</p>
      </div>
      <DashboardDatePicker />
    </div>
  )
}

export default DashboardGreeting