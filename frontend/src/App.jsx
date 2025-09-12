import React from "react";
import { Routes, Route, Navigate, useLocation, Link, useMatch } from "react-router-dom";
import {
  FiHome,
  FiList,
  FiUsers,
  FiTag,
  FiLogOut,
  FiChevronDown,
  FiKey,
} from "react-icons/fi";

import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tasks from "./pages/Tasks.jsx";
import Admin from "./pages/Admin.jsx";
import Categories from "./pages/Categories.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";

// -------- User Menu in Header --------
function UserMenu() {
  const [open, setOpen] = React.useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = (user?.name || user?.email || "?").slice(0, 1).toUpperCase();

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
        onClick={() => setOpen(!open)}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center text-lg font-semibold shadow">
          {initials}
        </div>
        <span className="font-medium">{user?.name || user?.email}</span>
        <FiChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-lg border z-50 overflow-hidden">
          <div className="px-4 py-3 text-sm text-gray-600 border-b bg-gray-50 capitalize">
            Role: <span className="font-medium">{user?.role}</span>
          </div>

          <Link
            to="/change-password"
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition"
            onClick={() => setOpen(false)}
          >
            <FiKey /> Change Password
          </Link>

          <button
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            <FiLogOut /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

// -------- Sidebar with active links --------
function SidebarLink({ to, icon: Icon, children }) {
  const match = useMatch(to);
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2 rounded-md font-medium transition ${
        match ? "bg-indigo-100 text-indigo-700" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <Icon /> {children}
    </Link>
  );
}

function Shell({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token && location.pathname !== "/" && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {token && (
        <aside className="w-72 bg-white shadow-xl flex flex-col border-r">
          <div className="p-6 font-extrabold text-2xl text-indigo-600 border-b">
            Task Manager
          </div>
          <nav className="p-4 flex flex-col gap-2 flex-1">
            <SidebarLink to="/dashboard" icon={FiHome}>
              Dashboard
            </SidebarLink>
            <SidebarLink to="/tasks" icon={FiList}>
              Tasks
            </SidebarLink>
            {(user?.role === "admin" || user?.role === "manager") && (
              <SidebarLink to="/admin" icon={FiUsers}>
                Users
              </SidebarLink>
            )}
            {user?.role === "admin" && (
              <SidebarLink to="/categories" icon={FiTag}>
                Categories
              </SidebarLink>
            )}
          </nav>
        </aside>
      )}

      <div className="flex-1 flex flex-col">
        {token && (
          <header className="flex justify-end items-center bg-white shadow-md px-6 py-3 sticky top-0 z-10">
            <UserMenu />
          </header>
        )}
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}

// -------- App Routes --------
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/dashboard" element={<Shell><Dashboard /></Shell>} />
      <Route path="/tasks" element={<Shell><Tasks /></Shell>} />
      <Route path="/admin" element={<Shell><Admin /></Shell>} />
      <Route path="/categories" element={<Shell><Categories /></Shell>} />
      <Route path="/change-password" element={<Shell><ChangePassword /></Shell>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

