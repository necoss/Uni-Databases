import Link from "next/link"
import { getEmployeesWithProjects } from "@/lib/data"

export default async function Lab1Page() {
  let employeesData = []

  try {
    employeesData = await getEmployeesWithProjects()
  } catch (error) {
    console.error("Error fetching employees with projects:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Лабораторная работа 1</h1>
        <Link href="/" className="text-blue-500 hover:underline">
          Вернуться на главную
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Анализ сотрудников и их проектов</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">ID</th>
                <th className="py-2 px-4 border-b text-left">Сотрудник</th>
                <th className="py-2 px-4 border-b text-left">Количество проектов</th>
              </tr>
            </thead>
            <tbody>
              {employeesData.length > 0 ? (
                employeesData.map((employee) => (
                  <tr key={employee.employee_id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{employee.employee_id}</td>
                    <td className="py-2 px-4 border-b">
                      {employee.employee_surname} {employee.employee_name}
                    </td>
                    <td className="py-2 px-4 border-b">{employee.projects_count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-4 px-4 text-center text-gray-500">
                    Нет данных для отображения
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Описание работы</h3>
          <p className="text-gray-700">
            В данной лабораторной работе выполняется анализ сотрудников и количества проектов, которыми они руководят.
            Результаты отсортированы по убыванию количества проектов, что позволяет быстро определить наиболее
            загруженных руководителей.
          </p>
          <h3 className="text-lg font-semibold mt-4 mb-2">SQL-запрос</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {`SELECT e.employee_id, e.employee_name, e.employee_surname, 
       COUNT(p.project_id) as projects_count
FROM employees e
LEFT JOIN projects p ON e.employee_id = p.employee_id
GROUP BY e.employee_id, e.employee_name, e.employee_surname
ORDER BY projects_count DESC`}
          </pre>
        </div>
      </div>
    </div>
  )
}
