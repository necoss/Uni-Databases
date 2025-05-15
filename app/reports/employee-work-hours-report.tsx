"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { CalendarIcon, Download } from "lucide-react"
import { useRef, useState } from "react"

export default function EmployeeWorkHoursReport() {
  const [date, setDate] = useState<{
    from: Date
    to: Date
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })

  const [reportData, setReportData] = useState<
    {
      employee_id: number
      employee_name: string
      employee_surname: string
      hours: number
    }[]
  >([])

  const [isLoading, setIsLoading] = useState(false)
  const tableRef = useRef<HTMLTableElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFetchReport = () => {
    setIsLoading(true)

    // Имитация загрузки данных для отладки
    setTimeout(() => {
      setReportData([
        { employee_id: 1, employee_name: "Иван", employee_surname: "Иванов", hours: 40.5 },
        { employee_id: 2, employee_name: "Петр", employee_surname: "Петров", hours: 38.0 },
        { employee_id: 3, employee_name: "Анна", employee_surname: "Сидорова", hours: 42.5 },
      ])
      setIsLoading(false)

      // Отрисовка графика после получения данных
      setTimeout(() => {
        renderChart([
          { employee_id: 1, employee_name: "Иван", employee_surname: "Иванов", hours: 40.5 },
          { employee_id: 2, employee_name: "Петр", employee_surname: "Петров", hours: 38.0 },
          { employee_id: 3, employee_name: "Анна", employee_surname: "Сидорова", hours: 42.5 },
        ])
      }, 100)
    }, 1000)
  }

  const renderChart = (data: any[]) => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Очистка холста
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Сортировка данных по убыванию часов
    const sortedData = [...data].sort((a, b) => b.hours - a.hours)

    // Ограничение до 10 сотрудников для графика
    const chartData = sortedData.slice(0, 10)

    // Настройки графика
    const barHeight = 30
    const barSpacing = 40
    const maxBarWidth = 400
    const leftMargin = 150
    const topMargin = 20

    // Находим максимальное значение часов
    const maxHours = Math.max(...chartData.map((item) => item.hours), 1)

    // Рисуем оси
    ctx.beginPath()
    ctx.moveTo(leftMargin, topMargin)
    ctx.lineTo(leftMargin, topMargin + chartData.length * barSpacing + 10)
    ctx.stroke()

    // Рисуем горизонтальные линии сетки и подписи к оси X
    for (let i = 0; i <= 5; i++) {
      const x = leftMargin + (maxBarWidth / 5) * i
      const hours = (maxHours / 5) * i

      ctx.beginPath()
      ctx.moveTo(x, topMargin)
      ctx.lineTo(x, topMargin + chartData.length * barSpacing + 10)
      ctx.strokeStyle = "#e5e5e5"
      ctx.stroke()

      ctx.fillStyle = "#000"
      ctx.textAlign = "center"
      ctx.fillText(hours.toFixed(1), x, topMargin + chartData.length * barSpacing + 25)
    }

    // Рисуем полосы и подписи
    chartData.forEach((item, index) => {
      const y = topMargin + index * barSpacing
      const barWidth = (item.hours / maxHours) * maxBarWidth

      // Рисуем полосу
      ctx.fillStyle = "#3b82f6"
      ctx.fillRect(leftMargin, y, barWidth, barHeight)

      // Добавляем имя сотрудника
      ctx.fillStyle = "#000"
      ctx.textAlign = "right"
      ctx.fillText(`${item.employee_surname} ${item.employee_name.charAt(0)}.`, leftMargin - 10, y + barHeight / 2 + 5)

      // Добавляем значение часов
      ctx.textAlign = "left"
      ctx.fillText(`${item.hours.toFixed(1)} ч.`, leftMargin + barWidth + 5, y + barHeight / 2 + 5)
    })
  }

  const handleExportClick = () => {
    let csv = "Сотрудник,Отработано часов\n"

    reportData.forEach((item) => {
      csv += `"${item.employee_surname} ${item.employee_name}",${item.hours.toFixed(1)}\n`
    })

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "employee_work_hours.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[300px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "d MMMM yyyy", { locale: ru })} -{" "}
                      {format(date.to, "d MMMM yyyy", { locale: ru })}
                    </>
                  ) : (
                    format(date.from, "d MMMM yyyy", { locale: ru })
                  )
                ) : (
                  <span>Выберите период</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDate(range)
                  }
                }}
                numberOfMonths={2}
                locale={ru}
              />
            </PopoverContent>
          </Popover>

          <Button onClick={handleFetchReport} disabled={isLoading}>
            {isLoading ? "Загрузка..." : "Применить"}
          </Button>
        </div>

        <Button variant="outline" onClick={handleExportClick}>
          <Download className="mr-2 h-4 w-4" />
          Экспорт в CSV
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <canvas ref={canvasRef} width="600" height="500"></canvas>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table ref={tableRef}>
          <TableHeader>
            <TableRow>
              <TableHead>Сотрудник</TableHead>
              <TableHead className="text-right">Отработано часов</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.length > 0 ? (
              reportData.map((item) => (
                <TableRow key={item.employee_id}>
                  <TableCell className="font-medium">
                    {item.employee_surname} {item.employee_name}
                  </TableCell>
                  <TableCell className="text-right">{item.hours.toFixed(1)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  {isLoading ? "Загрузка данных..." : "Нет данных для отображения."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
