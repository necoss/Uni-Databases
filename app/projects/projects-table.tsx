"use client"

import type React from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { Project } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, ListTodo } from "lucide-react"

interface ProjectsTableProps {
  projects: Project[]
}

export default function ProjectsTable({ projects }: ProjectsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProjects = projects.filter((project) => {
    const search = searchTerm.toLowerCase()
    return (
      project.project_name.toLowerCase().includes(search) ||
      (project.client && project.client.toLowerCase().includes(search)) ||
      (project.employee_name && project.employee_name.toLowerCase().includes(search)) ||
      (project.employee_surname && project.employee_surname.toLowerCase().includes(search))
    )
  })

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  return (
    <div className="space-y-4">
      <Input placeholder="Поиск проектов..." value={searchTerm} onChange={handleSearchChange} className="max-w-sm" />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Начало</TableHead>
              <TableHead>Окончание</TableHead>
              <TableHead>Руководитель</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <TableRow key={project.project_id}>
                  <TableCell className="font-medium">{project.project_name}</TableCell>
                  <TableCell>{project.client || "-"}</TableCell>
                  <TableCell>{formatDate(project.start_date)}</TableCell>
                  <TableCell>{formatDate(project.end_date)}</TableCell>
                  <TableCell>
                    {project.employee_name && project.employee_surname
                      ? `${project.employee_surname} ${project.employee_name}`
                      : "-"}
                  </TableCell>
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
                          <Link href={`/projects/${project.project_id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Просмотр
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project.project_id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Редактировать
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project.project_id}/tasks`}>
                            <ListTodo className="mr-2 h-4 w-4" />
                            Задачи
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
                  Проекты не найдены.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
