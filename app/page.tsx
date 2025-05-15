import Link from "next/link"
import { getEmployeesCount, getProjectsCount, getTasksCount, getCompletedTasksCount } from "@/lib/data"

export default async function Home() {
  // Получаем данные для статистики с обработкой ошибок
  let employeesCount = 0
  let projectsCount = 0
  let tasksCount = 0
  let completedTasksCount = 0

  try {
    employeesCount = await getEmployeesCount()
    projectsCount = await getProjectsCount()
    tasksCount = await getTasksCount()
    completedTasksCount = await getCompletedTasksCount()
  } catch (error) {
    console.error("Error fetching statistics:", error)
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Интерфейс PostgreSQL</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Сотрудники</h2>
          <p className="text-3xl font-bold">{employeesCount}</p>
          <Link href="/employees" className="text-blue-500 hover:underline mt-2 inline-block">
            Просмотреть всех
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Проекты</h2>
          <p className="text-3xl font-bold">{projectsCount}</p>
          <Link href="/projects" className="text-blue-500 hover:underline mt-2 inline-block">
            Просмотреть все
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Задачи</h2>
          <p className="text-3xl font-bold">{tasksCount}</p>
          <Link href="/tasks" className="text-blue-500 hover:underline mt-2 inline-block">
            Просмотреть все
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Выполнено задач</h2>
          <p className="text-3xl font-bold">{completedTasksCount}</p>
          <p className="text-sm text-gray-500">
            {tasksCount > 0 ? `${Math.round((completedTasksCount / tasksCount) * 100)}%` : "0%"}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Лабораторные работы</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Лабораторная работа 1</h3>
            <p className="text-gray-600 mb-2">Анализ сотрудников и их проектов</p>
            <Link href="/lab1" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Открыть отчет
            </Link>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Лабораторная работа 2</h3>
            <p className="text-gray-600 mb-2">Статистика по задачам проектов</p>
            <Link href="/lab2" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Открыть отчет
            </Link>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Лабораторная работа 3</h3>
            <p className="text-gray-600 mb-2">Анализ рабочего времени сотрудников</p>
            <Link href="/lab3" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Открыть отчет
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
