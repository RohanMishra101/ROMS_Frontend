import { useState } from "react";
import { FaTimes, FaCheck, FaClock, FaUtensils, FaCheckCircle, FaReceipt } from "react-icons/fa";
import BillingModal from "./BillingModal"; // <-- NEW

const statusColors = {
  pending: "bg-yellow-50 text-yellow-800 border-yellow-200",
  preparing: "bg-blue-50 text-blue-800 border-blue-200",
  served: "bg-green-50 text-green-800 border-green-200",
  completed: "bg-green-50 text-green-800 border-green-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

const statusIcons = {
  pending: <FaClock className="text-yellow-500" />,
  preparing: <FaUtensils className="text-blue-500" />,
  served: <FaCheckCircle className="text-green-500" />,
  completed: <FaCheckCircle className="text-green-600" />,
  cancelled: <FaTimes className="text-gray-400" />,
};

const formatCurrency = (n) => `Rs. ${Number(n).toFixed(2)}`; // Nepali Rupees friendly

export default function OrdersCard({ order, showActions, updatingOrderId, onUpdate }) {
  const [showBill, setShowBill] = useState(false);

  return (
    <div className={`relative bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-md`}>
      {/* Status Ribbon */}
      <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-semibold ${statusColors[order.status]} rounded-bl-lg`}>
        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Table {order.table?.tableNumber || "N/A"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Session: {order.sessionId.slice(0, 6)}
            </p>
          </div>
          <div className="text-2xl">{statusIcons[order.status]}</div>
        </div>

        {/* Details */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>
          <p className="text-xl font-bold text-gray-800 mt-1">
            {formatCurrency(order.totalAmount)}
          </p>
        </div>

        {/* Items */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center">
            <span className="mr-2">Order Items</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {order.items.length} items
            </span>
          </h4>
          <ul className="space-y-3 max-h-40 overflow-y-auto pr-2">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-gray-500 ml-2">×{item.quantity}</span>
                </div>
                <span className="text-gray-600">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actions */}
      {showActions && (order.status === "pending" || order.status === "preparing" || order.status === "served") && (
        <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 flex flex-wrap justify-end gap-3">
          {/* Served */}
          <button
            onClick={() => onUpdate(order._id, "served")}
            disabled={updatingOrderId === order._id}
            className="px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 flex items-center gap-2 text-sm"
            title="Mark as served"
          >
            <FaCheckCircle />
            Served
          </button>

          {/* Cancel */}
          <button
            onClick={() => onUpdate(order._id, "cancelled")}
            disabled={updatingOrderId === order._id}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
          >
            <FaTimes className="text-red-500" />
            Cancel
          </button>

          {/* Confirm / Bill */}
          <button
            onClick={() => setShowBill(true)}
            disabled={updatingOrderId === order._id}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
          >
            <FaReceipt />
            Confirm / Bill
          </button>
        </div>
      )}

      {/* Billing Modal */}
      {showBill && (
        <BillingModal
          order={order}
          onClose={() => setShowBill(false)}
          onConfirmed={() => {
            // After confirming payment, mark as completed
            onUpdate(order._id, "completed");
            setShowBill(false);
          }}
        />
      )}
    </div>
  );
}
