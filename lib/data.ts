import { getMany, getOne, insert, update, remove, shouldUseTestData, TEST_DATA } from "./db"
import type { Employee, Project, Task, Attendance } from "./types"

// Функции для работы с сотрудниками
export async function getEmployees(): Promise<Employee[]> {
  if (await shouldUseTestData()) {
    return TEST_DATA.employees
  }

  try {
    return await getMany(`
      SELECT * FROM employees 
      ORDER BY employee_surname, employee_name
    `)
  } catch (error) {
    console.error("Error fetching employees:", error)
    return TEST_DATA.employees
  }
}

export async function getEmployeeById(id: number): Promise<Employee | null> {
  if (await shouldUseTestData()) {
    return TEST_DATA.employees.find((emp) => emp.employee_id === id) || null
  }

  try {
    return await getOne(
      `
      SELECT * FROM employees 
      WHERE employee_id = $1
    `,
      [id],
    )
  } catch (error) {
    console.error(`Error fetching employee with id ${id}:`, error)
    return TEST_DATA.employees.find((emp) => emp.employee_id === id) || null
  }
}

export async function createEmployee(data: Omit<Employee, "employee_id">): Promise<Employee> {
  if (await shouldUseTestData()) {
    const newId = Math.max(...TEST_DATA.employees.map((e) => e.employee_id)) + 1
    const newEmployee = { ...data, employee_id: newId }
    TEST_DATA.employees.push(newEmployee as Employee)
    return newEmployee as Employee
  }

  return await insert(
    `
    INSERT INTO employees (employee_name, employee_surname, email, hire_date, position)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,
    [data.employee_name, data.employee_surname, data.email, data.hire_date, data.position],
  )
}

export async function updateEmployee(id: number, data: Partial<Employee>): Promise<Employee> {
  if (await shouldUseTestData()) {
    const index = TEST_DATA.employees.findIndex((e) => e.employee_id === id)
    if (index >= 0) {
      TEST_DATA.employees[index] = { ...TEST_DATA.employees[index], ...data }
      return TEST_DATA.employees[index]
    }
    throw new Error(`Employee with id ${id} not found`)
  }

  const fields = []
  const values = []
  let paramIndex = 1

  if (data.employee_name !== undefined) {
    fields.push(`employee_name = $${paramIndex++}`)
    values.push(data.employee_name)
  }

  if (data.employee_surname !== undefined) {
    fields.push(`employee_surname = $${paramIndex++}`)
    values.push(data.employee_surname)
  }

  if (data.email !== undefined) {
    fields.push(`email = $${paramIndex++}`)
    values.push(data.email)
  }

  if (data.hire_date !== undefined) {
    fields.push(`hire_date = $${paramIndex++}`)
    values.push(data.hire_date)
  }

  if (data.position !== undefined) {
    fields.push(`position = $${paramIndex++}`)
    values.push(data.position)
  }

  values.push(id)

  return await update(
    `
    UPDATE employees
    SET ${fields.join(", ")}
    WHERE employee_id = $${paramIndex}
    RETURNING *
  `,
    values,
  )
}

export async function deleteEmployee(id: number): Promise<boolean> {
  if (await shouldUseTestData()) {
    const index = TEST_DATA.employees.findIndex((e) => e.employee_id === id)
    if (index >= 0) {
      TEST_DATA.employees.splice(index, 1)
      return true
    }
    return false
  }

  const result = await remove(
    `
    DELETE FROM employees
    WHERE employee_id = $1
  `,
    [id],
  )

  return result > 0
}

// Функции для работы с проектами
export async function getProjects(): Promise<Project[]> {
  if (await shouldUseTestData()) {
    return TEST_DATA.projects
  }

  try {
    return await getMany(`
      SELECT p.*, CONCAT(e.employee_surname, ' ', e.employee_name) as manager_name
      FROM projects p
      LEFT JOIN employees e ON p.employee_id = e.employee_id
      ORDER BY p.start_date DESC
    `)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return TEST_DATA.projects
  }
}

export async function getProjectById(id: number): Promise<Project | null> {
  if (await shouldUseTestData()) {
    return TEST_DATA.projects.find((proj) => proj.project_id === id) || null
  }

  try {
    return await getOne(
      `
      SELECT p.*, CONCAT(e.employee_surname, ' ', e.employee_name) as manager_name
      FROM projects p
      LEFT JOIN employees e ON p.employee_id = e.employee_id
      WHERE p.project_id = $1
    `,
      [id],
    )
  } catch (error) {
    console.error(`Error fetching project with id ${id}:`, error)
    return TEST_DATA.projects.find((proj) => proj.project_id === id) || null
  }
}

// Функции для работы с задачами
export async function getTasks(): Promise<Task[]> {
  if (await shouldUseTestData()) {
    return TEST_DATA.tasks
  }

  try {
    return await getMany(`
      SELECT t.*, p.project_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.project_id
      ORDER BY t.deadline
    `)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return TEST_DATA.tasks
  }
}

export async function getTasksByProjectId(projectId: number): Promise<Task[]> {
  if (await shouldUseTestData()) {
    return TEST_DATA.tasks.filter((task) => task.project_id === projectId)
  }

  try {
    return await getMany(
      `
      SELECT t.*, p.project_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.project_id
      WHERE t.project_id = $1
      ORDER BY t.deadline
    `,
      [projectId],
    )
  } catch (error) {
    console.error(`Error fetching tasks for project ${projectId}:`, error)
    return TEST_DATA.tasks.filter((task) => task.project_id === projectId)
  }
}

export async function getTasksCount(): Promise<number> {
  if (await shouldUseTestData()) {
    return TEST_DATA.tasks.length
  }

  try {
    const result = await getOne(`
      SELECT COUNT(*) as count FROM tasks
    `)
    return Number.parseInt(result?.count || "0")
  } catch (error) {
    console.error("Error counting tasks:", error)
    return TEST_DATA.tasks.length
  }
}

export async function getCompletedTasksCount(): Promise<number> {
  if (await shouldUseTestData()) {
    return TEST_DATA.tasks.filter((task) => task.status).length
  }

  try {
    const result = await getOne(`
      SELECT COUNT(*) as count FROM tasks WHERE status = true
    `)
    return Number.parseInt(result?.count || "0")
  } catch (error) {
    console.error("Error counting completed tasks:", error)
    return TEST_DATA.tasks.filter((task) => task.status).length
  }
}

// Функции для работы с отчетами
export async function getTasksByPriority(): Promise<any[]> {
  if (await shouldUseTestData()) {
    return TEST_DATA.tasksByPriority
  }

  try {
    return await getMany(`
      SELECT priority, COUNT(*) as count 
      FROM tasks 
      GROUP BY priority
      ORDER BY 
        CASE 
          WHEN priority = 'critical' THEN 1
          WHEN priority = 'high' THEN 2
          WHEN priority = 'medium' THEN 3
          WHEN priority = 'low' THEN 4
        END
    `)
  } catch (error) {
    console.error("Error fetching tasks by priority:", error)
    return TEST_DATA.tasksByPriority
  }
}

export async function getProjectsWithTasksCount(): Promise<any[]> {
  if (await shouldUseTestData()) {
    return TEST_DATA.projectsWithTasks
  }

  try {
    return await getMany(`
      SELECT p.project_id, p.project_name, COUNT(t.task_id) as tasks_count,
             SUM(CASE WHEN t.status = true THEN 1 ELSE 0 END) as completed_tasks
      FROM projects p
      LEFT JOIN tasks t ON p.project_id = t.project_id
      GROUP BY p.project_id, p.project_name
      ORDER BY p.start_date DESC
    `)
  } catch (error) {
    console.error("Error fetching projects with tasks count:", error)
    return TEST_DATA.projectsWithTasks
  }
}

// Функции для работы с посещаемостью
export async function getAttendancesByEmployeeId(employeeId: number): Promise<Attendance[]> {
  if (await shouldUseTestData()) {
    return []
  }

  try {
    return await getMany(
      `
      SELECT *
      FROM attendances
      WHERE employee_id = $1
      ORDER BY check_in DESC
    `,
      [employeeId],
    )
  } catch (error) {
    console.error(`Error fetching attendances for employee ${employeeId}:`, error)
    return []
  }
}

// Функции для отчетов
export async function getEmployeesCount(): Promise<number> {
  if (await shouldUseTestData()) {
    return TEST_DATA.employees.length
  }

  try {
    const result = await getOne(`
      SELECT COUNT(*) as count FROM employees
    `)
    return Number.parseInt(result?.count || "0")
  } catch (error) {
    console.error("Error counting employees:", error)
    return TEST_DATA.employees.length
  }
}

export async function getProjectsCount(): Promise<number> {
  if (await shouldUseTestData()) {
    return TEST_DATA.projects.length
  }

  try {
    const result = await getOne(`
      SELECT COUNT(*) as count FROM projects
    `)
    return Number.parseInt(result?.count || "0")
  } catch (error) {
    console.error("Error counting projects:", error)
    return TEST_DATA.projects.length
  }
}

// Функция для лабораторной работы 1: Получение списка сотрудников с их проектами
export async function getEmployeesWithProjects(): Promise<any[]> {
  if (await shouldUseTestData()) {
    return TEST_DATA.employeesWithProjects
  }

  try {
    return await getMany(`
      SELECT e.employee_id, e.employee_name, e.employee_surname, 
             COUNT(p.project_id) as projects_count
      FROM employees e
      LEFT JOIN projects p ON e.employee_id = p.employee_id
      GROUP BY e.employee_id, e.employee_name, e.employee_surname
      ORDER BY projects_count DESC
    `)
  } catch (error) {
    console.error("Error fetching employees with projects:", error)
    return TEST_DATA.employeesWithProjects
  }
}

// Функция для лабораторной работы 2: Получение статистики по задачам
export async function getTasksStatistics(): Promise<any[]> {
  if (await shouldUseTestData()) {
    return TEST_DATA.tasksStatistics
  }

  try {
    return await getMany(`
      SELECT p.project_name,
             COUNT(t.task_id) as total_tasks,
             SUM(CASE WHEN t.status = true THEN 1 ELSE 0 END) as completed_tasks,
             ROUND(SUM(CASE WHEN t.status = true THEN 1 ELSE 0 END) * 100.0 / COUNT(t.task_id), 2) as completion_percentage
      FROM projects p
      LEFT JOIN tasks t ON p.project_id = t.project_id
      GROUP BY p.project_id, p.project_name
      ORDER BY completion_percentage DESC
    `)
  } catch (error) {
    console.error("Error fetching tasks statistics:", error)
    return TEST_DATA.tasksStatistics
  }
}

// Функция для лабораторной работы 3: Анализ рабочего времени сотрудников
export async function getEmployeeWorkHours(startDate: string, endDate: string): Promise<any[]> {
  if (await shouldUseTestData()) {
    return TEST_DATA.employeeWorkHours
  }

  try {
    return await getMany(
      `
      SELECT e.employee_id, e.employee_name, e.employee_surname,
             SUM(EXTRACT(EPOCH FROM (a.check_out - a.check_in)) / 3600) as hours
      FROM employees e
      LEFT JOIN attendances a ON e.employee_id = a.employee_id
      WHERE a.check_in >= $1 AND a.check_out <= $2
      GROUP BY e.employee_id, e.employee_name, e.employee_surname
      ORDER BY hours DESC
    `,
      [startDate, endDate],
    )
  } catch (error) {
    console.error("Error fetching employee work hours:", error)
    return TEST_DATA.employeeWorkHours
  }
}

// Employee related functions
export async function createAttendance(data: any): Promise<Attendance> {
  if (await shouldUseTestData()) {
    console.log("Preview mode detected, using test data for creating attendance")
    const newAttendance = {
      attendance_id: Math.floor(Math.random() * 1000) + 1,
      check_in: data.check_in,
      check_out: data.check_out,
      employee_id: data.employee_id,
    }
    return newAttendance
  }

  return await insert(
    `
    INSERT INTO attendances (check_in, check_out, employee_id)
    VALUES ($1, $2, $3)
    RETURNING *
  `,
    [data.check_in, data.check_out, data.employee_id],
  )
}

export async function updateAttendance(id: number, data: any): Promise<Attendance> {
  if (await shouldUseTestData()) {
    console.log(`Preview mode detected, using test data for updating attendance with id ${id}`)
    return {
      attendance_id: id,
      check_in: data.check_in,
      check_out: data.check_out,
      employee_id: data.employee_id,
    }
  }

  return await update(
    `
    UPDATE attendances
    SET check_in = $1, check_out = $2, employee_id = $3
    WHERE attendance_id = $4
    RETURNING *
  `,
    [data.check_in, data.check_out, data.employee_id, id],
  )
}

export async function deleteAttendance(id: number): Promise<number> {
  if (await shouldUseTestData()) {
    console.log(`Preview mode detected, using test data for deleting attendance with id ${id}`)
    return 1
  }

  return await remove(
    `
    DELETE FROM attendances
    WHERE attendance_id = $1
  `,
    [id],
  )
}
