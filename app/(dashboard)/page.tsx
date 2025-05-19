"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Clock, FolderKanban, CheckSquare, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Employee, Project, Task } from "@/types/supabase"

export default function DashboardPage() {
  const [employeeCount, setEmployeeCount] = useState(0)
  const [projectCount, setProjectCount] = useState(0)
  const [taskCount, setTaskCount] = useState(0)
  const [completedTaskCount, setCompletedTaskCount] = useState(0)
  const [recentEmployees, setRecentEmployees] = useState<Employee[]>([])
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [criticalTasks, setCriticalTasks] = useState<Task[]>([])

  useEffect(() => {
    async function fetchDashboardData() {
      // Fetch counts
      const { count: empCount } = await supabase.from("employees").select("*", { count: "exact", head: true })

      const { count: projCount } = await supabase.from("projects").select("*", { count: "exact", head: true })

      const { count: taskCount } = await supabase.from("tasks").select("*", { count: "exact", head: true })

      const { count: completedCount } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", true)

      // Fetch recent employees
      const { data: employees } = await supabase
        .from("employees")
        .select("*")
        .order("hire_date", { ascending: false })
        .limit(5)

      // Fetch recent projects
      const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .order("start_date", { ascending: false })
        .limit(5)

      // Fetch critical tasks
      const { data: tasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("priority", "critical")
        .eq("status", false)
        .limit(5)

      if (empCount !== null) setEmployeeCount(empCount)
      if (projCount !== null) setProjectCount(projCount)
      if (taskCount !== null) setTaskCount(taskCount)
      if (completedCount !== null) setCompletedTaskCount(completedCount)
      if (employees) setRecentEmployees(employees)
      if (projects) setRecentProjects(projects)
      if (tasks) setCriticalTasks(tasks)
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="h-full p-4 space-y-4">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your database management system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Recent Employees</TabsTrigger>
          <TabsTrigger value="projects">Recent Projects</TabsTrigger>
          <TabsTrigger value="tasks">Critical Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentEmployees.map((employee) => (
              <Card key={employee.employee_id}>
                <CardHeader>
                  <CardTitle>{`${employee.employee_name} ${employee.employee_surname}`}</CardTitle>
                  <CardDescription>{employee.position}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Email: {employee.email}</p>
                  <p className="text-sm">Hired: {new Date(employee.hire_date).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentProjects.map((project) => (
              <Card key={project.project_id}>
                <CardHeader>
                  <CardTitle>{project.project_name}</CardTitle>
                  <CardDescription>{project.client}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Start: {new Date(project.start_date).toLocaleDateString()}</p>
                  <p className="text-sm">
                    End: {project.end_date ? new Date(project.end_date).toLocaleDateString() : "Ongoing"}
                  </p>
                  {project.description && <p className="text-sm mt-2 line-clamp-2">{project.description}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {criticalTasks.map((task) => (
              <Card key={task.task_id}>
                <CardHeader className="flex flex-row items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <CardTitle className="text-base">{task.task_name}</CardTitle>
                    <CardDescription>
                      {task.status ? (
                        <span className="flex items-center text-green-500">
                          <CheckCircle className="h-4 w-4 mr-1" /> Completed
                        </span>
                      ) : (
                        <span className="flex items-center text-red-500">
                          <XCircle className="h-4 w-4 mr-1" /> Pending
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {task.deadline && <p className="text-sm">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>}
                  {task.description && <p className="text-sm mt-2 line-clamp-2">{task.description}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
