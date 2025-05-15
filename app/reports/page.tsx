import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProjectsReport from "./projects-report"
import TasksReport from "./tasks-report"
import EmployeeWorkHoursReport from "./employee-work-hours-report"

export default function ReportsPage() {
  // Используем статические данные для отладки
  const tasksByPriority = [
    { priority: "critical", count: "2" },
    { priority: "high", count: "3" },
    { priority: "medium", count: "5" },
    { priority: "low", count: "4" },
  ]

  const projectsWithTasks = [
    { project_id: 1, project_name: "Система учета", tasks_count: "3", completed_tasks: "1" },
    { project_id: 2, project_name: "Мобильное приложение", tasks_count: "4", completed_tasks: "2" },
    { project_id: 3, project_name: "Веб-портал", tasks_count: "2", completed_tasks: "0" },
    { project_id: 4, project_name: "Автоматизация склада", tasks_count: "1", completed_tasks: "1" },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Отчеты</h1>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">Проекты</TabsTrigger>
          <TabsTrigger value="tasks">Задачи</TabsTrigger>
          <TabsTrigger value="employees">Сотрудники</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Отчет по проектам</CardTitle>
              <CardDescription>Статус выполнения задач по проектам</CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectsReport projects={projectsWithTasks} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Отчет по задачам</CardTitle>
              <CardDescription>Распределение задач по приоритетам</CardDescription>
            </CardHeader>
            <CardContent>
              <TasksReport tasksByPriority={tasksByPriority} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Отчет по рабочему времени</CardTitle>
              <CardDescription>Количество отработанных часов сотрудниками</CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeeWorkHoursReport />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
