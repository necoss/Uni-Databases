"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Task, Priority } from "@/lib/types"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createTask, updateTask } from "@/app/actions"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface TaskFormProps {
  task?: Task
  projectId?: number
}

export default function TaskForm({ task, projectId }: TaskFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [projects, setProjects] = useState<{ project_id: number; project_name: string }[]>([])

  useEffect(() => {
    // Загрузка списка проектов
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects")
        const data = await response.json()
        setProjects(
          data.map((proj: any) => ({
            project_id: proj.project_id,
            project_name: proj.project_name,
          })),
        )
      } catch (error) {
        console.error("Ошибка при загрузке проектов:", error)
      }
    }

    fetchProjects()
  }, [])

  const [formData, setFormData] = useState({
    task_name: task?.task_name || "",
    status: task?.status || false,
    priority: task?.priority || ("medium" as Priority),
    description: task?.description || "",
    deadline: task?.deadline
      ? new Date(task.deadline).toISOString().split("T")[0]
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    project_id: (task?.project_id || projectId || "").toString(),
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, status: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const dataToSubmit = {
        ...formData,
        project_id: Number.parseInt(formData.project_id),
      }

      if (task) {
        // Обновление существующей задачи
        await updateTask(task.task_id, dataToSubmit)
        toast({
          title: "Задача обновлена",
          description: "Данные задачи успешно обновлены",
        })
      } else {
        // Создание новой задачи
        await createTask(dataToSubmit)
        toast({
          title: "Задача добавлена",
          description: "Новая задача успешно добавлена",
        })
      }

      if (projectId) {
        router.push(`/projects/${projectId}`)
      } else {
        router.push("/tasks")
      }
      router.refresh()
    } catch (error) {
      console.error("Ошибка при сохранении задачи:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить данные задачи",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="task_name">Название задачи</Label>
        <Input id="task_name" name="task_name" value={formData.task_name} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="project_id">Проект</Label>
        <Select
          value={formData.project_id}
          onValueChange={(value) => handleSelectChange("project_id", value)}
          disabled={!!projectId}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите проект" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.project_id} value={project.project_id.toString()}>
                {project.project_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Приоритет</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleSelectChange("priority", value as Priority)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите приоритет" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Низкий</SelectItem>
              <SelectItem value="medium">Средний</SelectItem>
              <SelectItem value="high">Высокий</SelectItem>
              <SelectItem value="critical">Критический</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline">Срок выполнения</Label>
          <Input id="deadline" name="deadline" type="date" value={formData.deadline} onChange={handleChange} required />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="status" checked={formData.status} onCheckedChange={handleSwitchChange} />
        <Label htmlFor="status">Задача выполнена</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Отмена
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Сохранение..." : task ? "Обновить" : "Добавить"}
        </Button>
      </div>
    </form>
  )
}
