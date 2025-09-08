import React from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Tasks from './pages/Tasks.jsx';
import Admin from './pages/Admin.jsx';

function UserBadge() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = (user?.name || user?.email || '?').slice(0,1).toUpperCase();
  return (
    <div className="flex items-center gap-3 p-4 border-t">
      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg">{initials}</div>
      <div>
        <div className="font-semibold">{user?.name || user?.email}</div>
        <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
      </div>
    </div>
  );
}

function Shell({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();
  if (!token && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {token && (
        <aside className="w-72 bg-white shadow-md flex flex-col">
          <div className="p-6 font-bold text-xl border-b">Task System</div>
          <nav className="p-4 flex flex-col gap-2 flex-1">
            <Link className="text-gray-700 hover:bg-gray-200 p-2 rounded" to="/">Dashboard</Link>
            <Link className="text-gray-700 hover:bg-gray-200 p-2 rounded" to="/tasks">Tasks</Link>
            <Link className="text-gray-700 hover:bg-gray-200 p-2 rounded" to="/admin">Admin</Link>
          </nav>
          <div className="px-4">
            <button
              className="w-full text-red-600 hover:bg-gray-100 p-2 rounded mb-2"
              onClick={() => { localStorage.clear(); window.location.href='/login'; }}
            >Logout</button>
          </div>
          <UserBadge />
        </aside>
      )}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Shell><Login /></Shell>} />
      <Route path="/" element={<Shell><Dashboard /></Shell>} />
      <Route path="/tasks" element={<Shell><Tasks /></Shell>} />
      <Route path="/admin" element={<Shell><Admin /></Shell>} />
    </Routes>
  );
}
