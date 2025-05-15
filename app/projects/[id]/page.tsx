import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getProjectById, getTasksByProjectId } from "@/lib/data"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Edit, ListTodo, Plus } from "lucide-react"
import { notFound } from "next/navigation"
import TasksList from "@/components/tasks-list"

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const projectId = Number.parseInt(params.id)

  if (isNaN(projectId)) {
    notFound()
  }

  const project = await getProjectById(projectId)

  if (!project) {
    notFound()
  }

  const tasks = await getTasksByProjectId(projectId)

  // Расчет прогресса выполнения задач
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status).length
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{project.project_name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Информация о проекте</CardTitle>
            <CardDescription>Основные данные проекта</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Название</dt>
                <dd>{project.project_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Клиент</dt>
                <dd>{project.client || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Период</dt>
                <dd>
                  {formatDate(project.start_date)} - {formatDate(project.end_date)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Руководитель</dt>
                <dd>
                  {project.employee_name && project.employee_surname
                    ? `${project.employee_surname} ${project.employee_name}`
                    : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Описание</dt>
                <dd>{project.description || "-"}</dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/projects/${project.project_id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href={`/projects/${project.project_id}/tasks`}>
                <ListTodo className="mr-2 h-4 w-4" />
                Задачи
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Задачи проекта</CardTitle>
              <CardDescription>Список задач в рамках проекта</CardDescription>
            </div>
            <Button asChild>
              <Link href={`/tasks/new?projectId=${project.project_id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить задачу
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Прогресс выполнения</span>
                <span className="text-sm font-medium">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Выполнено: {completedTasks}</span>
                <span>Всего: {totalTasks}</span>
              </div>
            </div>

            <TasksList tasks={tasks} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
