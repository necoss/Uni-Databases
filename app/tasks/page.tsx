import Link from "next/link"
import { getTasks } from "@/lib/data"

export default async function TasksPage() {
  let tasks = []

  try {
    tasks = await getTasks()
  } catch (error) {
    console.error("Error fetching tasks:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Задачи</h1>
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
                <th className="py-2 px-4 border-b text-left">Название</th>
                <th className="py-2 px-4 border-b text-left">Проект</th>
                <th className="py-2 px-4 border-b text-left">Приоритет</th>
                <th className="py-2 px-4 border-b text-left">Срок</th>
                <th className="py-2 px-4 border-b text-left">Статус</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.task_id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{task.task_id}</td>
                    <td className="py-2 px-4 border-b">{task.task_name}</td>
                    <td className="py-2 px-4 border-b">{task.project_name}</td>
                    <td className="py-2 px-4 border-b">{task.priority}</td>
                    <td className="py-2 px-4 border-b">{new Date(task.deadline).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b">
                      <span
                        className={`px-2 py-1 rounded text-xs ${task.status ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                      >
                        {task.status ? "Выполнено" : "В процессе"}
                      </span>
                    </td>
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
