"use client"

import type React from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { Employee } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, CalendarDays } from "lucide-react"

interface EmployeesTableProps {
  employees: Employee[]
}

export default function EmployeesTable({ employees }: EmployeesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.employee_name} ${employee.employee_surname}`.toLowerCase()
    const search = searchTerm.toLowerCase()
    return (
      fullName.includes(search) ||
      employee.email.toLowerCase().includes(search) ||
      employee.position.toLowerCase().includes(search)
    )
  })

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  return (
    <div className="space-y-4">
      <Input placeholder="Поиск сотрудников..." value={searchTerm} onChange={handleSearchChange} className="max-w-sm" />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ФИО</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Должность</TableHead>
              <TableHead>Дата найма</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <TableRow key={employee.employee_id}>
                  <TableCell className="font-medium">
                    {employee.employee_surname} {employee.employee_name}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{formatDate(employee.hire_date)}</TableCell>
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
                          <Link href={`/employees/${employee.employee_id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Просмотр
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/employees/${employee.employee_id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Редактировать
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/employees/${employee.employee_id}/attendances`}>
                            <CalendarDays className="mr-2 h-4 w-4" />
                            Посещаемость
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Сотрудники не найдены.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
