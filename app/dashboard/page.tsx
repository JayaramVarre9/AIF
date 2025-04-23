"use client"

import { useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const data = [
  { name: "00:00", cost: 5 },
  { name: "06:00", cost: 8 },
  { name: "12:00", cost: 6 },
  { name: "18:00", cost: 7 },
  { name: "24:00", cost: 4 },
]

export default function DashboardPage() {
  const [ec2Running, setEc2Running] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between px-4 border-b">
        <div className="flex items-center gap-2">
          <Separator orientation="vertical" className="h-4 mx-2" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button
          variant={ec2Running ? "destructive" : "default"}
          onClick={() => setEc2Running(!ec2Running)}
        >
          {ec2Running ? "Stop EC2 Instance" : "Start EC2 Instance"}
        </Button>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="bg-white">
            <CardContent>
              <h2 className="text-lg font-semibold mb-2">Running Cluster</h2>
              <p>Name: ai-factory-prod</p>
              <p>Status: Running</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent>
              <h2 className="text-lg font-semibold mb-2">Deploy Cluster</h2>
              <p>Quick access to deploy new clusters from template.</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent>
              <h2 className="text-lg font-semibold mb-2">Activities</h2>
              <p>Recent logs and system updates related to AI clusters.</p>
            </CardContent>
          </Card>
        </div>

        {/* Cost Chart */}
        <Card className="bg-white h-[300px]">
          <CardContent>
            <h2 className="text-lg font-semibold mb-4">
              Average Cluster Cost (Last 24 hrs)
            </h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cost" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
