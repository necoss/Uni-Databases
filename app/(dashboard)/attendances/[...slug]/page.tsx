"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import type { Employee } from "@/types/supabase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  check_in: z.date({
    required_error: "Check-in time is required",
  }),
  check_out: z.date().nullable().optional(),
})

type AttendanceFormValues = z.infer<typeof formSchema>

interface AttendanceWithEmployee {
  attendance_id: number
  check_in: string
  check_out: string | null
  employee_id: number
  employees?: {
    employee_name: string
    employee_surname: string
  } | null
}

export default function AttendancePage({ params }: { params: { slug: string[] } }) {
  const router = useRouter()
  const { toast } = useToast()

  const [attendance, setAttendance] = useState<AttendanceWithEmployee | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [duration, setDuration] = useState<string | null>(null)

  const isNew = params.slug[0] === "new"
  const isEdit = params.slug[0] === "edit"
  const attendanceId = isEdit ? Number.parseInt(params.slug[1]) : isNew ? null : Number.parseInt(params.slug[0])

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: "",
      check_in: new Date(),
      check_out: null,
    },
  })

  // Calculate duration when check_in or check_out changes
  const watchCheckIn = form.watch("check_in")
  const watchCheckOut = form.watch("check_out")

  useEffect(() => {
    if (watchCheckIn && watchCheckOut) {
      const checkIn = new Date(watchCheckIn)
      const checkOut = new Date(watchCheckOut)
      const durationMs = checkOut.getTime() - checkIn.getTime()

      if (durationMs < 0) {
        setDuration("Check-out time must be after check-in time")
        return
      }

      const hours = Math.floor(durationMs / (1000 * 60 * 60))
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
      setDuration(`${hours}h ${minutes}m`)
    } else {
      setDuration(null)
    }
  }, [watchCheckIn, watchCheckOut])

  useEffect(() => {
    async function fetchEmployees() {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("employee_surname", { ascending: true })

      if (error) {
        console.error("Error fetching employees:", error)
      } else {
        setEmployees(data || [])
      }
    }

    async function fetchAttendance() {
      if (isNew) {
        setLoading(false)
        return
      }

      setLoading(true)

      if (attendanceId) {
        // Fetch attendance
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("attendances")
          .select(`
            *,
            employees (
              employee_name,
              employee_surname
            )
          `)
          .eq("attendance_id", attendanceId)
          .single()

        if (attendanceError) {
          console.error("Error fetching attendance:", attendanceError)
          toast({
            title: "Error",
            description: "Failed to fetch attendance data",
            variant: "destructive",
          })
          router.push("/attendances")
          return
        }

        setAttendance(attendanceData)

        // For edit mode, populate the form
        if (isEdit) {
          form.reset({
            employee_id: String(attendanceData.employee_id),
            check_in: new Date(attendanceData.check_in),
            check_out: attendanceData.check_out ? new Date(attendanceData.check_out) : null,
          })
        }
      }

      setLoading(false)
    }

    fetchEmployees()
    fetchAttendance()
  }, [attendanceId, isNew, isEdit, form, router, toast])

  const onSubmit = async (data: AttendanceFormValues) => {
    setSubmitting(true)

    try {
      // Validate check-out is after check-in if provided
      if (data.check_out && data.check_in > data.check_out) {
        toast({
          title: "Error",
          description: "Check-out time must be after check-in time",
          variant: "destructive",
        })
        setSubmitting(false)
        return
      }

      const formattedData = {
        employee_id: Number.parseInt(data.employee_id),
        check_in: data.check_in.toISOString(),
        check_out: data.check_out ? data.check_out.toISOString() : null,
      }

      if (isNew) {
        // Create new attendance
        const { data: newAttendance, error } = await supabase.from("attendances").insert([formattedData]).select()

        if (error) {
          throw error
        }

        toast({
          title: "Success",
          description: "Attendance record created successfully",
        })

        router.push("/attendances")
      } else if (isEdit && attendanceId) {
        // Update attendance
        const { error } = await supabase.from("attendances").update(formattedData).eq("attendance_id", attendanceId)

        if (error) {
          throw error
        }

        toast({
          title: "Success",
          description: "Attendance record updated successfully",
        })

        router.push("/attendances")
      }
    } catch (error: any) {
      console.error("Error saving attendance:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save attendance record",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isNew && !isEdit && attendance) {
    // View mode
    const checkIn = new Date(attendance.check_in)
    const checkOut = attendance.check_out ? new Date(attendance.check_out) : null
    let durationText = "In progress"

    if (checkOut) {
      const durationMs = checkOut.getTime() - checkIn.getTime()
      const hours = Math.floor(durationMs / (1000 * 60 * 60))
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
      durationText = `${hours}h ${minutes}m`
    }

    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Heading
            title={`Attendance Record #${attendance.attendance_id}`}
            description={
              attendance.employees
                ? `Employee: ${attendance.employees.employee_name} ${attendance.employees.employee_surname}`
                : "Unknown Employee"
            }
          />
          <Button onClick={() => router.push(`/attendances/edit/${attendance.attendance_id}`)}>Edit Record</Button>
        </div>
        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Attendance ID</h3>
            <p>{attendance.attendance_id}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Employee</h3>
            <p>
              {attendance.employees
                ? `${attendance.employees.employee_name} ${attendance.employees.employee_surname}`
                : "Unknown"}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Check In</h3>
            <p>{format(checkIn, "PPP HH:mm:ss")}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Check Out</h3>
            <p>{checkOut ? format(checkOut, "PPP HH:mm:ss") : "Not checked out"}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
            <p>{durationText}</p>
          </div>
        </div>
      </div>
    )
  }

  // New or Edit mode
  return (
    <div className="p-4 space-y-4">
      <Heading
        title={isNew ? "Create Attendance Record" : "Edit Attendance Record"}
        description={isNew ? "Add a new attendance record" : "Edit attendance record details"}
      />
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.employee_id} value={String(employee.employee_id)}>
                          {`${employee.employee_name} ${employee.employee_surname}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="check_in"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check In Time</FormLabel>
                    <DateTimePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="check_out"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check Out Time (Optional)</FormLabel>
                    <DateTimePicker date={field.value || undefined} setDate={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {duration && (
              <div className="md:col-span-2 p-4 rounded-md bg-muted">
                <p className="font-medium">Calculated Duration: {duration}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => router.push("/attendances")}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isNew ? "Create" : "Update"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
