// components/Filters.tsx
export function Filters() {
    return (
      <div className="flex gap-4 mb-6">
        <input type="text" placeholder="Cluster name / ID" className="border p-2 rounded w-60" />
        <input type="text" placeholder="Start date– End date" className="border p-2 rounded w-60" />
        <select className="border p-2 rounded w-40">
          <option>Event type</option>
        </select>
        <select className="border p-2 rounded w-40">
          <option>Status</option>
        </select>
      </div>
    )
  }
  