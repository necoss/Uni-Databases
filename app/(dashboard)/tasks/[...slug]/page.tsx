"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import type { Project } from "@/types/supabase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  task_name: z.string().min(1, "Task name is required"),
  project_id: z.string().min(1, "Project is required"),
  priority: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Priority is required",
  }),
  status: z.boolean().default(false),
  deadline: z.date().nullable().optional(),
  description: z.string().nullable().optional(),
})

type TaskFormValues = z.infer<typeof formSchema>

interface TaskWithProject {
  task_id: number
  task_name: string
  status: boolean
  priority: "low" | "medium" | "high" | "critical"
  description: string | null
  deadline: string | null
  project_id: number
  projects?: {
    project_name: string
  } | null
}

export default function TaskPage({ params }: { params: { slug: string[] } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [task, setTask] = useState<TaskWithProject | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const isNew = params.slug[0] === "new"
  const isEdit = params.slug[0] === "edit"
  const taskId = isEdit ? Number.parseInt(params.slug[1]) : isNew ? null : Number.parseInt(params.slug[0])

  // Get project_id from query params if creating a new task from project page
  const projectIdFromQuery = searchParams.get("project")

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      task_name: "",
      project_id: projectIdFromQuery || "",
      priority: "medium",
      status: false,
      deadline: null,
      description: "",
    },
  })

  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase.from("projects").select("*").order("project_name", { ascending: true })

      if (error) {
        console.error("Error fetching projects:", error)
      } else {
        setProjects(data || [])
      }
    }

    async function fetchTask() {
      if (isNew) {
        setLoading(false)
        return
      }

      setLoading(true)

      if (taskId) {
        // Fetch task
        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .select(`
            *,
            projects (
              project_name
            )
          `)
          .eq("task_id", taskId)
          .single()

        if (taskError) {
          console.error("Error fetching task:", taskError)
          toast({
            title: "Error",
            description: "Failed to fetch task data",
            variant: "destructive",
          })
          router.push("/tasks")
          return
        }

        setTask(taskData)

        // For edit mode, populate the form
        if (isEdit) {
          form.reset({
            task_name: taskData.task_name,
            project_id: String(taskData.project_id),
            priority: taskData.priority,
            status: taskData.status,
            deadline: taskData.deadline ? new Date(taskData.deadline) : null,
            description: taskData.description || "",
          })
        }
      }

      setLoading(false)
    }

    fetchProjects()
    fetchTask()
  }, [taskId, isNew, isEdit, form, router, toast, projectIdFromQuery])

  const onSubmit = async (data: TaskFormValues) => {
    setSubmitting(true)

    try {
      const formattedData = {
        task_name: data.task_name,
        project_id: Number.parseInt(data.project_id),
        priority: data.priority,
        status: data.status,
        deadline: data.deadline ? data.deadline.toISOString() : null,
        description: data.description || null,
      }

      if (isNew) {
        // Create new task
        const { data: newTask, error } = await supabase.from("tasks").insert([formattedData]).select()

        if (error) {
          throw error
        }

        toast({
          title: "Success",
          description: "Task created successfully",
        })

        router.push("/tasks")
      } else if (isEdit && taskId) {
        // Update task
        const { error } = await supabase.from("tasks").update(formattedData).eq("task_id", taskId)

        if (error) {
          throw error
        }

        toast({
          title: "Success",
          description: "Task updated successfully",
        })

        router.push("/tasks")
      }
    } catch (error: any) {
      console.error("Error saving task:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save task",
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

  if (!isNew && !isEdit && task) {
    // View mode
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Heading
            title={task.task_name}
            description={task.projects ? `Project: ${task.projects.project_name}` : "Unknown Project"}
          />
          <Button onClick={() => router.push(`/tasks/edit/${task.task_id}`)}>Edit Task</Button>
        </div>
        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Task ID</h3>
            <p>{task.task_id}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Project</h3>
            <p>{task.projects ? task.projects.project_name : "Unknown"}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
            <div className="flex items-center">
              <div
                className={`h-3 w-3 rounded-full mr-2 ${
                  task.priority === "critical"
                    ? "bg-red-500"
                    : task.priority === "high"
                      ? "bg-orange-500"
                      : task.priority === "medium"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                }`}
              />
              <span className="capitalize">{task.priority}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            <div
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                task.status
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
              }`}
            >
              {task.status ? "Completed" : "Pending"}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Deadline</h3>
            <p>{task.deadline ? format(new Date(task.deadline), "PPP") : "No deadline"}</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
            <p className="whitespace-pre-line">{task.description || "No description provided."}</p>
          </div>
        </div>
      </div>
    )
  }

  // New or Edit mode
  return (
    <div className="p-4 space-y-4">
      <Heading
        title={isNew ? "Create Task" : "Edit Task"}
        description={isNew ? "Add a new task to the system" : "Edit task details"}
      />
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="task_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Design homepage mockup" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.project_id} value={String(project.project_id)}>
                          {project.project_name}
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
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                          Low
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-orange-500 mr-2" />
                          High
                        </div>
                      </SelectItem>
                      <SelectItem value="critical">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                          Critical
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Completed</FormLabel>
                    <p className="text-sm text-muted-foreground">Mark this task as completed</p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Deadline (Optional)</FormLabel>
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
                      placeholder="Task description..."
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
            <Button type="button" variant="outline" onClick={() => router.push("/tasks")}>
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
