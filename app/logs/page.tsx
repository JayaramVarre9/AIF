'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ClusterLogsTable } from '@/components/ClusterLogsTable';

interface LogEntry {
  timestamp: number;
  message: string;
  status?: string;
  event_type?: string;
}

export default function LogsPage() {
  const [selectedCluster, setSelectedCluster] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEventType, setSelectedEventType] = useState('deploy');
  const [startTime, setStartTime] = useState('');
  const [endTime] = useState('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false); // loading state

  const fetchLogs = async () => {
    if (!selectedCluster || !selectedEventType) return;

    setLoading(true);
    try {
      console.log('Refreshing logs for:', selectedCluster, selectedEventType);

      const response = await fetch(
        `/api/logs?log_stream_name=${selectedCluster}&log_type=${selectedEventType}`
      );
      if (!response.ok) {
        console.error('Fetch failed:', await response.text());
        return;
      }

      const data = await response.json();
      const enhancedLogs = (data.logs || []).map((log: LogEntry) => {
        const hasFailed = /\bfailed=1\b/i.test(log.message);
        const hasPlayRecap = /PLAY RECAP/i.test(log.message);
        const isError = hasFailed && hasPlayRecap;
        const status = isError ? 'error' : 'success';

        return {
          ...log,
          status,
          event_type: selectedEventType,
        };
      });

      setLogs(enhancedLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedCluster, selectedEventType]);

  const filteredLogs = logs.filter((log) => {
    const inStatus = selectedStatus === 'all' || log.status === selectedStatus;
    const inEvent =
      selectedEventType === 'deploy' || log.event_type === selectedEventType;
    const inTime =
      (!startTime || log.timestamp >= new Date(startTime).getTime()) &&
      (!endTime || log.timestamp <= new Date(endTime).getTime());
    const inSearch =
      !searchText || log.message.toLowerCase().includes(searchText.toLowerCase());

    return inStatus && inEvent && inTime && inSearch;
  });

  return (
    <div className="p-6">
      {/* Top Header with Refresh Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">AWS Cluster Activity Logs</h2>
        <Button onClick={fetchLogs} disabled={loading}>
          🔄 {loading ? 'Refreshing...' : 'Refresh Logs'}
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        {/* Cluster Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Cluster Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter cluster name"
            className="border rounded px-3 py-2"
            value={selectedCluster}
            onChange={(e) => setSelectedCluster(e.target.value)}
          />
        </div>

        {/* Event Type */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Event Type <span className="text-red-500">*</span>
          </label>
          <select
            className="border rounded px-3 py-2"
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
          >
            <option value="deploy">Deploy</option>
            <option value="delete">Delete</option>
          </select>
        </div>

        {/* Start Time */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Start Time
          </label>
          <input
            type="datetime-local"
            className="border rounded px-3 py-2"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        {/* Status */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            className="border rounded px-3 py-2"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Status</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </select>
        </div>

        {/* Search */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search log message"
            className="border rounded px-3 py-2"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* Download Button Only */}
        <div className="flex items-end">
          <Button
            onClick={() => {
              if (logs.length === 0) return;

              const headers = ['timestamp', 'message'];
              const csvRows = [
                headers.join(','),
                ...logs.map((log) =>
                  [
                    `"${new Date(log.timestamp).toLocaleString()}"`,
                    `"${log.message.replace(/"/g, '""')}"`,
                  ].join(',')
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
            ⬇ Download CSV
          </Button>
        </div>
      </div>

      {/* Loader or Logs Table */}
      {loading ? (
        <div className="text-center text-gray-600 py-12 text-lg font-medium">
          🔄 Loading logs, please wait...
        </div>
      ) : (
        <ClusterLogsTable
          logs={filteredLogs}
          clusterName={selectedCluster}
          event={selectedEventType}
        />
      )}
    </div>
  );
}
