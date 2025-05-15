import { getEmployeeWorkHours } from "@/lib/data"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Необходимо указать начальную и конечную даты" }, { status: 400 })
    }

    const data = await getEmployeeWorkHours(startDate, endDate)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Ошибка при получении отчета:", error)
    return NextResponse.json({ error: "Ошибка при получении отчета" }, { status: 500 })
  }
}
