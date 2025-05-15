"use client"

import type { Task } from "@/lib/types"
import { formatDate, getPriorityColor, getStatusColor, getStatusText } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

interface TasksListProps {
  tasks: Task[]
}

export default function TasksList({ tasks }: TasksListProps) {
  const [localTasks, setLocalTasks] = useState(tasks)

  const handleStatusChange = async (taskId: number, checked: boolean) => {
    try {
      // Имитация обновления для отладки
      console.log("Обновление статуса задачи:", taskId, checked)

      // Обновляем локальное состояние
      setLocalTasks((prev) => prev.map((task) => (task.task_id === taskId ? { ...task, status: checked } : task)))
    } catch (error) {
      console.error("Ошибка при обновлении статуса задачи:", error)
    }
  }

  if (localTasks.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Нет задач для отображения</div>
  }

  return (
    <div className="space-y-4">
      {localTasks.map((task) => (
        <div key={task.task_id} className="flex items-start gap-4 p-4 border rounded-lg">
          <Checkbox
            checked={task.status}
            onCheckedChange={(checked) => {
              if (typeof checked === "boolean") {
                handleStatusChange(task.task_id, checked)
              }
            }}
          />
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{task.task_name}</h4>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/tasks/${task.task_id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{task.description || "Нет описания"}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              <Badge variant={task.status ? "outline" : "secondary"} className={getStatusColor(task.status)}>
                {getStatusText(task.status)}
              </Badge>
              <Badge variant="outline">Срок: {formatDate(task.deadline)}</Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
