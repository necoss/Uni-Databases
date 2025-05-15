export interface Employee {
  employee_id: number
  employee_name: string
  employee_surname: string
  email: string
  hire_date: string
  position: string
}

export interface Project {
  project_id: number
  project_name: string
  client: string
  start_date: string
  end_date: string
  employee_id: number
  description: string
}

export interface Task {
  task_id: number
  task_name: string
  status: boolean
  priority: string
  description: string
  deadline: string
  project_id: number
}

export interface Attendance {
  attendance_id: number
  check_in: string
  check_out: string | null
  employee_id: number
}
