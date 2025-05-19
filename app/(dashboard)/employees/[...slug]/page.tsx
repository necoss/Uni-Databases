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
import { Input } from "@/components/ui/input"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import type { Employee, Attendance } from "@/types/supabase"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"

const formSchema = z.object({
  employee_name: z.string().min(1, "First name is required"),
  employee_surname: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .email("Invalid email format")
    .regex(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, "Invalid email format"),
  position: z.string().min(1, "Position is required"),
  hire_date: z.date({
    required_error: "Hire date is required",
  }),
})

type EmployeeFormValues = z.infer<typeof formSchema>

export default function EmployeePage({ params }: { params: { slug: string[] } }) {
  const router = useRouter()
  const { toast } = useToast()

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const isNew = params.slug[0] === "new"
  const isEdit = params.slug[0] === "edit"
  const employeeId = isEdit ? Number.parseInt(params.slug[1]) : isNew ? null : Number.parseInt(params.slug[0])

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_name: "",
      employee_surname: "",
      email: "",
      position: "",
      hire_date: new Date(),
    },
  })

  useEffect(() => {
    async function fetchEmployee() {
      if (isNew) {
        setLoading(false)
        return
      }

      setLoading(true)

      if (employeeId) {
        // Fetch employee
        const { data: employeeData, error: employeeError } = await supabase
          .from("employees")
          .select("*")
          .eq("employee_id", employeeId)
          .single()

        if (employeeError) {
          console.error("Error fetching employee:", employeeError)
          toast({
            title: "Error",
            description: "Failed to fetch employee data",
            variant: "destructive",
          })
          router.push("/employees")
          return
        }

        setEmployee(employeeData)

        // Populate form
        if (!isEdit) {
          // Only fetch attendances for view mode
          const { data: attendanceData, error: attendanceError } = await supabase
            .from("attendances")
            .select("*")
            .eq("employee_id", employeeId)
            .order("check_in", { ascending: false })

          if (attendanceError) {
            console.error("Error fetching attendances:", attendanceError)
          } else {
            setAttendances(attendanceData || [])
          }
        } else {
          // For edit mode, populate the form
          form.reset({
            employee_name: employeeData.employee_name,
            employee_surname: employeeData.employee_surname,
            email: employeeData.email,
            position: employeeData.position,
            hire_date: new Date(employeeData.hire_date),
          })
        }
      }

      setLoading(false)
    }

    fetchEmployee()
  }, [employeeId, isNew, isEdit, form, router, toast])

  const onSubmit = async (data: EmployeeFormValues) => {
    setSubmitting(true)

    try {
      const formattedData = {
        ...data,
        hire_date: data.hire_date.toISOString(),
      }

      if (isNew) {
        // Create new employee
        const { data: newEmployee, error } = await supabase.from("employees").insert([formattedData]).select()

        if (error) {
          throw error
        }

        toast({
          title: "Success",
          description: "Employee created successfully",
        })

        router.push("/employees")
      } else if (isEdit && employeeId) {
        // Update employee
        const { error } = await supabase.from("employees").update(formattedData).eq("employee_id", employeeId)

        if (error) {
          throw error
        }

        toast({
          title: "Success",
          description: "Employee updated successfully",
        })

        router.push("/employees")
      }
    } catch (error: any) {
      console.error("Error saving employee:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save employee",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Columns for attendance table
  const attendanceColumns: ColumnDef<Attendance>[] = [
    {
      accessorKey: "check_in",
      header: "Check In",
      cell: ({ row }) => {
        const date = row.getValue("check_in") as string
        return format(new Date(date), "PPP HH:mm")
      },
    },
    {
      accessorKey: "check_out",
      header: "Check Out",
      cell: ({ row }) => {
        const date = row.getValue("check_out") as string
        return date ? format(new Date(date), "PPP HH:mm") : "Not checked out"
      },
    },
    {
      id: "duration",
      header: "Duration",
      cell: ({ row }) => {
        const checkIn = new Date(row.getValue("check_in") as string)
        const checkOutValue = row.getValue("check_out") as string | null

        if (!checkOutValue) return "In progress"

        const checkOut = new Date(checkOutValue)
        const durationMs = checkOut.getTime() - checkIn.getTime()
        const hours = Math.floor(durationMs / (1000 * 60 * 60))
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

        return `${hours}h ${minutes}m`
      },
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isNew && !isEdit && employee) {
    // View mode
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Heading title={`${employee.employee_name} ${employee.employee_surname}`} description={employee.position} />
          <Button onClick={() => router.push(`/employees/edit/${employee.employee_id}`)}>Edit Employee</Button>
        </div>
        <Separator />

        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Employee Details</TabsTrigger>
            <TabsTrigger value="attendances">Attendance Records</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Employee ID</h3>
                <p>{employee.employee_id}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                <p>{`${employee.employee_name} ${employee.employee_surname}`}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p>{employee.email}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Position</h3>
                <p>{employee.position}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Hire Date</h3>
                <p>{format(new Date(employee.hire_date), "PPP")}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attendances" className="pt-4">
            <DataTable columns={attendanceColumns} data={attendances} />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // New or Edit mode
  return (
    <div className="p-4 space-y-4">
      <Heading
        title={isNew ? "Create Employee" : "Edit Employee"}
        description={isNew ? "Add a new employee to the system" : "Edit employee details"}
      />
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="employee_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employee_surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input placeholder="Software Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hire_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Hire Date</FormLabel>
                  <DateTimePicker date={field.value} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => router.push("/employees")}>
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
