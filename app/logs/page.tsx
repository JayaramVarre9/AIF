// File: app/logs/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ClusterLogsTable } from '@/components/ClusterLogsTable';

interface Cluster {
  cluster_name: string;
}

interface LogEntry {
  timestamp: number;
  message: string;
}

export default function LogsPage() {
  //const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [clusters] = useState([{ cluster_name: 'ai-flex-shreyas' }]);
  // Fetch clusters
  /*useEffect(() => {
    const fetchClusters = async () => {
      const response = await fetch('/api/clusters/running');
      const data = await response.json();
      setClusters(data.clusters || []);
    };
    fetchClusters();
  }, []);*/

  // Fetch logs for selected cluster
  useEffect(() => {
    if (!selectedCluster) return;

    const fetchLogs = async () => {
      console.log('Selected cluster:', selectedCluster);
      const response = await fetch(`/api/logs?log_stream_name=${selectedCluster}`);
      const data = await response.json();
      console.log('API response:', data);
      console.log('Logs:', data.logs);
      setLogs(data.logs || []);
    };

    fetchLogs();
  }, [selectedCluster]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">AWS Cluster Activity Logs</h2>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <select
          className="border rounded px-3 py-2"
          value={selectedCluster}
          onChange={(e) => setSelectedCluster(e.target.value)}
        >
          <option value="">Select a cluster</option>
          {clusters.map((cluster, idx) => (
            <option key={idx} value={cluster.cluster_name}>
              {cluster.cluster_name}
            </option>
          ))}
        </select>
        <Input placeholder="Start date – End date" />
        <select className="border rounded px-3 py-2">
          <option value="all">Event type</option>
        </select>
        <select className="border rounded px-3 py-2">
          <option value="all">Status</option>
        </select>
        <Button
          onClick={() => {
            if (logs.length === 0) return;

            const headers = ['timestamp', 'message'];
            const csvRows = [
              headers.join(','),
              ...logs.map(log =>
                [`"${new Date(log.timestamp).toLocaleString()}"`, `"${log.message.replace(/"/g, '""')}"`].join(',')
              ),
            ];

            const csvContent = csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `logs_${selectedCluster || 'all'}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }}
        >
          Download CSV
        </Button>
      </div>

      <ClusterLogsTable logs={logs} clusterName={selectedCluster || 'ai-flex-shreyas'} />
    </div>
  );
}
