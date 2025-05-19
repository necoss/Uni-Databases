export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      employees: {
        Row: {
          employee_id: number
          employee_name: string
          employee_surname: string
          email: string
          hire_date: string
          position: string
        }
        Insert: {
          employee_id?: number
          employee_name: string
          employee_surname: string
          email: string
          hire_date: string
          position: string
        }
        Update: {
          employee_id?: number
          employee_name?: string
          employee_surname?: string
          email?: string
          hire_date?: string
          position?: string
        }
      }
      attendances: {
        Row: {
          attendance_id: number
          check_in: string
          check_out: string | null
          employee_id: number
        }
        Insert: {
          attendance_id?: number
          check_in: string
          check_out?: string | null
          employee_id: number
        }
        Update: {
          attendance_id?: number
          check_in?: string
          check_out?: string | null
          employee_id?: number
        }
      }
      projects: {
        Row: {
          project_id: number
          project_name: string
          client: string
          start_date: string
          end_date: string | null
          employee_id: number | null
          description: string | null
        }
        Insert: {
          project_id?: number
          project_name: string
          client: string
          start_date: string
          end_date?: string | null
          employee_id?: number | null
          description?: string | null
        }
        Update: {
          project_id?: number
          project_name?: string
          client?: string
          start_date?: string
          end_date?: string | null
          employee_id?: number | null
          description?: string | null
        }
      }
      tasks: {
        Row: {
          task_id: number
          task_name: string
          status: boolean
          priority: "low" | "medium" | "high" | "critical"
          description: string | null
          deadline: string | null
          project_id: number
        }
        Insert: {
          task_id?: number
          task_name: string
          status?: boolean
          priority: "low" | "medium" | "high" | "critical"
          description?: string | null
          deadline?: string | null
          project_id: number
        }
        Update: {
          task_id?: number
          task_name?: string
          status?: boolean
          priority?: "low" | "medium" | "high" | "critical"
          description?: string | null
          deadline?: string | null
          project_id?: number
        }
      }
    }
  }
}

export type Employee = Database["public"]["Tables"]["employees"]["Row"]
export type EmployeeInsert = Database["public"]["Tables"]["employees"]["Insert"]
export type EmployeeUpdate = Database["public"]["Tables"]["employees"]["Update"]

export type Attendance = Database["public"]["Tables"]["attendances"]["Row"]
export type AttendanceInsert = Database["public"]["Tables"]["attendances"]["Insert"]
export type AttendanceUpdate = Database["public"]["Tables"]["attendances"]["Update"]

export type Project = Database["public"]["Tables"]["projects"]["Row"]
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"]
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"]

export type Task = Database["public"]["Tables"]["tasks"]["Row"]
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"]
export type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"]

export type PriorityLevel = "low" | "medium" | "high" | "critical"
