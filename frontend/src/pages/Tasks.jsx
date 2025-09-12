import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api.js";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FiDownload, FiPlus, FiX } from "react-icons/fi";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
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
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    priority: "",
    assignee: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const pageSize = 10;

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const location = useLocation();
  const navigate = useNavigate();

  // Parse query params on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = { ...filters };
    ["status", "priority", "category", "assignee", "search"].forEach((key) => {
      if (params.get(key)) newFilters[key] = params.get(key);
    });
    setFilters(newFilters);
  }, [location.search]);

  useEffect(() => {
    load();
    loadCats();
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters]);

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
    setShowForm(false);
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

  // ===== Export Functions =====
  const exportXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredTasks.map((t) => ({
        Title: t.title,
        Category: t.categoryName || "-",
        Priority: t.priority,
        Status: t.status,
        Due: t.dueDate || "-",
        Assignee: t.assigneeName
          ? `${t.assigneeName} (${t.assigneeEmail})`
          : "Unassigned",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tasks");
    XLSX.writeFile(wb, "tasks.xlsx");
  };

  const exportCSV = () => {
    const csv = filteredTasks
      .map(
        (t) =>
          `"${t.title}","${t.categoryName || "-"}","${t.priority}","${t.status}","${
            t.dueDate || "-"
          }","${
            t.assigneeName ? `${t.assigneeName} (${t.assigneeEmail})` : "Unassigned"
          }"`
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const headers = ["Title", "Category", "Priority", "Status", "Due", "Assignee"];
    const data = filteredTasks.map((t) => [
      t.title,
      t.categoryName || "-",
      t.priority,
      t.status,
      t.dueDate || "-",
      t.assigneeName ? `${t.assigneeName} (${t.assigneeEmail})` : "Unassigned",
    ]);

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 20,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [52, 152, 219] },
    });

    doc.save("tasks.pdf");
  };

  const badgeColor = (type, value) => {
    const colors = {
      priority: {
        low: "bg-green-100 text-green-800",
        medium: "bg-yellow-100 text-yellow-800",
        high: "bg-red-100 text-red-800",
      },
      status: {
        open: "bg-purple-100 text-purple-800",
        pending: "bg-gray-100 text-gray-800",
        "in-progress": "bg-blue-100 text-blue-800",
        completed: "bg-green-100 text-green-800",
      },
    };
    return colors[type][value] || "bg-gray-100 text-gray-800";
  };

  const applyFilters = () => {
    let temp = [...tasks];
    if (filters.category) temp = temp.filter(t => t.categoryName === filters.category);
    if (filters.status) temp = temp.filter(t => t.status === filters.status);
    if (filters.priority) temp = temp.filter(t => t.priority === filters.priority);
    if (filters.assignee) temp = temp.filter(t => t.assigneeEmail === filters.assignee);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      temp = temp.filter(t =>
        t.title.toLowerCase().includes(s) ||
        (t.assigneeName && t.assigneeName.toLowerCase().includes(s)) ||
        (t.assigneeEmail && t.assigneeEmail.toLowerCase().includes(s))
      );
    }
    setFilteredTasks(temp);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / pageSize);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Sync filters to URL query string
  const updateQueryParams = (newFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    navigate(`/tasks?${params.toString()}`);
  };

  return (
    <div className="p-6">
      {/* Header + Create */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tasks</h2>
        {user.role !== "member" && (
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <><FiX /> Close</> : <><FiPlus /> Create Task</>}
          </button>
        )}
      </div>

      {/* Toggleable Create Task Form */}
      {showForm && user.role !== "member" && (
        <div className="bg-white shadow p-4 rounded mb-6">
          <h3 className="font-semibold mb-4">Create Task</h3>
          <form onSubmit={create} className="grid md:grid-cols-2 gap-4">
            <input className="border p-2 rounded" placeholder="Title" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} required />
            <select className="border p-2 rounded" value={form.priority} onChange={(e)=>setForm({...form,priority:e.target.value})}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <textarea className="border p-2 rounded md:col-span-2" placeholder="Description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/>
            <input className="border p-2 rounded" type="date" value={form.dueDate} onChange={(e)=>setForm({...form,dueDate:e.target.value})}/>
            <select className="border p-2 rounded" value={form.assigneeEmail} onChange={(e)=>setForm({...form,assigneeEmail:e.target.value})}>
              <option value="">Unassigned</option>
              {users.map(u=><option key={u.id} value={u.email}>{u.name} ({u.email})</option>)}
            </select>
            <select className="border p-2 rounded" value={form.categoryId} onChange={(e)=>setForm({...form,categoryId:e.target.value})}>
              <option value="">No category</option>
              {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="bg-blue-600 text-white py-2 rounded md:col-span-2 hover:bg-blue-700">Create</button>
          </form>
        </div>
      )}

      {/* Toolbar: Filters + Export */}
      <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            className="border p-2 rounded"
            placeholder="Search..."
            value={filters.search}
            onChange={e=>{
              const f = {...filters, search:e.target.value};
              setFilters(f);
              updateQueryParams(f);
            }}
          />
          <select className="border p-2 rounded" value={filters.category} onChange={e=>{
            const f = {...filters, category:e.target.value};
            setFilters(f);
            updateQueryParams(f);
          }}>
            <option value="">All Categories</option>
            {categories.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select className="border p-2 rounded" value={filters.status} onChange={e=>{
            const f = {...filters, status:e.target.value};
            setFilters(f);
            updateQueryParams(f);
          }}>
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select className="border p-2 rounded" value={filters.priority} onChange={e=>{
            const f = {...filters, priority:e.target.value};
            setFilters(f);
            updateQueryParams(f);
          }}>
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select className="border p-2 rounded" value={filters.assignee} onChange={e=>{
            const f = {...filters, assignee:e.target.value};
            setFilters(f);
            updateQueryParams(f);
          }}>
            <option value="">All Assignees</option>
            {users.map(u=><option key={u.id} value={u.email}>{u.name}</option>)}
          </select>
        </div>

        <div className="flex gap-2">
          <button onClick={exportXLSX} className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"><FiDownload /> Excel</button>
          <button onClick={exportCSV} className="flex items-center gap-1 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"><FiDownload /> CSV</button>
          <button onClick={exportPDF} className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"><FiDownload /> PDF</button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
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
            {paginatedTasks.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2">{t.title}</td>
                <td className="px-4 py-2 capitalize">{t.categoryName || "-"}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-sm capitalize ${badgeColor("priority", t.priority)}`}>
                    {t.priority}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-sm capitalize ${badgeColor("status", t.status)}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-2">{t.dueDate || "-"}</td>
                <td className="px-4 py-2">{t.assigneeName ? `${t.assigneeName} (${t.assigneeEmail})` : "Unassigned"}</td>
                <td className="px-4 py-2 flex flex-wrap gap-1">
                  <button className="px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700" onClick={()=>updateStatus(t.id,"in-progress")}>Start</button>
                  <button className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick={()=>updateStatus(t.id,"completed")}>Complete</button>
                  {user.role !== "member" && (
                    <button className="px-2 py-1 bg-amber-600 text-white rounded hover:bg-amber-700" onClick={()=>reassign(t.id)}>Reassign</button>
                  )}
                </td>
              </tr>
            ))}
            {paginatedTasks.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-4 text-gray-500 text-center">
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button disabled={currentPage===1} onClick={()=>setCurrentPage(prev=>prev-1)} className="px-3 py-1 border rounded">Prev</button>
          {Array.from({length:totalPages},(_,i)=>(
            <button key={i+1} className={`px-3 py-1 border rounded ${currentPage===i+1?"bg-gray-300":""}`} onClick={()=>setCurrentPage(i+1)}>{i+1}</button>
          ))}
          <button disabled={currentPage===totalPages} onClick={()=>setCurrentPage(prev=>prev+1)} className="px-3 py-1 border rounded">Next</button>
        </div>
      )}
    </div>
  );
}

