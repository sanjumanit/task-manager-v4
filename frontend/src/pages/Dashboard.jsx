import React, { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiFlag,
  FiFolder,
  FiActivity,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../api.js";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/reports/summary");
        setData(res.data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  if (!data) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        <FiActivity className="animate-spin mr-2" /> Loading dashboard...
      </div>
    );
  }

  // Group categoryStatusCounts into { category: { status: count } }
  const groupedCategoryStatus = {};
  data.categoryStatusCounts.forEach((row) => {
    const category = row.category || "uncategorized";
    if (!groupedCategoryStatus[category]) groupedCategoryStatus[category] = {};
    groupedCategoryStatus[category][row.status] = row.count;
  });

  // Badge colors
  const statusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inprogress":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const priorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Navigation helpers
  const goToTasks = (filterType, value) => {
    navigate(`/tasks?${filterType}=${encodeURIComponent(value)}`);
  };

  const goToTasksWithFilters = (filters) => {
    const query = new URLSearchParams(filters).toString();
    navigate(`/tasks?${query}`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
          <FiFolder /> Dashboard
        </h2>
        <div className="text-gray-600 mt-2 md:mt-0">
          Welcome back,{" "}
          <span className="font-semibold text-gray-800">
            {user?.name || user?.email}
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Tasks by Status */}
        <div className="bg-white shadow-lg p-5 rounded-xl border hover:shadow-xl transition">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
            <FiCheckCircle className="text-green-600" /> Tasks (by Status)
          </h3>
          <ul className="space-y-2">
            {data.statusCounts.map((s) => (
              <li
                key={s.status}
                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg"
                onClick={() => goToTasks("status", s.status)}
              >
                <span
                  className={`capitalize px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusColor(
                    s.status
                  )}`}
                >
                  <FiClock /> {s.status}
                </span>
                <span className="font-bold text-gray-700">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tasks by Priority */}
        <div className="bg-white shadow-lg p-5 rounded-xl border hover:shadow-xl transition">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
            <FiFlag className="text-yellow-600" /> Tasks (by Priority)
          </h3>
          <ul className="space-y-2">
            {data.priorityCounts.map((p) => (
              <li
                key={p.priority}
                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg"
                onClick={() => goToTasks("priority", p.priority)}
              >
                <span
                  className={`capitalize px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${priorityColor(
                    p.priority
                  )}`}
                >
                  <FiFlag /> {p.priority}
                </span>
                <span className="font-bold text-gray-700">{p.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tasks by Category */}
        <div className="bg-white shadow-lg p-5 rounded-xl border hover:shadow-xl transition">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
            <FiFolder className="text-purple-600" /> Tasks (by Category)
          </h3>
          <ul className="space-y-2">
            {data.categoryCounts.map((c) => (
              <li
                key={c.category || "uncategorized"}
                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg"
                onClick={() =>
                  goToTasks("category", c.category || "uncategorized")
                }
              >
                <span className="capitalize flex items-center gap-1 text-gray-700">
                  <FiFolder /> {c.category || "uncategorized"}
                </span>
                <span className="font-bold">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Task Status by Category */}
        <div className="bg-white shadow-lg p-5 rounded-xl border hover:shadow-xl transition col-span-1 md:col-span-2">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
            <FiCheckCircle className="text-blue-600" /> Task Status (by Category)
          </h3>
          <div className="space-y-5">
            {Object.entries(groupedCategoryStatus).map(
              ([category, statuses]) => (
                <div key={category}>
                  <p className="font-medium capitalize flex items-center gap-1 text-gray-800 mb-1">
                    <FiFolder className="text-purple-500" /> {category}
                  </p>
                  <ul className="ml-4 text-sm space-y-2">
                    {Object.entries(statuses).map(([status, count]) => (
                      <li
                        key={status}
                        className="flex justify-between items-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg"
                        onClick={() =>
                          goToTasksWithFilters({
                            category: category,
                            status: status,
                          })
                        }
                      >
                        <span
                          className={`capitalize px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusColor(
                            status
                          )}`}
                        >
                          <FiClock /> {status}
                        </span>
                        <span className="font-bold">{count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-sm text-gray-500 mt-4">
        {user.role === "member"
          ? "Showing your assigned tasks only."
          : "Showing all tasks."}
      </p>
    </div>
  );
}

