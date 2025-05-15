import Link from "next/link"
import { getEmployees } from "@/lib/data"

export default async function EmployeesPage() {
  let employees = []

  try {
    employees = await getEmployees()
  } catch (error) {
    console.error("Error fetching employees:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Сотрудники</h1>
        <Link href="/" className="text-blue-500 hover:underline">
          Вернуться на главную
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">ID</th>
                <th className="py-2 px-4 border-b text-left">Имя</th>
                <th className="py-2 px-4 border-b text-left">Фамилия</th>
                <th className="py-2 px-4 border-b text-left">Email</th>
                <th className="py-2 px-4 border-b text-left">Должность</th>
                <th className="py-2 px-4 border-b text-left">Дата найма</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <tr key={employee.employee_id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{employee.employee_id}</td>
                    <td className="py-2 px-4 border-b">{employee.employee_name}</td>
                    <td className="py-2 px-4 border-b">{employee.employee_surname}</td>
                    <td className="py-2 px-4 border-b">{employee.email}</td>
                    <td className="py-2 px-4 border-b">{employee.position}</td>
                    <td className="py-2 px-4 border-b">{new Date(employee.hire_date).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                    Нет данных для отображения
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
