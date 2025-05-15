"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useRef } from "react"

interface ProjectsReportProps {
  projects: {
    project_id: number
    project_name: string
    tasks_count: string
    completed_tasks: string
  }[]
}

export default function ProjectsReport({ projects }: ProjectsReportProps) {
  const tableRef = useRef<HTMLTableElement>(null)

  const handleExportClick = () => {
    if (!tableRef.current) return

    let csv = "Название проекта,Всего задач,Выполнено задач,Процент выполнения\n"

    projects.forEach((project) => {
      const totalTasks = Number.parseInt(project.tasks_count) || 0
      const completedTasks = Number.parseInt(project.completed_tasks) || 0
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      csv += `"${project.project_name}",${totalTasks},${completedTasks},${progressPercentage}%\n`
    })

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "projects_report.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleExportClick}>
          <Download className="mr-2 h-4 w-4" />
          Экспорт в CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table ref={tableRef}>
          <TableHeader>
            <TableRow>
              <TableHead>Название проекта</TableHead>
              <TableHead className="text-right">Всего задач</TableHead>
              <TableHead className="text-right">Выполнено</TableHead>
              <TableHead className="text-right">Прогресс</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length > 0 ? (
              projects.map((project) => {
                const totalTasks = Number.parseInt(project.tasks_count) || 0
                const completedTasks = Number.parseInt(project.completed_tasks) || 0
                const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

                return (
                  <TableRow key={project.project_id}>
                    <TableCell className="font-medium">{project.project_name}</TableCell>
                    <TableCell className="text-right">{totalTasks}</TableCell>
                    <TableCell className="text-right">{completedTasks}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Progress value={progressPercentage} className="w-[100px]" />
                        <span>{progressPercentage}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Нет данных для отображения.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
