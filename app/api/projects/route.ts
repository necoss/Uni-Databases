import { getProjects } from "@/lib/data"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const projects = await getProjects()
    return NextResponse.json(projects)
  } catch (error) {
    console.error("Ошибка при получении проектов:", error)
    return NextResponse.json({ error: "Ошибка при получении проектов" }, { status: 500 })
  }
}
