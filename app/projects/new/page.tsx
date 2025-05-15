import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ProjectForm from "../project-form"

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Добавить проект</h1>

      <Card>
        <CardHeader>
          <CardTitle>Информация о проекте</CardTitle>
          <CardDescription>Введите данные нового проекта</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm />
        </CardContent>
      </Card>
    </div>
  )
}
