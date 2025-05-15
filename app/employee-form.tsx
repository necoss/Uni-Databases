"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Employee } from "@/lib/types"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface EmployeeFormProps {
  employee?: Employee
}

export default function EmployeeForm({ employee }: EmployeeFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    employee_name: employee?.employee_name || "",
    employee_surname: employee?.employee_surname || "",
    email: employee?.email || "",
    hire_date: employee?.hire_date
      ? new Date(employee.hire_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    position: employee?.position || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Имитация сохранения для отладки
      console.log("Сохранение сотрудника:", formData)

      // Имитация задержки
      await new Promise((resolve) => setTimeout(resolve, 1000))

      router.push("/employees")
      router.refresh()
    } catch (error) {
      console.error("Ошибка при сохранении сотрудника:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="employee_surname">Фамилия</Label>
          <Input
            id="employee_surname"
            name="employee_surname"
            value={formData.employee_surname}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employee_name">Имя</Label>
          <Input
            id="employee_name"
            name="employee_name"
            value={formData.employee_name}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position">Должность</Label>
          <Input id="position" name="position" value={formData.position} onChange={handleChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hire_date">Дата найма</Label>
          <Input
            id="hire_date"
            name="hire_date"
            type="date"
            value={formData.hire_date}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Отмена
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Сохранение..." : employee ? "Обновить" : "Добавить"}
        </Button>
      </div>
    </form>
  )
}
