import Link from "next/link"
import { getTasksStatistics } from "@/lib/data"

export default async function Lab2Page() {
  let tasksData = []

  try {
    tasksData = await getTasksStatistics()
  } catch (error) {
    console.error("Error fetching tasks statistics:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Лабораторная работа 2</h1>
        <Link href="/" className="text-blue-500 hover:underline">
          Вернуться на главную
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Статистика по задачам проектов</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Проект</th>
                <th className="py-2 px-4 border-b text-left">Всего задач</th>
                <th className="py-2 px-4 border-b text-left">Выполнено</th>
                <th className="py-2 px-4 border-b text-left">Процент выполнения</th>
              </tr>
            </thead>
            <tbody>
              {tasksData.length > 0 ? (
                tasksData.map((project, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{project.project_name}</td>
                    <td className="py-2 px-4 border-b">{project.total_tasks}</td>
                    <td className="py-2 px-4 border-b">{project.completed_tasks}</td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${project.completion_percentage}%` }}
                          ></div>
                        </div>
                        <span>{project.completion_percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 px-4 text-center text-gray-500">
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
            В данной лабораторной работе выполняется анализ задач по проектам. Для каждого проекта рассчитывается общее
            количество задач, количество выполненных задач и процент выполнения. Результаты отсортированы по проценту
            выполнения в порядке убывания.
          </p>
          <h3 className="text-lg font-semibold mt-4 mb-2">SQL-запрос</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {`SELECT p.project_name,
       COUNT(t.task_id) as total_tasks,
       SUM(CASE WHEN t.status = true THEN 1 ELSE 0 END) as completed_tasks,
       ROUND(SUM(CASE WHEN t.status = true THEN 1 ELSE 0 END) * 100.0 / COUNT(t.task_id), 2) as completion_percentage
FROM projects p
LEFT JOIN tasks t ON p.project_id = t.project_id
GROUP BY p.project_id, p.project_name
ORDER BY completion_percentage DESC`}
          </pre>
        </div>
      </div>
    </div>
  )
}
