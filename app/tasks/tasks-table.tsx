"use client"

import type React from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { Task } from "@/lib/types"
import { formatDate, getPriorityColor } from "@/lib/utils"
import Link from "next/link"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit } from "lucide-react"

interface TasksTableProps {
  tasks: Task[]
}

export default function TasksTable({ tasks }: TasksTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [localTasks, setLocalTasks] = useState(tasks)

  const filteredTasks = localTasks.filter((task) => {
    const search = searchTerm.toLowerCase()
    return (
      task.task_name.toLowerCase().includes(search) ||
      (task.description && task.description.toLowerCase().includes(search)) ||
      (task.project_name && task.project_name.toLowerCase().includes(search))
    )
  })

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

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

  return (
    <div className="space-y-4">
      <Input placeholder="Поиск задач..." value={searchTerm} onChange={handleSearchChange} className="max-w-sm" />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Статус</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Проект</TableHead>
              <TableHead>Приоритет</TableHead>
              <TableHead>Срок</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TableRow key={task.task_id}>
                  <TableCell>
                    <Checkbox
                      checked={task.status}
                      onCheckedChange={(checked) => {
                        if (typeof checked === "boolean") {
                          handleStatusChange(task.task_id, checked)
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{task.task_name}</TableCell>
                  <TableCell>{task.project_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(task.deadline)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Меню</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/tasks/${task.task_id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Просмотр
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/tasks/${task.task_id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Редактировать
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Задачи не найдены.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
