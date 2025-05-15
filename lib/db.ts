import postgres from "postgres"

// Проверяем наличие всех необходимых переменных окружения
const requiredEnvVars = ["POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_HOST", "POSTGRES_PORT", "POSTGRES_DATABASE"]
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])

if (missingEnvVars.length > 0) {
  console.warn(`Missing environment variables: ${missingEnvVars.join(", ")}`)
}

// Создаем соединение с базой данных
let sql: any = null

try {
  if (missingEnvVars.length === 0) {
    sql = postgres({
      host: process.env.POSTGRES_HOST,
      port: Number.parseInt(process.env.POSTGRES_PORT || "5432"),
      database: process.env.POSTGRES_DATABASE,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      ssl: process.env.NODE_ENV === "production",
      max: 10, // Максимальное количество соединений
      idle_timeout: 20, // Время простоя соединения в секундах
    })
    console.log("PostgreSQL connection initialized")
  } else {
    console.warn("PostgreSQL connection not initialized due to missing environment variables")
  }
} catch (error) {
  console.error("Error initializing PostgreSQL connection:", error)
}

// Функция для проверки доступности базы данных
export async function isDatabaseAvailable() {
  // Проверяем, находимся ли мы в среде предпросмотра v0 или на клиенте
  const isPreviewOrClient = typeof window !== "undefined" || process.env.VERCEL_ENV === "preview"

  if (isPreviewOrClient) {
    console.log("Preview or client environment detected, database considered unavailable")
    return false
  }

  if (!sql) {
    console.log("SQL client is not initialized")
    return false
  }

  try {
    // Используем простой запрос для проверки соединения
    const result = await sql`SELECT 1 as test`
    const isAvailable = result.length > 0 && result[0].test === 1
    console.log("Database availability check result:", isAvailable)
    return isAvailable
  } catch (error) {
    console.error("Database availability check failed:", error)
    return false
  }
}

// Функция для выполнения SQL-запросов
export async function query(text: string, params: any[] = []) {
  // Проверяем, находимся ли мы в среде предпросмотра v0 или на клиенте
  const isPreviewOrClient = typeof window !== "undefined" || process.env.VERCEL_ENV === "preview"

  if (isPreviewOrClient) {
    console.log("Preview or client environment detected, query not executed:", text)
    return { rows: [], rowCount: 0 }
  }

  if (!sql) {
    console.warn("SQL client is not initialized, query not executed:", text)
    return { rows: [], rowCount: 0 }
  }

  try {
    const start = Date.now()

    // Преобразуем параметры запроса в формат, понятный postgres
    const result = await sql.unsafe(text, params)

    const duration = Date.now() - start
    console.log("Executed query", { text, duration, rows: result.length })

    return { rows: result, rowCount: result.length }
  } catch (error) {
    console.error("Error executing query", { text, error })
    return { rows: [], rowCount: 0 }
  }
}

// Функция для получения одной записи
export async function getOne(text: string, params: any[] = []) {
  const res = await query(text, params)
  return res.rows[0]
}

// Функция для получения нескольких записей
export async function getMany(text: string, params: any[] = []) {
  const res = await query(text, params)
  return res.rows
}

// Функция для вставки данных
export async function insert(text: string, params: any[] = []) {
  const res = await query(text, params)
  return res.rows[0]
}

// Функция для обновления данных
export async function update(text: string, params: any[] = []) {
  const res = await query(text, params)
  return res.rows[0]
}

// Функция для удаления данных
export async function remove(text: string, params: any[] = []) {
  const res = await query(text, params)
  return res.rowCount
}

