"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"

interface AttendanceWithEmployee {
  attendance_id: number
  check_in: string
  check_out: string | null
  employee_id: number
  employee_name?: string
  employee_surname?: string
}

export default function AttendancesPage() {
  const router = useRouter()
  const [attendances, setAttendances] = useState<AttendanceWithEmployee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAttendances() {
      setLoading(true)
      const { data, error } = await supabase
        .from("attendances")
        .select(`
          *,
          employees (
            employee_name,
            employee_surname
          )
        `)
        .order("check_in", { ascending: false })

      if (error) {
        console.error("Error fetching attendances:", error)
      } else {
        // Transform the data to flatten the structure
        const transformedData = data.map((attendance) => ({
          ...attendance,
          employee_name: attendance.employees?.employee_name,
          employee_surname: attendance.employees?.employee_surname,
        }))
        setAttendances(transformedData || [])
      }
      setLoading(false)
    }

    fetchAttendances()
  }, [])

  const columns: ColumnDef<AttendanceWithEmployee>[] = [
    {
      accessorKey: "attendance_id",
      header: "ID",
    },
    {
      id: "employee",
      header: "Employee",
      cell: ({ row }) => {
        const employeeName = row.original.employee_name
        const employeeSurname = row.original.employee_surname

        return employeeName && employeeSurname ? `${employeeName} ${employeeSurname}` : "Unknown"
      },
    },
    {
      accessorKey: "check_in",
      header: "Check In",
      cell: ({ row }) => {
        const date = row.getValue("check_in") as string
        return format(new Date(date), "PPP HH:mm")
      },
    },
    {
      accessorKey: "check_out",
      header: "Check Out",
      cell: ({ row }) => {
        const date = row.getValue("check_out") as string | null
        return date ? format(new Date(date), "PPP HH:mm") : "Not checked out"
      },
    },
    {
      id: "duration",
      header: "Duration",
      cell: ({ row }) => {
        const checkIn = new Date(row.getValue("check_in") as string)
        const checkOutValue = row.getValue("check_out") as string | null

        if (!checkOutValue) return "In progress"

        const checkOut = new Date(checkOutValue)
        const durationMs = checkOut.getTime() - checkIn.getTime()
        const hours = Math.floor(durationMs / (1000 * 60 * 60))
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

        return `${hours}h ${minutes}m`
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const attendance = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/attendances/${attendance.attendance_id}`)}>
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/attendances/edit/${attendance.attendance_id}`)}
            >
              Edit
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Heading title={`Attendances (${attendances.length})`} description="Manage employee attendance records" />
        <Button onClick={() => router.push("/attendances/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={columns}
        data={attendances}
        searchKey="employee_name"
        searchPlaceholder="Search by employee name..."
      />
    </div>
  )
}
