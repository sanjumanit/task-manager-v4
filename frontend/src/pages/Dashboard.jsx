import React, { useEffect, useState } from 'react';
import api from '../api.js';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/reports/summary');
        setData(res.data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  if (!data) return <div>Loading...</div>;

  // Group categoryStatusCounts into { category: { status: count } }
  const groupedCategoryStatus = {};
  data.categoryStatusCounts.forEach(row => {
    const category = row.category || 'uncategorized';
    if (!groupedCategoryStatus[category]) groupedCategoryStatus[category] = {};
    groupedCategoryStatus[category][row.status] = row.count;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="text-gray-600">
          Welcome back,{" "}
          <span className="font-semibold">{user?.name || user?.email}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white shadow p-4 rounded">
          <h3 className="font-semibold text-sm text-gray-500">Tasks (by Status)</h3>
          <ul className="mt-2 space-y-1">
            {data.statusCounts.map(s => (
              <li key={s.status} className="flex justify-between">
                <span className="capitalize">{s.status}</span>
                <span className="font-bold">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white shadow p-4 rounded">
          <h3 className="font-semibold text-sm text-gray-500">Tasks (by Priority)</h3>
          <ul className="mt-2 space-y-1">
            {data.priorityCounts.map(p => (
              <li key={p.priority} className="flex justify-between">
                <span className="capitalize">{p.priority}</span>
                <span className="font-bold">{p.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white shadow p-4 rounded">
          <h3 className="font-semibold text-sm text-gray-500">Tasks (by Category)</h3>
          <ul className="mt-2 space-y-1">
            {data.categoryCounts.map(c => (
              <li key={c.category || 'uncategorized'} className="flex justify-between">
                <span className="capitalize">{c.category || 'uncategorized'}</span>
                <span className="font-bold">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white shadow p-4 rounded col-span-1 md:col-span-2">
          <h3 className="font-semibold text-sm text-gray-500">
            Task Status (by Category)
          </h3>
          <div className="mt-2 space-y-4">
            {Object.entries(groupedCategoryStatus).map(([category, statuses]) => (
              <div key={category}>
                <p className="font-medium capitalize">{category}</p>
                <ul className="ml-4 text-sm space-y-1">
                  {Object.entries(statuses).map(([status, count]) => (
                    <li key={status} className="flex justify-between">
                      <span className="capitalize">{status}</span>
                      <span className="font-bold">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        {user.role === "member"
          ? "Showing your assigned tasks only."
          : "Showing all tasks."}
      </p>
    </div>
  );
}

