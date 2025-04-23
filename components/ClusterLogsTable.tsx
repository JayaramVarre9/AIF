// components/ClusterLogsTable.tsx
export function ClusterLogsTable() {
    return (
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Cluster Name</th>
              <th className="p-3">Event</th>
              <th className="p-3">Status</th>
              <th className="p-3">User</th>
              <th className="p-3">Region</th>
              <th className="p-3">Error Message</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 3 }).map((_, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-3">--</td>
                <td className="p-3">--</td>
                <td className="p-3">--</td>
                <td className="p-3">--</td>
                <td className="p-3">--</td>
                <td className="p-3">--</td>
                <td className="p-3">--</td>
                <td className="p-3">--</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  