import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch tables from backend
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming JWT token for auth
        const res = await axios.get("http://localhost:3000/api/table", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTables(res.data);
      } catch (err) {
        console.error("Error fetching tables:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const downloadQR = (tableNumber, qrCodeImageURL) => {
    const link = document.createElement("a");
    link.href = qrCodeImageURL;
    link.download = `Table-${tableNumber}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <p className="text-center mt-4">Loading tables...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Restaurant Tables</h2>
      {tables.length === 0 ? (
        <p>No tables found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((table) => (
            <div
              key={table._id}
              className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center"
            >
              <h3 className="text-lg font-semibold mb-2">
                Table #{table.tableNumber}
              </h3>
              <img
                src={table.qrCodeImageURL}
                alt={`QR for Table ${table.tableNumber}`}
                className="w-40 h-40 mb-3"
              />
              <button
                onClick={() => downloadQR(table.tableNumber, table.qrCodeImageURL)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Download QR
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
