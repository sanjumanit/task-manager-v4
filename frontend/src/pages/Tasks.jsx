import React, { useEffect, useState } from "react";
import api from "../api.js";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    assigneeEmail: "",
    categoryId: "",
  });
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  async function load() {
    const res = await api.get("/tasks");
    setTasks(res.data);
  }

  async function loadCats() {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadUsers() {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    load();
    loadCats();
    loadUsers();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post("/tasks", {
      ...form,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
    });
    setForm({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      assigneeEmail: "",
      categoryId: "",
    });
    load();
  };

  const updateStatus = async (id, status) => {
    await api.put(`/tasks/${id}/status`, { status });
    load();
  };

  const reassign = async (id) => {
    const assigneeEmail = prompt("Enter new assignee email:");
    if (!assigneeEmail) return;
    await api.put(`/tasks/${id}/reassign`, { assigneeEmail });
    load();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Tasks</h2>

      {user.role !== "member" && (
        <div className="bg-white shadow p-4 rounded mb-6">
          <h3 className="font-semibold mb-4">Create Task</h3>
          <form onSubmit={create} className="grid md:grid-cols-2 gap-4">
            <input
              className="border p-2 rounded"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <select
              className="border p-2 rounded"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              className="border p-2 rounded md:col-span-2"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <input
              className="border p-2 rounded"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
            <select
              className="border p-2 rounded"
              value={form.assigneeEmail}
              onChange={(e) =>
                setForm({ ...form, assigneeEmail: e.target.value })
              }
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.email}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            <select
              className="border p-2 rounded"
              value={form.categoryId}
              onChange={(e) =>
                setForm({ ...form, categoryId: e.target.value })
              }
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button className="bg-blue-600 text-white py-2 rounded md:col-span-2">
              Create
            </button>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Priority</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Due</th>
              <th className="px-4 py-2 text-left">Assignee</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2">{t.id}</td>
                <td className="px-4 py-2">{t.title}</td>
                <td className="px-4 py-2 capitalize">
                  {t.categoryName || "-"}
                </td>
                <td className="px-4 py-2 capitalize">{t.priority}</td>
                <td className="px-4 py-2 capitalize">{t.status}</td>
                <td className="px-4 py-2">{t.dueDate || "-"}</td>
                <td className="px-4 py-2">
                  {t.assigneeName
                    ? `${t.assigneeName} (${t.assigneeEmail})`
                    : "Unassigned"}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    className="px-2 py-1 bg-emerald-600 text-white rounded"
                    onClick={() => updateStatus(t.id, "in-progress")}
                  >
                    Start
                  </button>
                  <button
                    className="px-2 py-1 bg-indigo-600 text-white rounded"
                    onClick={() => updateStatus(t.id, "completed")}
                  >
                    Complete
                  </button>
                  {user.role !== "member" && (
                    <button
                      className="px-2 py-1 bg-amber-600 text-white rounded"
                      onClick={() => reassign(t.id)}
                    >
                      Reassign
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

