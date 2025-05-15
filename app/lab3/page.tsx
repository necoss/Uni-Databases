"use client"

import { useState } from "react"
import Link from "next/link"

export default function Lab3Page() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [employeeData, setEmployeeData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchData = async () => {
    if (!startDate || !endDate) {
      setError("Пожалуйста, выберите начальную и конечную даты")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/employee-hours?startDate=${startDate}&endDate=${endDate}`)

      if (!response.ok) {
        throw new Error("Ошибка при получении данных")
      }

      const data = await response.json()
      setEmployeeData(data)
    } catch (error) {
      console.error("Error fetching employee hours:", error)
      setError("Произошла ошибка при загрузке данных")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Лабораторная работа 3</h1>
        <Link href="/" className="text-blue-500 hover:underline">
          Вернуться на главную
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Анализ рабочего времени сотрудников</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Начальная дата</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Конечная дата</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isLoading ? "Загрузка..." : "Получить данные"}
            </button>
          </div>
        </div>

        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">{error}</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Сотрудник</th>
                <th className="py-2 px-4 border-b text-left">Отработано часов</th>
              </tr>
            </thead>
            <tbody>
              {employeeData.length > 0 ? (
                employeeData.map((employee, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      {employee.employee_surname} {employee.employee_name}
                    </td>
                    <td className="py-2 px-4 border-b">{Number.parseFloat(employee.hours).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="py-4 px-4 text-center text-gray-500">
                    {isLoading ? "Загрузка данных..." : "Нет данных для отображения"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Описание работы</h3>
          <p className="text-gray-700">
            В данной лабораторной работе выполняется анализ рабочего времени сотрудников за выбранный период. Для
            каждого сотрудника рассчитывается общее количество отработанных часов на основе данных о времени прихода и
            ухода. Результаты отсортированы по количеству часов в порядке убывания.
          </p>
          <h3 className="text-lg font-semibold mt-4 mb-2">SQL-запрос</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {`SELECT e.employee_id, e.employee_name, e.employee_surname,
       SUM(EXTRACT(EPOCH FROM (a.check_out - a.check_in)) / 3600) as hours
FROM employees e
LEFT JOIN attendances a ON e.employee_id = a.employee_id
WHERE a.check_in >= [startDate] AND a.check_out <= [endDate]
GROUP BY e.employee_id, e.employee_name, e.employee_surname
ORDER BY hours DESC`}
          </pre>
        </div>
      </div>
    </div>
  )
}
