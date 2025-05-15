import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getTasks } from "@/lib/data"
import { formatDate, getPriorityColor, getStatusColor, getStatusText } from "@/lib/utils"
import Link from "next/link"
import { CheckCircle, Clock } from "lucide-react"

export default async function RecentTasks() {
  const tasks = await getTasks()
  const recentTasks = tasks.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Последние задачи</CardTitle>
        <CardDescription>Список последних добавленных задач</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTasks.map((task) => (
            <div key={task.task_id} className="flex items-center">
              <div className="mr-4">
                {task.status ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <Clock className="h-6 w-6 text-yellow-500" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <Link href={`/tasks/${task.task_id}`} className="font-medium hover:underline">
                  {task.task_name}
                </Link>
                <div className="text-sm text-muted-foreground">Проект: {task.project_name}</div>
                <div className="flex items-center gap-2">
                  <Badge variant={task.status ? "outline" : "secondary"} className={getStatusColor(task.status)}>
                    {getStatusText(task.status)}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Срок: {formatDate(task.deadline)}</span>
                </div>
              </div>
            </div>
          ))}
          {recentTasks.length === 0 && <div className="text-center py-4 text-muted-foreground">Нет задач</div>}
          <div className="pt-4">
            <Link href="/tasks" className="text-sm text-primary hover:underline">
              Просмотреть все задачи
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
