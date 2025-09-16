import React, { useEffect, useState } from "react";
import api from "../api.js";
import { FiCheckCircle, FiXCircle, FiTrash2, FiKey } from "react-icons/fi";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [resettingUser, setResettingUser] = useState(null);
  const [resetPassword, setResetPassword] = useState("");
  const [status, setStatus] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  async function loadUsers() {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/users", form);
      setStatus({ type: "success", message: res.data.message || "User created successfully" });
      setForm({ name: "", email: "", password: "", role: "member" });
      loadUsers();
    } catch (e) {
      console.error("Create user error:", e);
      setStatus({
        type: "error",
        message: e.response?.data?.message || "Error creating user",
      });
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      setStatus({ type: "success", message: "User deleted successfully" });
      loadUsers();
    } catch (e) {
      setStatus({ type: "error", message: "Error deleting user" });
    }
  };

  const doResetPassword = async (id) => {
    if (!resetPassword) {
      setStatus({ type: "error", message: "Password required" });
      return;
    }
    try {
      const res = await api.put(`/users/${id}/password`, { newPassword: resetPassword });
      setStatus({ type: "success", message: res.data.message });
      setResettingUser(null);
      setResetPassword("");
    } catch (e) {
      console.error(e);
      setStatus({
        type: "error",
        message: e.response?.data?.message || "Error resetting password",
      });
    }
  };

  const roleBadge = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-700",
      manager: "bg-yellow-100 text-yellow-700",
      member: "bg-green-100 text-green-700",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[role]}`}
      >
        {role}
      </span>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">👥 User Management</h2>

      {/* Create User */}
      <div className="bg-white shadow-md p-6 rounded-lg mb-6">
        <h3 className="font-semibold mb-4 text-lg">➕ Create New User</h3>
        <form onSubmit={createUser} className="grid md:grid-cols-5 gap-4">
          <input
            className="border p-2 rounded focus:ring-2 focus:ring-indigo-400"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="border p-2 rounded focus:ring-2 focus:ring-indigo-400"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            className="border p-2 rounded focus:ring-2 focus:ring-indigo-400"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <select
            className="border p-2 rounded focus:ring-2 focus:ring-indigo-400"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="member">Member</option>
          </select>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded transition">
            Create User
          </button>
        </form>
      </div>

      {/* Status messages */}
      {status && (
        <div
          className={`flex items-center gap-2 p-3 mb-4 rounded-md ${
            status.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status.type === "success" ? (
            <FiCheckCircle className="text-lg" />
          ) : (
            <FiXCircle className="text-lg" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Role
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr
                key={u.id}
                className={`border-t ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{roleBadge(u.role)}</td>
                <td className="px-4 py-2 space-x-2">
                  {(currentUser?.role === "admin" || currentUser?.role === "manager") && (
                    <>
                      {resettingUser === u.id ? (
                        <div className="flex space-x-2 items-center">
                          <input
                            type="password"
                            placeholder="New Password"
                            className="border p-1 rounded text-sm"
                            value={resetPassword}
                            onChange={(e) => setResetPassword(e.target.value)}
                          />
                          <button
                            onClick={() => doResetPassword(u.id)}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                          >
                            <FiCheckCircle /> Save
                          </button>
                          <button
                            onClick={() => setResettingUser(null)}
                            className="bg-gray-300 px-2 py-1 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="text-indigo-600 hover:underline text-sm flex items-center gap-1"
                          onClick={() => setResettingUser(u.id)}
                        >
                          <FiKey /> Reset Password
                        </button>
                      )}
                    </>
                  )}

                  {currentUser?.role === "admin" && (
                    <button
                      className="text-red-600 hover:underline text-sm flex items-center gap-1"
                      onClick={() => deleteUser(u.id)}
                    >
                      <FiTrash2 /> Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-500 italic"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