// Тестовые данные для использования, когда база данных недоступна
export const TEST_DATA = {
  employees: [
    {
      employee_id: 1,
      employee_name: "Иван",
      employee_surname: "Иванов",
      email: "ivan.ivanov@example.com",
      hire_date: "2020-05-15T09:00:00",
      position: "Разработчик",
    },
    {
      employee_id: 2,
      employee_name: "Петр",
      employee_surname: "Петров",
      email: "petr.petrov@example.com",
      hire_date: "2019-03-10T09:00:00",
      position: "Менеджер проектов",
    },
    {
      employee_id: 3,
      employee_name: "Анна",
      employee_surname: "Сидорова",
      email: "anna.sidorova@example.com",
      hire_date: "2021-07-22T09:00:00",
      position: "Дизайнер",
    },
  ],
  projects: [
    {
      project_id: 1,
      project_name: "Система учета",
      client: "ООО Ромашка",
      start_date: "2023-01-10T00:00:00",
      end_date: "2023-06-30T00:00:00",
      employee_id: 2,
      description: "Разработка CRM-системы",
      manager_name: "Петров Петр",
    },
    {
      project_id: 2,
      project_name: "Мобильное приложение",
      client: "ИП Сергеев",
      start_date: "2023-02-15T00:00:00",
      end_date: "2023-08-20T00:00:00",
      employee_id: 1,
      description: "Приложение для доставки еды",
      manager_name: "Иванов Иван",
    },
  ],
  tasks: [
    {
      task_id: 1,
      task_name: "Разработать API",
      status: false,
      priority: "high",
      description: "REST API для интеграции",
      deadline: "2023-05-20T18:00:00",
      project_id: 1,
      project_name: "Система учета",
    },
    {
      task_id: 2,
      task_name: "Создать дизайн макета",
      status: false,
      priority: "medium",
      description: "UI/UX для главной страницы",
      deadline: "2023-03-25T18:00:00",
      project_id: 2,
      project_name: "Мобильное приложение",
    },
    {
      task_id: 3,
      task_name: "Написать тесты",
      status: true,
      priority: "low",
      description: "Юнит-тесты для модуля оплаты",
      deadline: "2023-04-10T18:00:00",
      project_id: 1,
      project_name: "Система учета",
    },
  ],
  tasksByPriority: [
    { priority: "critical", count: "1" },
    { priority: "high", count: "1" },
    { priority: "medium", count: "1" },
    { priority: "low", count: "1" },
  ],
  projectsWithTasks: [
    { project_id: 1, project_name: "Система учета", tasks_count: "2", completed_tasks: "1" },
    { project_id: 2, project_name: "Мобильное приложение", tasks_count: "1", completed_tasks: "0" },
  ],
  employeeWorkHours: [
    { employee_id: 1, employee_name: "Иван", employee_surname: "Иванов", hours: 40 },
    { employee_id: 2, employee_name: "Петр", employee_surname: "Петров", hours: 38 },
    { employee_id: 3, employee_name: "Анна", employee_surname: "Сидорова", hours: 42 },
  ],
  employeesWithProjects: [
    { employee_id: 1, employee_name: "Иван", employee_surname: "Иванов", projects_count: 1 },
    { employee_id: 2, employee_name: "Петр", employee_surname: "Петров", projects_count: 1 },
    { employee_id: 3, employee_name: "Анна", employee_surname: "Сидорова", projects_count: 0 },
  ],
  tasksStatistics: [
    { project_name: "Система учета", total_tasks: 2, completed_tasks: 1, completion_percentage: 50 },
    { project_name: "Мобильное приложение", total_tasks: 1, completed_tasks: 0, completion_percentage: 0 },
  ],
}

// Функция для проверки, нужно ли использовать тестовые данные
export async function shouldUseTestData() {
  // Проверяем, находимся ли мы в среде предпросмотра v0 или на клиенте
  const isPreviewOrClient = typeof window !== "undefined" || process.env.VERCEL_ENV === "preview"

  if (isPreviewOrClient) {
    console.log("Preview or client environment detected, using test data")
    return true
  }

  // Проверяем доступность базы данных только если мы не в среде предпросмотра
  try {
    const dbAvailable = await isDatabaseAvailable()
    return !dbAvailable
  } catch (error) {
    console.error("Error checking database availability:", error)
    return true
  }
}
