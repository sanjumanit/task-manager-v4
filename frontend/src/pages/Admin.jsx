import React, { useEffect, useState } from 'react';
import api from '../api.js';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'member' });

  // get logged-in user info from localStorage (you may use context instead if you already have it)
  const currentUser = JSON.parse(localStorage.getItem("user"));

  async function loadUsers() {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (e) { console.error(e); }
  }

  useEffect(()=>{ loadUsers(); }, []);

  const createUser = async (e) => {
    e.preventDefault();
    await api.post('/users', form);
    setForm({ name:'', email:'', password:'', role:'member' });
    loadUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      alert("User deleted");
      loadUsers();
    } catch (e) {
      alert("Error deleting user");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin - Manage Users</h2>

      {/* Create User */}
      <div className="bg-white shadow p-4 rounded mb-6">
        <h3 className="font-semibold mb-4">Create User</h3>
        <form onSubmit={createUser} className="grid md:grid-cols-4 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Name"
            value={form.name}
            onChange={e=>setForm({...form, name:e.target.value})}
            required
          />
          <input
            className="border p-2 rounded"
            placeholder="Email"
            value={form.email}
            onChange={e=>setForm({...form, email:e.target.value})}
            required
          />
          <input
            type="password"
            className="border p-2 rounded"
            placeholder="Password"
            value={form.password}
            onChange={e=>setForm({...form, password:e.target.value})}
            required
          />
          <select
            className="border p-2 rounded"
            value={form.role}
            onChange={e=>setForm({...form, role:e.target.value})}
          >
            <option value="admin">admin</option>
            <option value="manager">manager</option>
            <option value="member">member</option>
          </select>
          <button className="bg-blue-600 text-white py-2 rounded md:col-span-4">
            Create
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.role}</td>
                <td className="px-4 py-2 space-x-2">
                  {/* Show Delete button only if logged-in user is admin or manager */}
                  {/* {(currentUser?.role === "admin" || currentUser?.role === "manager") && ( */}
                  {(currentUser?.role === "admin") && (
                    <button
                      className="text-red-600 text-sm"
                      onClick={() => deleteUser(u.id)}
                    >
                      Delete
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

