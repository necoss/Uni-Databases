"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface TasksReportProps {
  tasksByPriority: {
    priority: string
    count: string
  }[]
}

export default function TasksReport({ tasksByPriority }: TasksReportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [chartRendered, setChartRendered] = useState(false)

  useEffect(() => {
    if (!canvasRef.current || chartRendered) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Данные для диаграммы
    const data = tasksByPriority.map((item) => Number.parseInt(item.count))
    const labels = tasksByPriority.map((item) => {
      switch (item.priority) {
        case "critical":
          return "Критический"
        case "high":
          return "Высокий"
        case "medium":
          return "Средний"
        case "low":
          return "Низкий"
        default:
          return item.priority
      }
    })

    // Цвета для диаграммы
    const colors = tasksByPriority.map((item) => {
      switch (item.priority) {
        case "critical":
          return "#ef4444"
        case "high":
          return "#f97316"
        case "medium":
          return "#eab308"
        case "low":
          return "#22c55e"
        default:
          return "#3b82f6"
      }
    })

    // Рисуем диаграмму
    const total = data.reduce((acc, val) => acc + val, 0)
    let startAngle = 0

    for (let i = 0; i < data.length; i++) {
      const sliceAngle = (2 * Math.PI * data[i]) / total

      ctx.fillStyle = colors[i]
      ctx.beginPath()
      ctx.moveTo(150, 150)
      ctx.arc(150, 150, 100, startAngle, startAngle + sliceAngle)
      ctx.closePath()
      ctx.fill()

      startAngle += sliceAngle
    }

    // Добавляем легенду
    ctx.font = "14px Arial"
    let legendY = 320

    for (let i = 0; i < labels.length; i++) {
      ctx.fillStyle = colors[i]
      ctx.fillRect(50, legendY, 20, 20)

      ctx.fillStyle = "#000"
      ctx.fillText(`${labels[i]}: ${data[i]} (${Math.round((data[i] / total) * 100)}%)`, 80, legendY + 15)

      legendY += 30
    }

    setChartRendered(true)
  }, [tasksByPriority, chartRendered])

  const handleExportClick = () => {
    let csv = "Приоритет,Количество задач\n"

    tasksByPriority.forEach((item) => {
      let priorityName
      switch (item.priority) {
        case "critical":
          priorityName = "Критический"
          break
        case "high":
          priorityName = "Высокий"
          break
        case "medium":
          priorityName = "Средний"
          break
        case "low":
          priorityName = "Низкий"
          break
        default:
          priorityName = item.priority
      }

      csv += `"${priorityName}",${item.count}\n`
    })

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "tasks_by_priority.csv")
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

      <Card>
        <CardContent className="flex justify-center pt-6">
          <canvas ref={canvasRef} width="300" height="450"></canvas>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tasksByPriority.map((item) => {
          let bgColor
          let priorityName

          switch (item.priority) {
            case "critical":
              bgColor = "bg-red-500"
              priorityName = "Критический"
              break
            case "high":
              bgColor = "bg-orange-500"
              priorityName = "Высокий"
              break
            case "medium":
              bgColor = "bg-yellow-500"
              priorityName = "Средний"
              break
            case "low":
              bgColor = "bg-green-500"
              priorityName = "Низкий"
              break
            default:
              bgColor = "bg-blue-500"
              priorityName = item.priority
          }

          return (
            <Card key={item.priority}>
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${bgColor}`}></div>
                  <div className="text-xl font-bold">{item.count}</div>
                  <div className="text-sm text-muted-foreground text-center">{priorityName}</div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
