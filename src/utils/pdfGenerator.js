// src/utils/pdfGenerator.js
import jsPDF from "jspdf";
import QRCode from "qrcode"; // generate QR as base64

// Generate QR code as base64 string
const generateQRBase64 = async (text) => {
  try {
    return await QRCode.toDataURL(text, { errorCorrectionLevel: "H", type: "image/png", margin: 1 });
  } catch (err) {
    console.error("Error generating QR:", err);
    return null;
  }
};

// Generate PDF
export const generateQRPDF = async (tables, filename = "QR-Codes") => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const qrSize = 80;
  const baseURL = import.meta.env.VITE_TABLE_URL || "http://localhost:5173";

  let yPosition = 20;

  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    const qrURL = `${baseURL}${table.qrCodeData}`;

    const qrBase64 = await generateQRBase64(qrURL);
    if (!qrBase64) continue;

    // Add title
    doc.setFontSize(18);
    doc.text("Restaurant Table QR Code", pageWidth / 2, yPosition, { align: "center" });

    // Table info
    doc.setFontSize(14);
    doc.text(`Table: ${table.tableNumber}`, pageWidth / 2, yPosition + 15, { align: "center" });
    doc.text(`Capacity: ${table.capacity} ${table.capacity === 1 ? "seat" : "seats"}`, pageWidth / 2, yPosition + 23, { align: "center" });

    // Add QR image
    doc.addImage(qrBase64, "PNG", pageWidth / 2 - qrSize / 2, yPosition + 30, qrSize, qrSize);

    yPosition += qrSize + 50; // space for next

    // Add new page if running out of space
    if (yPosition + qrSize + 30 > pageHeight && i < tables.length - 1) {
      doc.addPage();
      yPosition = 20;
    }
  }

  doc.save(`${filename}.pdf`);
};
