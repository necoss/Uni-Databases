import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getEmployeeById, getAttendancesByEmployeeId } from "@/lib/data"
import { formatDate, formatDateTime, calculateWorkHours } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Edit, CalendarDays } from "lucide-react"
import { notFound } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface EmployeePageProps {
  params: {
    id: string
  }
}

export default async function EmployeePage({ params }: EmployeePageProps) {
  const employeeId = Number.parseInt(params.id)

  if (isNaN(employeeId)) {
    notFound()
  }

  const employee = await getEmployeeById(employeeId)

  if (!employee) {
    notFound()
  }

  const attendances = await getAttendancesByEmployeeId(employeeId)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/employees">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">
          {employee.employee_surname} {employee.employee_name}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Информация о сотруднике</CardTitle>
            <CardDescription>Основные данные сотрудника</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">ФИО</dt>
                <dd>
                  {employee.employee_surname} {employee.employee_name}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd>{employee.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Должность</dt>
                <dd>{employee.position}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Дата найма</dt>
                <dd>{formatDate(employee.hire_date)}</dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/employees/${employee.employee_id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href={`/employees/${employee.employee_id}/attendances`}>
                <CalendarDays className="mr-2 h-4 w-4" />
                Посещаемость
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Посещаемость</CardTitle>
            <CardDescription>История посещаемости сотрудника</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Приход</TableHead>
                    <TableHead>Уход</TableHead>
                    <TableHead>Часы работы</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendances.length > 0 ? (
                    attendances.map((attendance) => {
                      const hoursWorked = attendance.check_out
                        ? calculateWorkHours(attendance.check_in, attendance.check_out)
                        : 0

                      return (
                        <TableRow key={attendance.attendance_id}>
                          <TableCell>{formatDate(attendance.check_in)}</TableCell>
                          <TableCell>{formatDateTime(attendance.check_in)}</TableCell>
                          <TableCell>
                            {attendance.check_out ? formatDateTime(attendance.check_out) : "Не отмечен"}
                          </TableCell>
                          <TableCell>{attendance.check_out ? `${hoursWorked} ч.` : "-"}</TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Нет данных о посещаемости.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
