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
import { Textarea } from "@/components/ui/textarea"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import type { Employee, Project, Task } from "@/types/supabase"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  project_name: z.string().min(1, "Project name is required"),
  client: z.string().min(1, "Client name is required"),
  start_date: z.date({
    required_error: "Start date is required",
  }),
  end_date: z.date().nullable().optional(),
  employee_id: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
})

type ProjectFormValues = z.infer<typeof formSchema>

interface ProjectWithEmployee extends Project {
  employees?: {
    employee_name: string
    employee_surname: string
  } | null
}

export default function ProjectPage({ params }: { params: { slug: string[] } }) {
  const router = useRouter()
  const { toast } = useToast()

  const [project, setProject] = useState<ProjectWithEmployee | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const isNew = params.slug[0] === "new"
  const isEdit = params.slug[0] === "edit"
  const projectId = isEdit ? Number.parseInt(params.slug[1]) : isNew ? null : Number.parseInt(params.slug[0])

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_name: "",
      client: "",
      start_date: new Date(),
      end_date: null,
      employee_id: null,
      description: "",
    },
  })

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

    async function fetchProject() {
      if (isNew) {
        setLoading(false)
        return
      }

      setLoading(true)

      if (projectId) {
        // Fetch project
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select(`
            *,
            employees (
              employee_name,
              employee_surname
            )
          `)
          .eq("project_id", projectId)
          .single()

        if (projectError) {
          console.error("Error fetching project:", projectError)
          toast({
            title: "Error",
            description: "Failed to fetch project data",
            variant: "destructive",
          })
          router.push("/projects")
          return
        }

        setProject(projectData)

        // Populate form
        if (!isEdit) {
          // Only fetch tasks for view mode
          const { data: taskData, error: taskError } = await supabase
            .from("tasks")
            .select("*")
            .eq("project_id", projectId)
            .order("priority", { ascending: false })

          if (taskError) {
            console.error("Error fetching tasks:", taskError)
          } else {
            setTasks(taskData || [])
          }
        } else {
          // For edit mode, populate the form
          form.reset({
            project_name: projectData.project_name,
            client: projectData.client,
            start_date: new Date(projectData.start_date),
            end_date: projectData.end_date ? new Date(projectData.end_date) : null,
            employee_id: projectData.employee_id ? String(projectData.employee_id) : null,
            description: projectData.description || "",
          })
        }
      }

      setLoading(false)
    }

    fetchEmployees()
    fetchProject()
  }, [projectId, isNew, isEdit, form, router, toast])

  const onSubmit = async (data: ProjectFormValues) => {
    setSubmitting(true)

    try {
      const formattedData = {
        ...data,
        start_date: data.start_date.toISOString(),
        end_date: data.end_date ? data.end_date.toISOString() : null,
        employee_id: data.employee_id ? Number.parseInt(data.employee_id) : null,
      }

      if (isNew) {
        // Create new project
        const { data: newProject, error } = await supabase.from("projects").insert([formattedData]).select()

        if (error) {
          throw error
        }

        toast({
          title: "Success",
          description: "Project created successfully",
        })

        router.push("/projects")
      } else if (isEdit && projectId) {
        // Update project
        const { error } = await supabase.from("projects").update(formattedData).eq("project_id", projectId)

        if (error) {
          throw error
        }

        toast({
          title: "Success",
          description: "Project updated successfully",
        })

        router.push("/projects")
      }
    } catch (error: any) {
      console.error("Error saving project:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save project",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Columns for tasks table
  const taskColumns: ColumnDef<Task>[] = [
    {
      accessorKey: "task_name",
      header: "Task Name",
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
    {
      id: "actions",
      cell: ({ row }) => {
        const task = row.original

        return (
          <Button variant="outline" size="sm" onClick={() => router.push(`/tasks/${task.task_id}`)}>
            View
          </Button>
        )
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

  if (!isNew && !isEdit && project) {
    // View mode
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Heading title={project.project_name} description={`Client: ${project.client}`} />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/tasks/new?project=${project.project_id}`)}>
              Add Task
            </Button>
            <Button onClick={() => router.push(`/projects/edit/${project.project_id}`)}>Edit Project</Button>
          </div>
        </div>
        <Separator />

        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Project Details</TabsTrigger>
            <TabsTrigger value="tasks">Project Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Project ID</h3>
                <p>{project.project_id}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Project Name</h3>
                <p>{project.project_name}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
                <p>{project.client}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Project Manager</h3>
                <p>
                  {project.employees
                    ? `${project.employees.employee_name} ${project.employees.employee_surname}`
                    : "Unassigned"}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
                <p>{format(new Date(project.start_date), "PPP")}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">End Date</h3>
                <p>{project.end_date ? format(new Date(project.end_date), "PPP") : "Ongoing"}</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="whitespace-pre-line">{project.description || "No description provided."}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="pt-4">
            <DataTable columns={taskColumns} data={tasks} searchKey="task_name" searchPlaceholder="Search tasks..." />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // New or Edit mode
  return (
    <div className="p-4 space-y-4">
      <Heading
        title={isNew ? "Create Project" : "Edit Project"}
        description={isNew ? "Add a new project to the system" : "Edit project details"}
      />
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="project_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Website Redesign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Manager</FormLabel>
                  <Select value={field.value || "unassigned"} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project manager" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
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

            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <DateTimePicker date={field.value} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date (Optional)</FormLabel>
                  <DateTimePicker date={field.value || undefined} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Project description..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => router.push("/projects")}>
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
