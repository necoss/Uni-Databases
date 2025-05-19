"use client"

import { useState, useEffect } from "react"
import { format, differenceInDays } from "date-fns"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { supabase } from "@/lib/supabase"
import type { ColumnDef } from "@tanstack/react-table"
import type { Task, PriorityLevel } from "@/types/supabase"

interface TaskWithProject extends Task {
  project_name?: string
}

interface AttendanceWithEmployee {
  employee_id: number
  employee_name: string
  employee_surname: string
  total_hours: number
}

interface TasksByPriority {
  priority: PriorityLevel
  count: number
  avg_days_to_deadline: number | null
  tasks: TaskWithProject[]
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<TaskWithProject[]>([])
  const [tasksByPriority, setTasksByPriority] = useState<TasksByPriority[]>([])
  const [employeeHours, setEmployeeHours] = useState<AttendanceWithEmployee[]>([])

  // Filters
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10
  const totalPages = Math.ceil(tasks.length / rowsPerPage)

  useEffect(() => {
    async function fetchReportData() {
      setLoading(true)

      // Fetch tasks with project names
      let query = supabase.from("tasks").select(`
          *,
          projects (
            project_name
          )
        `)

      // Apply filters if set
      if (priorityFilter !== "all") {
        query = query.eq("priority", priorityFilter)
      }

      if (startDate) {
        query = query.gte("deadline", startDate.toISOString())
      }

      if (endDate) {
        query = query.lte("deadline", endDate.toISOString())
      }

      const { data: taskData, error: taskError } = await query.order("priority", { ascending: false })

      if (taskError) {
        console.error("Error fetching tasks:", taskError)
      } else {
        // Transform the data to flatten the structure
        const transformedTasks = taskData.map((task) => ({
          ...task,
          project_name: task.projects?.project_name,
        }))
        setTasks(transformedTasks || [])

        // Group tasks by priority
        const priorityGroups: Record<string, TaskWithProject[]> = {}
        const priorities: PriorityLevel[] = ["critical", "high", "medium", "low"]

        priorities.forEach((priority) => {
          priorityGroups[priority] = transformedTasks.filter((task) => task.priority === priority)
        })

        const now = new Date()
        const groupedData: TasksByPriority[] = priorities.map((priority) => {
          const tasksInGroup = priorityGroups[priority]
          const tasksWithDeadline = tasksInGroup.filter((task) => task.deadline)

          const avgDaysToDeadline =
            tasksWithDeadline.length > 0
              ? tasksWithDeadline.reduce((sum, task) => {
                  const daysToDeadline = differenceInDays(new Date(task.deadline!), now)
                  return sum + daysToDeadline
                }, 0) / tasksWithDeadline.length
              : null

          return {
            priority,
            count: tasksInGroup.length,
            avg_days_to_deadline: avgDaysToDeadline,
            tasks: tasksInGroup,
          }
        })

        setTasksByPriority(groupedData)
      }

      // Fetch employee attendance hours
      const { data: attendanceData, error: attendanceError } = await supabase.rpc("get_employee_hours")

      if (attendanceError) {
        console.error("Error fetching employee hours:", attendanceError)
      } else {
        setEmployeeHours(attendanceData || [])
      }

      setLoading(false)
    }

    // Create the stored procedure for employee hours if it doesn't exist
    async function createStoredProcedure() {
      const { error } = await supabase.rpc("create_get_employee_hours_function")
      if (error) {
        console.error("Error creating stored procedure:", error)
      }

      fetchReportData()
    }

    createStoredProcedure()
  }, [priorityFilter, startDate, endDate])

  // Create the stored procedure
  useEffect(() => {
    async function setupStoredProcedure() {
      const { error } = await supabase.rpc("create_get_employee_hours_function", {}, { count: "exact" })

      // If the function doesn't exist, create it
      if (error && error.message.includes("does not exist")) {
        const { error: createError } = await supabase.sql(`
          CREATE OR REPLACE FUNCTION get_employee_hours()
          RETURNS TABLE (
            employee_id INTEGER,
            employee_name VARCHAR,
            employee_surname VARCHAR,
            total_hours NUMERIC
          )
          LANGUAGE SQL
          AS $$
            SELECT 
              e.employee_id,
              e.employee_name,
              e.employee_surname,
              COALESCE(SUM(
                EXTRACT(EPOCH FROM (a.check_out - a.check_in)) / 3600
              ), 0) AS total_hours
            FROM 
              employees e
            LEFT JOIN 
              attendances a ON e.employee_id = a.employee_id AND a.check_out IS NOT NULL
            GROUP BY 
              e.employee_id, e.employee_name, e.employee_surname
            ORDER BY 
              total_hours DESC;
          $$;
          
          CREATE OR REPLACE FUNCTION create_get_employee_hours_function()
          RETURNS void
          LANGUAGE plpgsql
          AS $$
          BEGIN
            -- Function already exists, do nothing
          END;
          $$;
        `)

        if (createError) {
          console.error("Error creating function:", createError)
        }
      }
    }

    setupStoredProcedure()
  }, [])

