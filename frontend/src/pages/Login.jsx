import React, { useState } from 'react';
import api from '../api.js';

export default function Login() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/';
    } catch (e) {
      setErr(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg p-8 rounded w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {err && <div className="text-red-600 mb-4">{err}</div>}
        <form onSubmit={submit} className="flex flex-col gap-4">
          <input className="border p-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input type="password" className="border p-2 rounded" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <button className="bg-blue-600 text-white py-2 rounded">Login</button>
        </form>
      </div>
    </div>
  );
}
