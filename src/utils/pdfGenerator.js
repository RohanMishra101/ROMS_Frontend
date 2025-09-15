// src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Function to load image from URL and convert to base64
const getBase64FromUrl = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64 = reader.result;
        resolve(base64);
      };
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
};

// Generate PDF with all QR codes
export const generateQRPDF = async (tables, filename = 'QR-Codes') => {
  // Create new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Restaurant Table QR Codes', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
  
  let yPosition = 40;
  const qrSize = 60;
  const margin = 15;
  const itemsPerRow = 2;
  const itemWidth = (pageWidth - margin * 2) / itemsPerRow;
  
  // Process tables in batches to avoid memory issues
  for (let i = 0; i < tables.length; i += itemsPerRow * 2) {
    const batch = tables.slice(i, i + itemsPerRow * 2);
    
    // Process all images in the batch first
    const imagePromises = batch.map(table => getBase64FromUrl(table.qrCodeImageURL));
    const images = await Promise.all(imagePromises);
    
    // Add QR codes to PDF
    for (let j = 0; j < batch.length; j++) {
      if (yPosition + qrSize + 30 > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      
      const table = batch[j];
      const imageData = images[j];
      const xPosition = margin + (j % itemsPerRow) * itemWidth + (itemWidth - qrSize) / 2;
      
      if (imageData) {
        doc.addImage(imageData, 'PNG', xPosition, yPosition, qrSize, qrSize);
      }
      
      // Add table number below QR code
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text(
        `Table ${table.tableNumber}`,
        xPosition + qrSize / 2,
        yPosition + qrSize + 10,
        { align: 'center' }
      );
      
      // Add capacity info
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Capacity: ${table.capacity} ${table.capacity === 1 ? 'seat' : 'seats'}`,
        xPosition + qrSize / 2,
        yPosition + qrSize + 18,
        { align: 'center' }
      );
      
      // Move to next row if needed
      if ((j + 1) % itemsPerRow === 0) {
        yPosition += qrSize + 30;
      }
    }
    
    // Add some space between batches
    yPosition += 10;
    
    // Add a new page if we're running out of space
    if (yPosition + qrSize + 30 > pageHeight - margin && i + itemsPerRow * 2 < tables.length) {
      doc.addPage();
      yPosition = margin;
    }
  }
  
  // Save the PDF
  doc.save(`${filename}.pdf`);
};