import React, { useEffect, useState } from "react";
import api from "../api.js";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await api.get("/categories");
    setCategories(res.data);
  }

  async function addCategory(e) {
    e.preventDefault();
    await api.post("/categories", { name: newName });
    setNewName("");
    load();
  }

  async function updateCategory(id) {
    await api.put(`/categories/${id}`, { name: editName });
    setEditId(null);
    setEditName("");
    load();
  }

  async function deleteCategory(id) {
    if (!window.confirm("Delete this category?")) return;
    await api.delete(`/categories/${id}`);
    load();
  }

  if (user.role !== "admin") {
    return <p className="text-gray-600">You do not have access to manage categories.</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Manage Categories</h2>

      <form onSubmit={addCategory} className="flex space-x-2 mb-4">
        <input
          className="border p-2 rounded flex-1"
          placeholder="New Category"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </form>

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-2">
                  {editId === c.id ? (
                    <input
                      className="border p-1 rounded"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  ) : (
                    c.name
                  )}
                </td>
                <td className="px-4 py-2 space-x-2">
                  {editId === c.id ? (
                    <button
                      className="px-2 py-1 bg-green-600 text-white rounded"
                      onClick={() => updateCategory(c.id)}
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      className="px-2 py-1 bg-amber-600 text-white rounded"
                      onClick={() => {
                        setEditId(c.id);
                        setEditName(c.name);
                      }}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    className="px-2 py-1 bg-red-600 text-white rounded"
                    onClick={() => deleteCategory(c.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

