import { getEmployees } from "@/lib/data"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const employees = await getEmployees()
    return NextResponse.json(employees)
  } catch (error) {
    console.error("Ошибка при получении сотрудников:", error)
    return NextResponse.json({ error: "Ошибка при получении сотрудников" }, { status: 500 })
  }
}
