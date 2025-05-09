// File: app/logs/page.tsx
'use client';

import { useEffect, useState } from 'react';
//import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ClusterLogsTable } from '@/components/ClusterLogsTable';

interface Cluster {
  cluster_name: string;
}

interface LogEntry {
  timestamp: number;
  message: string;
  status?: string;
  event_type?: string;
}

export default function LogsPage() {

  const [selectedCluster, setSelectedCluster] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [clusters] = useState<Cluster[]>([{ cluster_name: 'custo_ec2_test' }]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  useEffect(() => {
    if (!selectedCluster) return;

    const fetchLogs = async () => {
      console.log('Selected cluster:', selectedCluster);
      const response = await fetch(`/api/logs?log_stream_name=${selectedCluster}`);
      const data = await response.json();
      console.log('API response:', data);
      console.log('Logs:', data.logs);

      let eventTypeFromFirst = 'deploy';
      if (data.logs && data.logs.length > 0) {
        const firstMsg = data.logs[0].message.toLowerCase();
        if (firstMsg.includes('delete') || firstMsg.includes('terminate')) {
          eventTypeFromFirst = 'delete';
        } else if (firstMsg.includes('deploy') || firstMsg.includes('cloudwatch agent') || firstMsg.includes('install')) {
          eventTypeFromFirst = 'deploy';
        }
      }

      const enhancedLogs = (data.logs || []).map((log: LogEntry) => {
        const isError = /\b(error|failed|exception|traceback)\b/i.test(log.message);
        const status = isError ? 'error' : 'success';

        let event_type = 'other';
        const msg = log.message.toLowerCase();
        if (msg.includes('deploy') || msg.includes('cloudwatch agent') || msg.includes('install')) {
          event_type = 'deploy';
        } else if (msg.includes('delete') || msg.includes('terminate')) {
          event_type = 'delete';
        } else {
          event_type = eventTypeFromFirst;
        }

        return {
          ...log,
          status,
          event_type,
        };
      });

      setLogs(enhancedLogs);
    };

    fetchLogs();
  }, [selectedCluster]);

  const filteredLogs = logs.filter(log => {
    const inStatus = selectedStatus === 'all' || log.status === selectedStatus;
    const inEvent = selectedEventType === 'all' || log.event_type === selectedEventType;
    const inTime =
      (!startTime || log.timestamp >= new Date(startTime).getTime()) &&
      (!endTime || log.timestamp <= new Date(endTime).getTime());

    return inStatus && inEvent && inTime;
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">AWS Cluster Activity Logs</h2>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
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

        <input
          type="datetime-local"
          className="border rounded px-3 py-2"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <input
          type="datetime-local"
          className="border rounded px-3 py-2"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />

        <select className="border rounded px-3 py-2" value={selectedEventType} onChange={(e) => setSelectedEventType(e.target.value)}>
          <option value="all">Event Type</option>
          <option value="deploy">Deploy</option>
          <option value="delete">Delete</option>
        </select>

        <select className="border rounded px-3 py-2" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
          <option value="all">Status</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
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

      <ClusterLogsTable logs={filteredLogs} clusterName={selectedCluster || 'custo_ec2_test'} />
    </div>
  );
}
