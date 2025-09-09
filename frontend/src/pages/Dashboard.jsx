import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiClock, FiFlag, FiFolder } from 'react-icons/fi';
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

  // Utility: badge color classes
  const statusColor = status => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inprogress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const priorityColor = priority => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FiFolder /> Dashboard
        </h2>
        <div className="text-gray-600">
          Welcome back,{" "}
          <span className="font-semibold">{user?.name || user?.email}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Tasks by Status */}
        <div className="bg-white shadow p-4 rounded">
          <h3 className="font-semibold text-sm text-gray-500 flex items-center gap-2">
            <FiCheckCircle /> Tasks (by Status)
          </h3>
          <ul className="mt-2 space-y-1">
            {data.statusCounts.map(s => (
              <li key={s.status} className="flex justify-between items-center">
                <span className={`capitalize px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusColor(s.status)}`}>
                  <FiClock /> {s.status}
                </span>
                <span className="font-bold">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tasks by Priority */}
        <div className="bg-white shadow p-4 rounded">
          <h3 className="font-semibold text-sm text-gray-500 flex items-center gap-2">
            <FiFlag /> Tasks (by Priority)
          </h3>
          <ul className="mt-2 space-y-1">
            {data.priorityCounts.map(p => (
              <li key={p.priority} className="flex justify-between items-center">
                <span className={`capitalize px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${priorityColor(p.priority)}`}>
                  <FiFlag /> {p.priority}
                </span>
                <span className="font-bold">{p.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tasks by Category */}
        <div className="bg-white shadow p-4 rounded">
          <h3 className="font-semibold text-sm text-gray-500 flex items-center gap-2">
            <FiFolder /> Tasks (by Category)
          </h3>
          <ul className="mt-2 space-y-1">
            {data.categoryCounts.map(c => (
              <li key={c.category || 'uncategorized'} className="flex justify-between items-center">
                <span className="capitalize flex items-center gap-1">
                  <FiFolder /> {c.category || 'uncategorized'}
                </span>
                <span className="font-bold">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Task Status by Category */}
        <div className="bg-white shadow p-4 rounded col-span-1 md:col-span-2">
          <h3 className="font-semibold text-sm text-gray-500 flex items-center gap-2">
            <FiCheckCircle /> Task Status (by Category)
          </h3>
          <div className="mt-2 space-y-4">
            {Object.entries(groupedCategoryStatus).map(([category, statuses]) => (
              <div key={category}>
                <p className="font-medium capitalize flex items-center gap-1">
                  <FiFolder /> {category}
                </p>
                <ul className="ml-4 text-sm space-y-1">
                  {Object.entries(statuses).map(([status, count]) => (
                    <li key={status} className="flex justify-between items-center">
                      <span className={`capitalize px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusColor(status)}`}>
                        <FiClock /> {status}
                      </span>
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

