import { useState } from 'react';

interface LogEntry {
  timestamp: number;
  message: string;
  status?: string;
}

interface ClusterLogsTableProps {
  logs: LogEntry[];
  clusterName: string;
}

export function ClusterLogsTable({ logs, clusterName }: ClusterLogsTableProps) {
  const [openMessage, setOpenMessage] = useState<string | null>(null);

  return (
    <>
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Cluster Name</th>
              <th className="p-3">Status</th>
              <th className="p-3">Log Message</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log, idx) => (
                <tr
                  key={idx}
                  className={`border-b ${log.status === 'error' ? 'bg-red-100' : ''}`}
                >
                  <td className="p-3">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3">{clusterName}</td>
                  <td className={`p-3 font-semibold ${log.status === 'error' ? 'text-red-700' : 'text-green-700'}`}>
                    {log.status}
                  </td>
                  <td
                    className="p-3 cursor-pointer text-blue-600 hover:underline max-w-xs truncate"
                    title="Click to view full message"
                    onClick={() => setOpenMessage(log.message)}
                  >
                    {log.message.length > 100
                      ? log.message.slice(0, 100) + '...'
                      : log.message}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-3 text-center text-gray-500">
                  No logs available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup Modal for Full Message */}
      {openMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h3 className="text-lg font-semibold mb-2">Full Log Message</h3>
            <pre className="whitespace-pre-wrap text-sm max-h-96 overflow-auto">{openMessage}</pre>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setOpenMessage(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
