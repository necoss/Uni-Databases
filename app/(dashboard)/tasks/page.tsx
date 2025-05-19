"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"

interface TaskWithProject {
  task_id: number
  task_name: string
  status: boolean
  priority: "low" | "medium" | "high" | "critical"
  description: string | null
  deadline: string | null
  project_id: number
  project_name?: string
}

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<TaskWithProject[]>([])
  const [loading, setLoading] = useState(true)
  const [priorityFilter, setPriorityFilter] = useState<string>("all")

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true)

      // Start with the base query
      let query = supabase.from("tasks").select(`
          *,
          projects (
            project_name
          )
        `)

      // Apply priority filter if not "all"
      if (priorityFilter !== "all") {
        query = query.eq("priority", priorityFilter)
      }

      // Execute the query with ordering
      const { data, error } = await query.order("priority", { ascending: false })

      if (error) {
        console.error("Error fetching tasks:", error)
      } else {
        // Transform the data to flatten the structure
        const transformedData = data.map((task) => ({
          ...task,
          project_name: task.projects?.project_name,
        }))
        setTasks(transformedData || [])
      }
      setLoading(false)
    }

    fetchTasks()
  }, [priorityFilter])

  const columns: ColumnDef<TaskWithProject>[] = [
    {
      accessorKey: "task_id",
      header: "ID",
    },
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
    {
      id: "actions",
      cell: ({ row }) => {
        const task = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/tasks/${task.task_id}`)}>
              View
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push(`/tasks/edit/${task.task_id}`)}>
              Edit
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Heading title={`Tasks (${tasks.length})`} description="Manage your tasks" />
        <Button onClick={() => router.push("/tasks/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by Priority:</span>
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="critical">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                Critical
              </div>
            </SelectItem>
            <SelectItem value="high">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-orange-500 mr-2" />
                High
              </div>
            </SelectItem>
            <SelectItem value="medium">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />
                Medium
              </div>
            </SelectItem>
            <SelectItem value="low">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                Low
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {priorityFilter !== "all" && (
          <Button variant="outline" size="sm" onClick={() => setPriorityFilter("all")}>
            Clear Filter
          </Button>
        )}
      </div>

      <DataTable columns={columns} data={tasks} searchKey="task_name" searchPlaceholder="Search tasks..." />
    </div>
  )
}
