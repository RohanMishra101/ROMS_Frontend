// Billing.jsx
import React from "react";
import { FiDownload, FiCreditCard, FiFileText } from "react-icons/fi";

export default function Billing({ tableNumber, orders, sessionId }) {
  // Filter orders that should be included in billing (not cancelled)
  const billableOrders = orders.filter(order => order.status !== 'cancelled');
  
  const totalAmount = billableOrders.reduce((sum, order) => {
    return sum + order.totalAmount;
  }, 0);

  const totalItems = billableOrders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);

  const downloadBillPDF = () => {
    // Create bill content
    const billContent = generateBillContent();
    
    // Create a temporary element for PDF generation
    const element = document.createElement('div');
    element.innerHTML = billContent;
    element.style.padding = '20px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.maxWidth = '800px';
    element.style.margin = '0 auto';
    
    // Simple way to print/save as PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - Table ${tableNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .bill-details { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .total-section { border-top: 2px solid #000; padding-top: 10px; text-align: right; }
            .total { font-size: 18px; font-weight: bold; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>${billContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const generateBillContent = () => {
    const now = new Date().toLocaleString();
    return `
      <div class="header">
        <h1>Restaurant Bill</h1>
        <p>Table: ${tableNumber} | Date: ${now}</p>
        <p>Session ID: ${sessionId}</p>
      </div>
      
      <div class="bill-details">
        <p><strong>Total Orders:</strong> ${billableOrders.length}</p>
        <p><strong>Total Items:</strong> ${totalItems}</p>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${billableOrders.map(order => 
            order.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>Rs. ${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>Rs. ${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')
          ).join('')}
        </tbody>
      </table>
      
      <div class="total-section">
        <p class="total">Total Amount: Rs. ${totalAmount.toFixed(2)}</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #666;">
        <p>Thank you for dining with us!</p>
      </div>
    `;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bill Summary</h2>
          <p className="text-gray-600">Table {tableNumber}</p>
        </div>

        {/* Bill Card */}
        <div className="bg-white rounded-lg shadow-lg border p-6 mb-6">
          {/* Bill Header */}
          <div className="text-center border-b pb-4 mb-6">
            <h3 className="text-xl font-bold text-gray-900">Restaurant Bill</h3>
            <p className="text-gray-600 mt-1">
              {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">Session: {sessionId}</p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{billableOrders.length}</p>
              <p className="text-sm text-gray-600">Orders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              <p className="text-sm text-gray-600">Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">Rs. {totalAmount.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>

          {/* Items Breakdown */}
          {billableOrders.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">Order Details</h4>
              <div className="space-y-4">
                {billableOrders.map((order, orderIndex) => (
                  <div key={order._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-900">Order #{orderIndex + 1}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{item.name}</span>
                          <span className="text-gray-600">
                            Rs. {item.price.toFixed(2)} × {item.quantity} = Rs. {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-3 pt-2">
                      <div className="flex justify-between font-medium">
                        <span>Subtotal:</span>
                        <span>Rs. {order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final Total */}
          <div className="border-t-2 border-gray-200 pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total Amount:</span>
              <span className="text-green-600">Rs. {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={downloadBillPDF}
            disabled={billableOrders.length === 0}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiDownload size={20} />
            <span>Download Bill</span>
          </button>
          
          <button
            disabled={billableOrders.length === 0}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiCreditCard size={20} />
            <span>Pay Now</span>
          </button>
        </div>

        {/* QR Code Section */}
        <div className="bg-white rounded-lg shadow-lg border p-6 text-center">
          <h4 className="font-semibold text-gray-900 mb-4">Pay with QR Code</h4>
          <div className="w-48 h-48 mx-auto border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            <div className="text-gray-500">
              <FiFileText size={48} className="mx-auto mb-2" />
              <p className="text-sm">QR Code</p>
              <p className="text-xs">Scan to Pay</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Scan this QR code with your mobile payment app to pay Rs. {totalAmount.toFixed(2)}
          </p>
        </div>

        {billableOrders.length === 0 && (
          <div className="text-center py-10">
            <FiFileText size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders to Bill</h3>
            <p className="text-gray-600">Your bill will appear here once you place orders.</p>
          </div>
        )}
      </div>
    </div>
  );
}