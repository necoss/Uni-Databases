"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import type { Employee } from "@/types/supabase"
import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"

export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [positions, setPositions] = useState<string[]>([])

  // Filter states
  const [positionFilter, setPositionFilter] = useState<string>("all")
  const [hireDateStart, setHireDateStart] = useState<Date | undefined>(undefined)
  const [hireDateEnd, setHireDateEnd] = useState<Date | undefined>(undefined)

  // Fetch unique positions for the filter
  useEffect(() => {
    async function fetchPositions() {
      const { data, error } = await supabase.from("employees").select("position")

      if (!error && data) {
        // Extract unique positions
        const uniquePositions = Array.from(new Set(data.map((item) => item.position)))
        setPositions(uniquePositions.sort())
      }
    }

    fetchPositions()
  }, [])

  useEffect(() => {
    async function fetchEmployees() {
      setLoading(true)

      // Start with the base query
      let query = supabase.from("employees").select("*")

      // Apply position filter if not "all"
      if (positionFilter !== "all") {
        query = query.eq("position", positionFilter)
      }

      // Apply hire date range filters if set
      if (hireDateStart) {
        query = query.gte("hire_date", hireDateStart.toISOString())
      }

      if (hireDateEnd) {
        query = query.lte("hire_date", hireDateEnd.toISOString())
      }

      // Execute the query with ordering
      const { data, error } = await query.order("employee_id", { ascending: true })

      if (error) {
        console.error("Error fetching employees:", error)
      } else {
        setEmployees(data || [])
      }
      setLoading(false)
    }

    fetchEmployees()
  }, [positionFilter, hireDateStart, hireDateEnd])

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "employee_id",
      header: "ID",
    },
    {
      accessorKey: "employee_name",
      header: "First Name",
    },
    {
      accessorKey: "employee_surname",
      header: "Last Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "position",
      header: "Position",
    },
    {
      accessorKey: "hire_date",
      header: "Hire Date",
      cell: ({ row }) => {
        const date = row.getValue("hire_date") as string
        return format(new Date(date), "PPP")
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const employee = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/employees/${employee.employee_id}`)}>
              View
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push(`/employees/edit/${employee.employee_id}`)}>
              Edit
            </Button>
          </div>
        )
      },
    },
  ]

  // Check if any filters are active
  const hasActiveFilters = positionFilter !== "all" || hireDateStart !== undefined || hireDateEnd !== undefined

  // Reset all filters
  const resetFilters = () => {
    setPositionFilter("all")
    setHireDateStart(undefined)
    setHireDateEnd(undefined)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Heading title={`Employees (${employees.length})`} description="Manage your employees" />
        <Button onClick={() => router.push("/employees/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />

      <div className="bg-muted/40 p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Position</label>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Hired After</label>
              <DateTimePicker date={hireDateStart} setDate={setHireDateStart} />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Hired Before</label>
              <DateTimePicker date={hireDateEnd} setDate={setHireDateEnd} />
            </div>
          </div>

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={resetFilters} className="whitespace-nowrap">
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="text-sm text-muted-foreground mr-2">Active filters:</div>
            {positionFilter !== "all" && (
              <Badge variant="outline" className="flex items-center gap-1">
                Position: {positionFilter}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setPositionFilter("all")} />
              </Badge>
            )}
            {hireDateStart && (
              <Badge variant="outline" className="flex items-center gap-1">
                After: {format(hireDateStart, "PP")}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setHireDateStart(undefined)} />
              </Badge>
            )}
            {hireDateEnd && (
              <Badge variant="outline" className="flex items-center gap-1">
                Before: {format(hireDateEnd, "PP")}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setHireDateEnd(undefined)} />
              </Badge>
            )}
          </div>
        )}
      </div>

      <DataTable columns={columns} data={employees} searchKey="employee_name" searchPlaceholder="Search employees..." />
    </div>
  )
}
