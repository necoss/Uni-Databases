import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-4">404 - Страница не найдена</h1>
      <p className="text-lg mb-6">Извините, запрашиваемая страница не существует.</p>
      <Link href="/" className="text-blue-500 hover:underline">
        Вернуться на главную
      </Link>
    </div>
  )
}
