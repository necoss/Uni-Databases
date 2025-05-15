"use server"

import {
  createEmployee as dbCreateEmployee,
  updateEmployee as dbUpdateEmployee,
  deleteEmployee as dbDeleteEmployee,
  createProject as dbCreateProject,
  updateProject as dbUpdateProject,
  deleteProject as dbDeleteProject,
  createTask as dbCreateTask,
  updateTask as dbUpdateTask,
  deleteTask as dbDeleteTask,
  createAttendance as dbCreateAttendance,
  updateAttendance as dbUpdateAttendance,
  deleteAttendance as dbDeleteAttendance,
  getTaskById,
} from "@/lib/data"

// Действия для сотрудников
export async function createEmployee(data: any) {
  return dbCreateEmployee(data)
}

export async function updateEmployee(id: number, data: any) {
  return dbUpdateEmployee(id, data)
}

export async function deleteEmployee(id: number) {
  return dbDeleteEmployee(id)
}

// Действия для проектов
export async function createProject(data: any) {
  return dbCreateProject(data)
}

export async function updateProject(id: number, data: any) {
  return dbUpdateProject(id, data)
}

export async function deleteProject(id: number) {
  return dbDeleteProject(id)
}

// Действия для задач
export async function createTask(data: any) {
  return dbCreateTask(data)
}

export async function updateTask(id: number, data: any) {
  return dbUpdateTask(id, data)
}

export async function deleteTask(id: number) {
  return dbDeleteTask(id)
}

export async function updateTaskStatus(id: number, status: boolean) {
  const task = await getTaskById(id)
  if (!task) {
    throw new Error("Задача не найдена")
  }

  return dbUpdateTask(id, { status })
}

// Действия для посещаемости
export async function createAttendance(data: any) {
  return dbCreateAttendance(data)
}

export async function updateAttendance(id: number, data: any) {
  return dbUpdateAttendance(id, data)
}

export async function deleteAttendance(id: number) {
  return dbDeleteAttendance(id)
}
