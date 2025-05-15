import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, ListTodo, CheckCircle } from "lucide-react"
import { getCompletedTasksCount } from "@/lib/data"

interface StatsCardsProps {
  employeesCount: number
  projectsCount: number
  tasksCount: number
}

export default async function StatsCards({ employeesCount, projectsCount, tasksCount }: StatsCardsProps) {
  // Получаем количество выполненных задач
  let completedTasksCount = 0
  try {
    completedTasksCount = await getCompletedTasksCount()
  } catch (error) {
    console.error("Error fetching completed tasks count:", error)
    // Используем значение по умолчанию в случае ошибки
    completedTasksCount = 0
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Сотрудники</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{employeesCount}</div>
          <p className="text-xs text-muted-foreground">Всего сотрудников в системе</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Проекты</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projectsCount}</div>
          <p className="text-xs text-muted-foreground">Активных проектов</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Задачи</CardTitle>
          <ListTodo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tasksCount}</div>
          <p className="text-xs text-muted-foreground">Всего задач</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Выполнено</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedTasksCount}</div>
          <p className="text-xs text-muted-foreground">Выполненных задач</p>
        </CardContent>
      </Card>
    </div>
  )
}
