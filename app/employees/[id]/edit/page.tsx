import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getEmployeeById } from "@/lib/data"
import { notFound } from "next/navigation"
import EmployeeForm from "../../employee-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface EditEmployeePageProps {
  params: {
    id: string
  }
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const employeeId = Number.parseInt(params.id)

  if (isNaN(employeeId)) {
    notFound()
  }

  const employee = await getEmployeeById(employeeId)

  if (!employee) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/employees/${employee.employee_id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Редактировать сотрудника</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация о сотруднике</CardTitle>
          <CardDescription>Редактирование данных сотрудника</CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeForm employee={employee} />
        </CardContent>
      </Card>
    </div>
  )
}
