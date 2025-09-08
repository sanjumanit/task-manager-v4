import React, { useEffect, useState } from 'react';
import api from '../api.js';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'member' });
  const [categories, setCategories] = useState([]);
  const [catName, setCatName] = useState('');

  async function loadUsers() {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (e) { console.error(e); }
  }

  async function loadCategories() {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (e) { console.error(e); }
  }

  useEffect(()=>{ loadUsers(); loadCategories(); }, []);

  const createUser = async (e) => {
    e.preventDefault();
    await api.post('/users', form);
    setForm({ name:'', email:'', password:'', role:'member' });
    loadUsers();
  };

  const createCat = async (e) => {
    e.preventDefault();
    if (!catName) return;
    await api.post('/categories', { name: catName });
    setCatName('');
    loadCategories();
  };

  const deleteCat = async (id) => {
    if (!confirm('Delete category?')) return;
    await api.delete(`/categories/${id}`);
    loadCategories();
  };

  const editCat = async (id) => {
    const name = prompt('New category name:');
    if (!name) return;
    await api.put(`/categories/${id}`, { name });
    loadCategories();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin</h2>

  <div className="bg-white shadow p-4 rounded mb-6">
    <h3 className="font-semibold mb-4">Create User</h3>
    <form onSubmit={createUser} className="grid md:grid-cols-4 gap-4">
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

  <div className="bg-white shadow p-4 rounded mb-6">
    <h3 className="font-semibold mb-4">Manage Categories (admin only)</h3>
    <form onSubmit={createCat} className="flex gap-2 mb-4">
      <input className="border p-2 rounded flex-1" placeholder="Category name" value={catName} onChange={e=>setCatName(e.target.value)} />
      <button className="bg-green-600 text-white py-2 px-4 rounded">Add</button>
    </form>
    <div className="space-y-2">
      {categories.map(c => (
        <div key={c.id} className="flex items-center justify-between border p-2 rounded">
          <div className="capitalize">{c.name}</div>
          <div className="flex gap-2">
            <button className="text-sm text-blue-600" onClick={()=>editCat(c.id)}>Edit</button>
            <button className="text-sm text-red-600" onClick={()=>deleteCat(c.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
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
