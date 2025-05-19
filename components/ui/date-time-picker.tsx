"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateTimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  disabled?: boolean
}

export function DateTimePicker({ date, setDate, disabled = false }: DateTimePickerProps) {
  const [selectedTime, setSelectedTime] = React.useState<{
    hours: string
    minutes: string
  }>({
    hours: date ? String(date.getHours()).padStart(2, "0") : "00",
    minutes: date ? String(date.getMinutes()).padStart(2, "0") : "00",
  })

  // Update the time when the date changes
  React.useEffect(() => {
    if (date) {
      setSelectedTime({
        hours: String(date.getHours()).padStart(2, "0"),
        minutes: String(date.getMinutes()).padStart(2, "0"),
      })
    }
  }, [date])

  // Update the date with the selected time
  const updateDateWithTime = React.useCallback(
    (newDate: Date | undefined) => {
      if (!newDate) {
        setDate(undefined)
        return
      }

      const hours = Number.parseInt(selectedTime.hours)
      const minutes = Number.parseInt(selectedTime.minutes)

      const updatedDate = new Date(newDate)
      updatedDate.setHours(hours)
      updatedDate.setMinutes(minutes)

      setDate(updatedDate)
    },
    [selectedTime, setDate],
  )

  // Update the time and date
  const handleTimeChange = React.useCallback(
    (type: "hours" | "minutes", value: string) => {
      const newTime = {
        ...selectedTime,
        [type]: value,
      }
      setSelectedTime(newTime)

      if (date) {
        const newDate = new Date(date)
        if (type === "hours") {
          newDate.setHours(Number.parseInt(value))
        } else {
          newDate.setMinutes(Number.parseInt(value))
        }
        setDate(newDate)
      }
    },
    [date, selectedTime, setDate],
  )

  // Generate hours and minutes options
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP HH:mm") : <span>Pick a date and time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={updateDateWithTime} initialFocus />
        <div className="border-t border-border p-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedTime.hours} onValueChange={(value) => handleTimeChange("hours", value)}>
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="Hours" />
            </SelectTrigger>
            <SelectContent position="popper">
              {hours.map((hour) => (
                <SelectItem key={hour} value={hour}>
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">:</span>
          <Select value={selectedTime.minutes} onValueChange={(value) => handleTimeChange("minutes", value)}>
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="Minutes" />
            </SelectTrigger>
            <SelectContent position="popper">
              {minutes.map((minute) => (
                <SelectItem key={minute} value={minute}>
                  {minute}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  )
}
