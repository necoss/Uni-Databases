import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import EmployeeForm from "../employee-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewEmployeePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/employees">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Добавить сотрудника</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация о сотруднике</CardTitle>
          <CardDescription>Введите данные нового сотрудника</CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeForm />
        </CardContent>
      </Card>
    </div>
  )
}
