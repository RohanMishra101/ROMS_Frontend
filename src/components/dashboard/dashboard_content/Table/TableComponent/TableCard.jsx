// src/pages/TableComponent/TableCard.jsx
import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { QRCodeCanvas } from "qrcode.react";

export default function TableCard({ table, onEdit, onDelete }) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const qrRef = useRef();

  const serverIp = window.location.hostname;
  const serverPort = 3000; 
  const baseUrl = import.meta.env.VITE_TABLE_URL;
  const qrCodeUrl = `${baseUrl}${table.qrCodeData}`;

  // const qrCodeUrl = `${window.location.origin}/menu?table=${table.tableNumber}&restaurant=${table.restaurant}`;

  const downloadQR = () => {
    // Convert canvas to image
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = url;
    link.download = `Table-${table.tableNumber}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = async () => {
    setIsGeneratingPDF(true);

    try {
      const canvas = qrRef.current.querySelector("canvas");
      if (!canvas) throw new Error("QR code canvas not found");

      const imgData = canvas.toDataURL("image/png");

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Border
      doc.setDrawColor(200, 200, 200);
      doc.rect(5, 5, 200, 287);

      // Title
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("Table QR Code", 105, 30, { align: "center" });

      // Table info
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.text(`Table Number: ${table.tableNumber}`, 105, 45, { align: "center" });
      doc.text(
        `Capacity: ${table.capacity} ${table.capacity === 1 ? "seat" : "seats"}`,
        105,
        55,
        { align: "center" }
      );

      // QR code image
      const qrSize = 120;
      const xPos = (210 - qrSize) / 2;
      doc.addImage(imgData, "PNG", xPos, 70, qrSize, qrSize);

      // Footer
      doc.setFontSize(12);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      doc.text("Scan this code to view the table details", 105, 210, { align: "center" });

      const now = new Date();
      doc.text(`Generated on: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 105, 280, {
        align: "center",
      });

      doc.save(`Table-${table.tableNumber}-QR.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md w-full max-w-xs mx-auto">
      <div className="p-4 sm:p-5 flex flex-col items-center">
        <div className="flex justify-between w-full mb-3 sm:mb-4">
          <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            #{table.tableNumber}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {table.capacity} {table.capacity === 1 ? "seat" : "seats"}
          </span>
        </div>

        <div className="mb-3 sm:mb-4 p-1 sm:p-2 bg-white rounded-lg border border-gray-200" ref={qrRef}>
          <QRCodeCanvas value={qrCodeUrl} size={128} includeMargin={true} />
          {/* {console.log(qrCodeUrl)} */}
        </div>

        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Table {table.tableNumber}</h3>

        <div className="flex flex-col xs:flex-row xs:space-x-2 space-y-2 xs:space-y-0 mt-3 sm:mt-4 w-full">
          <div className="flex flex-col space-y-2 w-full">
            <button
              onClick={downloadQR}
              className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Download PNG
            </button>

            <button
              onClick={downloadPDF}
              disabled={isGeneratingPDF}
              className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? "Generating..." : "Download PDF"}
            </button>
          </div>

          <div className="flex space-x-2 justify-between xs:justify-start">
            <button
              onClick={onEdit}
              className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 flex-1 xs:flex-none"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex-1 xs:flex-none"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
