import React, { useEffect, useState } from 'react';
import api from '../api.js';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'member' });

  async function load() {
    const res = await api.get('/users');
    setUsers(res.data);
  }
  useEffect(()=>{ load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/users', form);
    setForm({ name:'', email:'', password:'', role:'member' });
    load();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin</h2>

      <div className="bg-white shadow p-4 rounded mb-6">
        <h3 className="font-semibold mb-4">Create User</h3>
        <form onSubmit={create} className="grid md:grid-cols-4 gap-4">
          <input className="border p-2 rounded" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
          <input className="border p-2 rounded" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
          <input type="password" className="border p-2 rounded" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required />
          <select className="border p-2 rounded" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
            <option value="admin">admin</option>
            <option value="manager">manager</option>
            <option value="member">member</option>
          </select>
          <button className="bg-blue-600 text-white py-2 rounded md:col-span-4">Create</button>
        </form>
      </div>

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{u.id}</td>
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
