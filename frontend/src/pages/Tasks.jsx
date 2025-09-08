import React, { useEffect, useState } from 'react';
import api from '../api.js';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title:'', description:'', priority:'medium', dueDate:'', assigneeId:'', category:'' });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  async function load() {
    const res = await api.get('/tasks');
    setTasks(res.data);
  }

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/tasks', { ...form, assigneeId: form.assigneeId ? Number(form.assigneeId) : null });
    setForm({ title:'', description:'', priority:'medium', dueDate:'', assigneeId:'', category:'' });
    load();
  };

  const updateStatus = async (id, status) => {
    await api.put(`/tasks/${id}/status`, { status });
    load();
  };

  const reassign = async (id) => {
    const assigneeId = prompt('New assignee user ID:');
    if (!assigneeId) return;
    await api.put(`/tasks/${id}/reassign`, { assigneeId: Number(assigneeId) });
    load();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Tasks</h2>

      {(user.role !== 'member') && (
        <div className="bg-white shadow p-4 rounded mb-6">
          <h3 className="font-semibold mb-4">Create Task</h3>
          <form onSubmit={create} className="grid md:grid-cols-2 gap-4">
            <input className="border p-2 rounded" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
            <select className="border p-2 rounded" value={form.priority} onChange={e=>setForm({...form, priority:e.target.value})}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input className="border p-2 rounded md:col-span-2" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
            <input className="border p-2 rounded" type="date" value={form.dueDate} onChange={e=>setForm({...form, dueDate:e.target.value})} />
            <input className="border p-2 rounded" placeholder="Assignee ID (optional)" value={form.assigneeId} onChange={e=>setForm({...form, assigneeId:e.target.value})} />
            <select className="border p-2 rounded" value={form.category} onChange={e=>setForm({...form, category:e.target.value})}>
              <option value="">No category</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
              <option value="improvement">Improvement</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <button className="bg-blue-600 text-white py-2 rounded md:col-span-2">Create</button>
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
            {tasks.map(t => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2">{t.id}</td>
                <td className="px-4 py-2">{t.title}</td>
                <td className="px-4 py-2 capitalize">{t.category || '-'}</td>
                <td className="px-4 py-2 capitalize">{t.priority}</td>
                <td className="px-4 py-2 capitalize">{t.status}</td>
                <td className="px-4 py-2">{t.dueDate || '-'}</td>
                <td className="px-4 py-2">{t.assigneeName || t.assigneeEmail || 'Unassigned'}</td>
                <td className="px-4 py-2 space-x-2">
                  <button className="px-2 py-1 bg-emerald-600 text-white rounded" onClick={()=>updateStatus(t.id, 'in-progress')}>Start</button>
                  <button className="px-2 py-1 bg-indigo-600 text-white rounded" onClick={()=>updateStatus(t.id, 'completed')}>Complete</button>
                  {(user.role !== 'member') && (
                    <button className="px-2 py-1 bg-amber-600 text-white rounded" onClick={()=>reassign(t.id)}>Reassign</button>
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
