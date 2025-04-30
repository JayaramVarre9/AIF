// File: app/logs/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ClusterLogsTable } from '@/components/ClusterLogsTable';

interface Cluster {
  cluster_name: string;
}

interface LogEntry {
  timestamp: number;
  message: string;
}

export default function LogsPage() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Fetch clusters
  useEffect(() => {
    const fetchClusters = async () => {
      const response = await fetch('/api/cluster/running');
      const data = await response.json();
      setClusters(data.clusters || []);
    };
    fetchClusters();
  }, []);

  // Fetch logs for selected cluster
  useEffect(() => {
    if (!selectedCluster) return;

    const fetchLogs = async () => {
      const response = await fetch(`/api/logs?log_stream_name=${selectedCluster}`);
      const data = await response.json();
      setLogs(data || []);
    };

    fetchLogs();
  }, [selectedCluster]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">AWS Cluster Activity Logs</h2>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Select onValueChange={setSelectedCluster}>
          <SelectTrigger>
            <SelectValue placeholder="Select a cluster" />
          </SelectTrigger>
          <SelectContent>
            {clusters.map((cluster, idx) => (
              <SelectItem key={idx} value={cluster.cluster_name}>
                {cluster.cluster_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input placeholder="Start date – End date" />
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
        <Button>Download CSV</Button>
      </div>

      <ClusterLogsTable logs={logs} />
    </div>
  );
}