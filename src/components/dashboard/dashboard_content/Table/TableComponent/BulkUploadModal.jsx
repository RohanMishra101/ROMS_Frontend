// src/pages/TableComponent/BulkUploadModal.jsx (updated)
import React, { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_REACT_APP_API_BASE_URL;

export default function BulkUploadModal({ onClose, onSave }) {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Parse input - support for comma separated, new line separated, or JSON array
      let tableData;
      if (inputText.trim().startsWith('[')) {
        // JSON format
        tableData = JSON.parse(inputText);
      } else {
        // Parse lines or comma-separated values
        const lines = inputText.split('\n').filter(line => line.trim());
        tableData = lines.map(line => {
          const parts = line.split(',').map(part => part.trim());
          return {
            tableNumber: parts[0],
            capacity: parts[1] ? parseInt(parts[1]) : 4
          };
        });
      }
      
      const res = await axios.post(
        `${API_BASE}/table/addTables`,
        { tables: tableData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage({ type: 'success', text: res.data.message });
      setTimeout(() => {
        onSave();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error bulk adding tables:", err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to add tables. Please check your input format.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const exampleInput = `1,4\n2,6\n3,2\n4,4`;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Transparent blurred backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden relative z-10 mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Add Tables</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <label htmlFor="bulkInput" className="block text-sm font-medium text-gray-700 mb-1">
              Enter table numbers and capacities
            </label>
            <textarea
              id="bulkInput"
              rows="6"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Enter one table per line in format: tableNumber, capacity\nExample:\n${exampleInput}`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">
              Format: tableNumber, capacity (one per line) or JSON array
            </p>
          </div>
          
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}
          
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
              disabled={loading || !inputText.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
            >
              {loading ? "Processing..." : "Add Tables"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}