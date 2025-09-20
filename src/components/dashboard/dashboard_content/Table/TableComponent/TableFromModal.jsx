// src/pages/TableComponent/TableFormModal.jsx
import React, { useState } from "react";
import axios from "axios";

// ✅ make sure your .env has: VITE_API_BASE_URL=http://localhost:5000/api
const API_BASE = import.meta.env.VITE_API_REACT_APP_API_BASE_URL;

export default function TableFormModal({ onClose, onSave, editingTable }) {
  const [tableNumber, setTableNumber] = useState(
    editingTable ? editingTable.tableNumber : ""
  );
  const [capacity, setCapacity] = useState(
    editingTable ? editingTable.capacity : 4
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("No token found in sessionStorage — please log in.");
      }

      const headers = { Authorization: `Bearer ${token}` };

      if (editingTable) {
        // ✅ PUT /api/table/edit/:id
        await axios.put(
          `${API_BASE}/table/edit/${editingTable._id}`,
          { tableNumber, capacity },
          { headers }
        );
      } else {
        // ✅ POST /api/table/addTables
        await axios.post(
          `${API_BASE}/table/addTables`,
          { tableNumber, capacity },
          { headers }
        );
      }

      onSave();
      onClose();
    } catch (err) {
      console.error("Error saving table:", err.response?.data?.message || "Failed to save table. Please try again or log in again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Transparent blurred backdrop */}
      <div
        className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden relative z-10 mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingTable ? "Edit Table" : "Add New Table"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="tableNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Table Number
              </label>
              <input
                type="text"
                id="tableNumber"
                placeholder="Enter table number/name"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="capacity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Seating Capacity
              </label>
              <input
                type="number"
                id="capacity"
                min="1"
                max="20"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
            >
              {loading
                ? "Processing..."
                : editingTable
                ? "Update Table"
                : "Add Table"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
