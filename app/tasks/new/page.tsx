import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import TaskForm from "../task-form"
import { getProjectById } from "@/lib/data"

interface NewTaskPageProps {
  searchParams: {
    projectId?: string
  }
}

export default async function NewTaskPage({ searchParams }: NewTaskPageProps) {
  let project = null

  if (searchParams.projectId) {
    const projectId = Number.parseInt(searchParams.projectId)
    if (!isNaN(projectId)) {
      project = await getProjectById(projectId)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Добавить задачу</h1>

      <Card>
        <CardHeader>
          <CardTitle>Информация о задаче</CardTitle>
          <CardDescription>
            Введите данные новой задачи
            {project && ` для проекта "${project.project_name}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TaskForm projectId={project?.project_id} />
        </CardContent>
      </Card>
    </div>
  )
}
