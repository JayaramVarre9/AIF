import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const type = searchParams.get("type") // cluster, ec2, user
    const id = searchParams.get("id") // optional: filter by resource ID
    const start = searchParams.get("start") // optional: ISO date string
    const end = searchParams.get("end") // optional: ISO date string

    if (!type) {
      return NextResponse.json(
        { error: "Missing required query parameter: type" },
        { status: 400 }
      )
    }

    // Simulated logs
    const logs = {
      cluster: [
        {
          id: "c1",
          cluster_name: "aif-demo1",
          action: "Deployed",
          timestamp: "2025-04-17T09:32:00Z",
        },
        {
          id: "c2",
          cluster_name: "aif-demo2",
          action: "Deleted",
          timestamp: "2025-04-15T18:10:00Z",
        },
      ],
      ec2: [
        {
          id: "e1",
          instance_id: "i-123456789",
          action: "Started",
          timestamp: "2025-04-16T16:00:00Z",
        },
        {
          id: "e2",
          instance_id: "i-987654321",
          action: "Stopped",
          timestamp: "2025-04-14T12:30:00Z",
        },
      ],
      user: [
        {
          id: "u1",
          username: "newuser1",
          action: "Added to aif-demo1",
          role: "admin",
          timestamp: "2025-04-16T14:45:00Z",
        },
      ],
    }

    const allLogs = logs[type as keyof typeof logs] || []

    // Filter by id (if provided)
    let filteredLogs = id ? allLogs.filter((log) => log.id === id) : allLogs

    // Filter by date range
    if (start || end) {
      const startDate = start ? new Date(start) : null
      const endDate = end ? new Date(end) : null

      filteredLogs = filteredLogs.filter((log) => {
        const logDate = new Date(log.timestamp)
        if (startDate && logDate < startDate) return false
        if (endDate && logDate > endDate) return false
        return true
      })
    }

    return NextResponse.json({ type, logs: filteredLogs })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch logs", details: (error as Error).message },
      { status: 500 }
    )
  }
}