  const taskColumns: ColumnDef<TaskWithProject>[] = [
    {
      accessorKey: "task_name",
      header: "Task Name",
    },
    {
      accessorKey: "project_name",
      header: "Project",
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string
        return (
          <div className="flex items-center">
            <div
              className={`h-2 w-2 rounded-full mr-2 ${
                priority === "critical"
                  ? "bg-red-500"
                  : priority === "high"
                    ? "bg-orange-500"
                    : priority === "medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
              }`}
            />
            <span className="capitalize">{priority}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as boolean
        return (
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              status
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
            }`}
          >
            {status ? "Completed" : "Pending"}
          </div>
        )
      },
    },
    {
      accessorKey: "deadline",
      header: "Deadline",
      cell: ({ row }) => {
        const deadline = row.getValue("deadline") as string | null
        return deadline ? format(new Date(deadline), "PPP") : "No deadline"
      },
    },
  ]

  const employeeHoursColumns: ColumnDef<AttendanceWithEmployee>[] = [
    {
      accessorKey: "employee_name",
      header: "First Name",
    },
    {
      accessorKey: "employee_surname",
      header: "Last Name",
    },
    {
      accessorKey: "total_hours",
      header: "Total Hours",
      cell: ({ row }) => {
        const hours = row.getValue("total_hours") as number
        return hours.toFixed(2)
      },
    },
  ]

  const resetFilters = () => {
    setPriorityFilter("all")
    setStartDate(undefined)
    setEndDate(undefined)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <Heading title="Reports" description="View and analyze your data" />
      <Separator />

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks Report</TabsTrigger>
          <TabsTrigger value="grouped">Tasks by Priority</TabsTrigger>
          <TabsTrigger value="attendance">Employee Hours</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Report</CardTitle>
              <CardDescription>A detailed list of all tasks in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Priority Filter</label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Start Date</label>
                  <DateTimePicker date={startDate} setDate={setStartDate} />
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">End Date</label>
                  <DateTimePicker date={endDate} setDate={setEndDate} />
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              </div>

              <DataTable columns={taskColumns} data={tasks} />
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground border-t p-4">
              <div className="flex justify-between w-full">
                <div>Generated on {format(new Date(), "PPP")}</div>
                <div>
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="grouped" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasks by Priority</CardTitle>
              <CardDescription>Tasks grouped by priority level with statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {tasksByPriority.map((group) => (
                  <div key={group.priority} className="border rounded-lg overflow-hidden">
                    <div
                      className={`p-4 font-medium ${
                        group.priority === "critical"
                          ? "bg-red-100 dark:bg-red-900"
                          : group.priority === "high"
                            ? "bg-orange-100 dark:bg-orange-900"
                            : group.priority === "medium"
                              ? "bg-yellow-100 dark:bg-yellow-900"
                              : "bg-green-100 dark:bg-green-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className={`h-3 w-3 rounded-full mr-2 ${
                              group.priority === "critical"
                                ? "bg-red-500"
                                : group.priority === "high"
                                  ? "bg-orange-500"
                                  : group.priority === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                            }`}
                          />
                          <span className="capitalize">{group.priority} Priority</span>
                        </div>
                        <div className="text-sm">
                          Count: <span className="font-bold">{group.count}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground italic">
                          Average days to deadline:{" "}
                          {group.avg_days_to_deadline !== null
                            ? `${group.avg_days_to_deadline.toFixed(1)} days`
                            : "No deadlines set"}
                        </p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-2">Task Name</th>
                              <th className="text-left py-2 px-2">Project</th>
                              <th className="text-left py-2 px-2">Status</th>
                              <th className="text-left py-2 px-2">Deadline</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.tasks.length > 0 ? (
                              group.tasks.map((task) => (
                                <tr key={task.task_id} className="border-b">
                                  <td className="py-2 px-2">{task.task_name}</td>
                                  <td className="py-2 px-2">{task.project_name}</td>
                                  <td className="py-2 px-2">
                                    <div
                                      className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                                        task.status
                                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                      }`}
                                    >
                                      {task.status ? "Completed" : "Pending"}
                                    </div>
                                  </td>
                                  <td className="py-2 px-2">
                                    {task.deadline ? format(new Date(task.deadline), "PPP") : "No deadline"}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="py-4 text-center text-muted-foreground">
                                  No tasks with {group.priority} priority
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-4 border rounded-lg">
                  <div className="font-medium mb-2">Summary</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {tasksByPriority.map((group) => (
                      <div key={group.priority} className="text-center">
                        <div className="text-2xl font-bold">{group.count}</div>
                        <div className="text-sm text-muted-foreground capitalize">{group.priority}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-center font-medium">
                      Total Tasks: <span className="font-bold">{tasks.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Hours Report</CardTitle>
              <CardDescription>Total hours worked by each employee</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={employeeHoursColumns} data={employeeHours} />
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground border-t p-4">
              <div>Generated on {format(new Date(), "PPP")}</div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
