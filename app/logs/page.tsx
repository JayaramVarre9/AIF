'use client'

import { AppSidebar } from "@/components/app-sidebar"
import { Filters } from '@/components/Filters'
import { ClusterLogsTable } from '@/components/ClusterLogsTable'
import { Button } from '@/components/ui/button'

export default function LogsPage() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1  pr-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">AWS Cluster Activity Logs</h1>
          <Button variant="outline">Download CSV</Button>
        </div>
        <Filters />
        <ClusterLogsTable />
      </main>
    </div>
  )
}
