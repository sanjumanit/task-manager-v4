// frontend/src/pages/ChangePassword.jsx
import React, { useState } from 'react';
import api from '../api.js';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState(null);

  const submit = async (e) => {
  e.preventDefault();
  setStatus(null);

  if (!oldPassword || !newPassword) {
    setStatus({ type: 'error', message: 'Both fields are required' });
    return;
  }

  try {
    const res = await api.put('/users/me/password', {
      oldPassword,
      newPassword,   // ✅ must match backend field name
    });
    setStatus({ type: 'success', message: res.data?.message || 'Password changed' });
    setOldPassword('');
    setNewPassword('');
  } catch (err) {
    console.error(err);
    setStatus({
      type: 'error',
      message: err.response?.data?.message || 'Error changing password',
    });
  }
};
  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold mb-4">Change Password</h2>

      {status && (
        <div className={`p-3 mb-4 rounded ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={submit} className="bg-white shadow p-4 rounded space-y-3">
        <div>
          <label className="text-sm">Old password</label>
          <input type="password" className="w-full border p-2 rounded" value={oldPassword} onChange={e=>setOldPassword(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm">New password</label>
          <input type="password" className="w-full border p-2 rounded" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Change Password</button>
      </form>
    </div>
  );
}

