import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Интерфейс PostgreSQL",
  description: "Интерфейс для работы с PostgreSQL базой данных",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <div className="container mx-auto px-4 py-8">{children}</div>
      </body>
    </html>
  )
}
