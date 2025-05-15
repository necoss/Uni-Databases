"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Project } from "@/lib/types"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createProject, updateProject } from "@/app/actions"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProjectFormProps {
  project?: Project
}

export default function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [employees, setEmployees] = useState<{ employee_id: number; name: string }[]>([])

  useEffect(() => {
    // Загрузка списка сотрудников
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees")
        const data = await response.json()
        setEmployees(
          data.map((emp: any) => ({
            employee_id: emp.employee_id,
            name: `${emp.employee_surname} ${emp.employee_name}`,
          })),
        )
      } catch (error) {
        console.error("Ошибка при загрузке сотрудников:", error)
      }
    }

    fetchEmployees()
  }, [])

  const [formData, setFormData] = useState({
    project_name: project?.project_name || "",
    client: project?.client || "",
    start_date: project?.start_date
      ? new Date(project.start_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    end_date: project?.end_date
      ? new Date(project.end_date).toISOString().split("T")[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    employee_id: project?.employee_id?.toString() || "",
    description: project?.description || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const dataToSubmit = {
        ...formData,
        employee_id: formData.employee_id ? Number.parseInt(formData.employee_id) : null,
      }

      if (project) {
        // Обновление существующего проекта
        await updateProject(project.project_id, dataToSubmit)
        toast({
          title: "Проект обновлен",
          description: "Данные проекта успешно обновлены",
        })
      } else {
        // Создание нового проекта
        await createProject(dataToSubmit)
        toast({
          title: "Проект добавлен",
          description: "Новый проект успешно добавлен",
        })
      }

      router.push("/projects")
      router.refresh()
    } catch (error) {
      console.error("Ошибка при сохранении проекта:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить данные проекта",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="project_name">Название проекта</Label>
        <Input id="project_name" name="project_name" value={formData.project_name} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="client">Клиент</Label>
        <Input id="client" name="client" value={formData.client} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Дата начала</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">Дата окончания</Label>
          <Input id="end_date" name="end_date" type="date" value={formData.end_date} onChange={handleChange} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="employee_id">Руководитель проекта</Label>
        <Select value={formData.employee_id} onValueChange={(value) => handleSelectChange("employee_id", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите руководителя" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-1">Не выбран</SelectItem>
            {employees.map((employee) => (
              <SelectItem key={employee.employee_id} value={employee.employee_id.toString()}>
                {employee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          {isLoading ? "Сохранение..." : project ? "Обновить" : "Добавить"}
        </Button>
      </div>
    </form>
  )
}
