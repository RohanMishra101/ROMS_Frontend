// src/pages/Tables.jsx (updated)
import React, { useEffect, useState } from "react";
import axios from "axios";
import TableCard from "./TableComponent/TableCard.jsx";
import TableFormModal from "./TableComponent/TableFromModal.jsx";
import BulkUploadModal from "./TableComponent/BulkUploadModal.jsx";
import EmptyState from "./TableComponent/EmptyState.jsx";
import LoadingSpinner from "./TableComponent/LoadingSpinner.jsx";
import { generateQRPDF } from "../../../../utils/pdfGenerator.js";

const API_BASE = import.meta.env.VITE_API_REACT_APP_API_BASE_URL;

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Fetch tables
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/table`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTables(res.data);
    } catch (err) {
      console.error("Error fetching tables:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTable(null);
    setIsModalOpen(true);
  };

  const handleBulkAdd = () => {
    setIsBulkModalOpen(true);
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this table?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/table/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTables();
    } catch (err) {
      console.error("Error deleting table:", err);
    }
  };

  const handleDownloadAllQR = async () => {
    if (tables.length === 0) return;
    
    setDownloadingPDF(true);
    try {
      await generateQRPDF(tables, "Restaurant-Tables-QR-Codes");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingPDF(false);
    }
  };

  const filteredTables = tables.filter(table =>
    table.tableNumber.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
            <p className="text-gray-600 mt-2">Manage your restaurant tables and QR codes</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
            
            {tables.length > 0 && (
              <button
                onClick={handleDownloadAllQR}
                disabled={downloadingPDF}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm flex items-center justify-center disabled:opacity-50"
              >
                {downloadingPDF ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download All QR
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={handleBulkAdd}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Bulk Add
            </button>
            
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Table
            </button>
          </div>
        </div>

        {tables.length === 0 ? (
          <EmptyState onAddTable={handleAdd} />
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">All Tables ({filteredTables.length})</h2>
              <span className="text-sm text-gray-500">
                {filteredTables.length === tables.length 
                  ? "Showing all tables" 
                  : `Filtered ${filteredTables.length} of ${tables.length} tables`}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTables.map((table) => (
                <TableCard
                  key={table._id}
                  table={table}
                  onEdit={() => handleEdit(table)}
                  onDelete={() => handleDelete(table._id)}
                />
              ))}
            </div>
          </>
        )}

        {isModalOpen && (
          <TableFormModal
            onClose={() => setIsModalOpen(false)}
            onSave={fetchTables}
            editingTable={editingTable}
          />
        )}

        {isBulkModalOpen && (
          <BulkUploadModal
            onClose={() => setIsBulkModalOpen(false)}
            onSave={fetchTables}
          />
        )}
      </div>
    </div>
  );
}