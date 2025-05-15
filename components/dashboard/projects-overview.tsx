import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getProjectsWithTasksCount } from "@/lib/data"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

export default async function ProjectsOverview() {
  const projects = await getProjectsWithTasksCount()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Обзор проектов</CardTitle>
        <CardDescription>Статус выполнения задач по проектам</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {projects.map((project) => {
            const totalTasks = Number.parseInt(project.tasks_count) || 0
            const completedTasks = Number.parseInt(project.completed_tasks) || 0
            const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

            return (
              <div key={project.project_id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Link href={`/projects/${project.project_id}`} className="font-medium hover:underline">
                    {project.project_name}
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    {completedTasks} из {totalTasks} задач
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )
          })}
          {projects.length === 0 && <div className="text-center py-4 text-muted-foreground">Нет проектов</div>}
          <div className="pt-4">
            <Link href="/projects" className="text-sm text-primary hover:underline">
              Просмотреть все проекты
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
