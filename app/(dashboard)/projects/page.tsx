"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"

interface ProjectWithEmployee {
  project_id: number
  project_name: string
  client: string
  start_date: string
  end_date: string | null
  description: string | null
  employee_id: number | null
  employee_name?: string
  employee_surname?: string
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectWithEmployee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true)
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          employees (
            employee_name,
            employee_surname
          )
        `)
        .order("project_id", { ascending: true })

      if (error) {
        console.error("Error fetching projects:", error)
      } else {
        // Transform the data to flatten the structure
        const transformedData = data.map((project) => ({
          ...project,
          employee_name: project.employees?.employee_name,
          employee_surname: project.employees?.employee_surname,
        }))
        setProjects(transformedData || [])
      }
      setLoading(false)
    }

    fetchProjects()
  }, [])

  const columns: ColumnDef<ProjectWithEmployee>[] = [
    {
      accessorKey: "project_id",
      header: "ID",
    },
    {
      accessorKey: "project_name",
      header: "Project Name",
    },
    {
      accessorKey: "client",
      header: "Client",
    },
    {
      accessorKey: "start_date",
      header: "Start Date",
      cell: ({ row }) => {
        const date = row.getValue("start_date") as string
        return format(new Date(date), "PPP")
      },
    },
    {
      accessorKey: "end_date",
      header: "End Date",
      cell: ({ row }) => {
        const date = row.getValue("end_date") as string | null
        return date ? format(new Date(date), "PPP") : "Ongoing"
      },
    },
    {
      id: "manager",
      header: "Project Manager",
      cell: ({ row }) => {
        const employeeName = row.original.employee_name
        const employeeSurname = row.original.employee_surname

        return employeeName && employeeSurname ? `${employeeName} ${employeeSurname}` : "Unassigned"
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const project = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/projects/${project.project_id}`)}>
              View
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push(`/projects/edit/${project.project_id}`)}>
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
        <Heading title={`Projects (${projects.length})`} description="Manage your projects" />
        <Button onClick={() => router.push("/projects/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={projects} searchKey="project_name" searchPlaceholder="Search projects..." />
    </div>
  )
}
