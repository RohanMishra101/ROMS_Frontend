import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FiPrinter, FiDownload, FiX, FiCheckCircle } from "react-icons/fi";

const VAT_RATE = 0.13; // Nepal VAT = 13%

const formatCurrency = (n) => `Rs. ${Number(n).toFixed(2)}`;

export default function BillingModal({ order, onClose, onConfirmed }) {
  const [applyVAT, setApplyVAT] = useState(true);
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState(0);
  const billRef = useRef(null);

  const { subTotal, discountAmount, vatAmount, grandTotal } = useMemo(() => {
    const subTotal = order.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const discountAmount =
      discountType === "percent"
        ? Math.min(subTotal, (Number(discountValue) || 0) / 100 * subTotal)
        : Math.min(subTotal, Number(discountValue) || 0);
    const taxable = Math.max(0, subTotal - discountAmount);
    const vatAmount = applyVAT ? taxable * VAT_RATE : 0;
    const grandTotal = taxable + vatAmount;
    return { subTotal, discountAmount, vatAmount, grandTotal };
  }, [order.items, applyVAT, discountType, discountValue]);

const downloadPDF = async () => {
  const node = billRef.current;

  // Clone and normalize styles (convert "oklch" etc. into rgb/hex)
  const clone = node.cloneNode(true);
  clone.querySelectorAll("*").forEach(el => {
    const style = window.getComputedStyle(el);
    const bg = style.backgroundColor;
    const color = style.color;
    if (bg && bg.includes("oklch")) el.style.backgroundColor = "#ffffff"; // fallback
    if (color && color.includes("oklch")) el.style.color = "#000000"; // fallback
  });

  document.body.appendChild(clone);
  clone.style.position = "fixed";
  clone.style.top = "-9999px"; // hide it

  const canvas = await html2canvas(clone, { scale: 2, useCORS: true });
  document.body.removeChild(clone);

  const img = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgProps = { width: canvas.width, height: canvas.height };
  const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
  const imgWidth = imgProps.width * ratio;
  const imgHeight = imgProps.height * ratio;

  pdf.addImage(img, "PNG", (pageWidth - imgWidth) / 2, 10, imgWidth, imgHeight);
  pdf.save(`Bill_${order.table?.tableNumber || "NA"}_${order._id.slice(0,6)}.pdf`);
};


  const printBill = () => {
    const content = billRef.current?.outerHTML || "";
    const win = window.open("", "_blank", "width=800,height=900");
    win.document.write(`
      <html>
        <head>
          <title>Bill</title>
          <style>
            *{font-family: 'Inter', system-ui, -apple-system, sans-serif;}
            body{padding:20px;background:#fff;}
            .bill{max-width:720px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;}
            .table{width:100%;border-collapse:separate;border-spacing:0;}
            .table th{padding:12px 8px;text-align:left;font-size:13px;font-weight:600;color:#4b5563;border-bottom:1px solid #e5e7eb;}
            .table td{padding:12px 8px;text-align:left;font-size:13px;border-bottom:1px solid #f3f4f6;}
            .total-row td{font-weight:600;color:#111827;background:#f9fafb;}
            .header{background:#f9fafb;padding:16px;border-radius:8px;}
          </style>
        </head>
        <body>${content}</body>
      </html>`);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Order Summary</h3>
            <p className="text-sm text-gray-500">
              Table {order.table?.tableNumber} • {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <div className="flex border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setDiscountType("percent")}
                    className={`flex-1 py-2 text-sm ${discountType === "percent" ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                  >
                    Percentage (%)
                  </button>
                  <button
                    onClick={() => setDiscountType("flat")}
                    className={`flex-1 py-2 text-sm ${discountType === "flat" ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                  >
                    Flat (Rs.)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {discountType === "percent" ? "Discount Percentage" : "Discount Amount"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max={discountType === "percent" ? 100 : undefined}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 pl-8"
                    placeholder={discountType === "percent" ? "0-100" : "0.00"}
                  />
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    {discountType === "percent" ? "%" : "Rs."}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  id="applyVAT"
                  type="checkbox"
                  checked={applyVAT}
                  onChange={(e) => setApplyVAT(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="applyVAT" className="text-sm text-gray-700">
                  Apply VAT (13%)
                </label>
              </div>
            </div>

            {/* Summary Card */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-700 mb-3">Payment Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-red-600">- {formatCurrency(discountAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VAT {applyVAT ? "(13%)" : ""}</span>
                  <span className="font-medium">{formatCurrency(vatAmount)}</span>
                </div>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-gray-800">Total</span>
                  <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bill Preview */}
          <div className="lg:col-span-2">
            <div ref={billRef} className="bill bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-2xl font-bold text-gray-900">Restaurant Name</h4>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      ORD-{order._id.slice(0,6).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">123 Restaurant St, Kathmandu</p>
                  <p className="text-sm text-gray-500">Phone: +977 1234567890</p>
                </div>
                <div className="text-right">
                  <div className="bg-gray-100 inline-flex px-3 py-1 rounded-lg">
                    <p className="text-sm font-medium">Table: {order.table?.tableNumber}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <table className="table w-full mb-6">
                <thead>
                  <tr>
                    <th className="text-left">Item</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Rate</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it, i) => (
                    <tr key={i}>
                      <td className="font-medium">{it.name}</td>
                      <td className="text-right">{it.quantity}</td>
                      <td className="text-right">{formatCurrency(it.price)}</td>
                      <td className="text-right">{formatCurrency(it.price * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-gray-200 mb-4"></div>

              <div className="flex justify-end">
                <div className="w-full max-w-xs">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subTotal)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-red-600">- {formatCurrency(discountAmount)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">VAT {applyVAT ? "(13%)" : ""}:</span>
                    <span className="font-medium">{formatCurrency(vatAmount)}</span>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between py-2 text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                <p>Thank you for dining with us!</p>
                <p className="mt-1">For any queries, please contact +977 1234567890</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex flex-wrap gap-3 justify-end">
          <button 
            onClick={printBill} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <FiPrinter size={16} /> Print
          </button>
          <button 
            onClick={downloadPDF} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <FiDownload size={16} /> Download PDF
          </button>
          <button
            onClick={onConfirmed}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiCheckCircle size={16} /> Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
}