import React, { useEffect, useState } from "react";
import api from "../api.js";
import { FiEdit, FiTrash2, FiPlus, FiSave, FiX } from "react-icons/fi";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [showForm, setShowForm] = useState(false);

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
    setShowForm(false);
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
    return (
      <p className="text-gray-600 p-4">
        You do not have access to manage categories.
      </p>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Categories</h2>
        <button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <><FiX /> Cancel</> : <><FiPlus /> Add Category</>}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <form
            onSubmit={addCategory}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              className="border p-2 rounded flex-1"
              placeholder="Category name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <button className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
              <FiSave /> Save
            </button>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div
            key={c.id}
            className="bg-white shadow rounded-lg p-4 flex justify-between items-center"
          >
            {editId === c.id ? (
              <input
                className="border p-2 rounded flex-1 mr-2"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            ) : (
              <p className="text-gray-800 font-medium">{c.name}</p>
            )}

            <div className="flex gap-2">
              {editId === c.id ? (
                <button
                  className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => updateCategory(c.id)}
                >
                  <FiSave />
                </button>
              ) : (
                <button
                  className="p-2 bg-amber-500 text-white rounded hover:bg-amber-600"
                  onClick={() => {
                    setEditId(c.id);
                    setEditName(c.name);
                  }}
                >
                  <FiEdit />
                </button>
              )}
              <button
                className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => deleteCategory(c.id)}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

