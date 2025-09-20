import React, { useState } from "react";
import {
  FaClock,
  FaUtensils,
  FaCheckCircle,
  FaTimes,
  FaChevronRight,
  FaReceipt,
} from "react-icons/fa";
import OrderDetailsModal from "./OrderDetailsModal";

const statusIcons = {
  pending: <FaClock className="text-yellow-500" />,
  preparing: <FaUtensils className="text-blue-500" />,
  served: <FaCheckCircle className="text-green-500" />,
  completed: <FaCheckCircle className="text-green-600" />,
  cancelled: <FaTimes className="text-red-500" />,
};

const statusLabels = {
  pending: "Pending",
  preparing: "Preparing",
  served: "Served",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  preparing: "bg-blue-100 text-blue-800",
  served: "bg-green-100 text-green-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrdersCard({ order }) {

  const [showModal, setShowModal] = useState(false);

  // console.log(order);
  const tableNumber = order.tableNumber || order.table?.tableNumber || "N/A";
  // console.log(tableNumber);
  
  const displayedItems = order.items.slice(0, 3);
  const remainingItems = order.items.length - 3;

  const orderTime = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="cursor-pointer bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200 hover:border-blue-300 group flex flex-col h-full"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <h3 className="text-lg font-semibold text-gray-800">
                Table {tableNumber}
              </h3>
            </div>
            <div className="flex items-center mt-1">
              <FaReceipt className="text-gray-400 mr-1 text-xs" />
              <p className="text-xs text-gray-500">
                Order #{order.sessionId.slice(0, 6)}
              </p>
              {orderTime && (
                <>
                  <span className="mx-2 text-gray-300">•</span>
                  <p className="text-xs text-gray-500">{orderTime}</p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <span
              className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]} mr-2`}
            >
              {statusLabels[order.status]}
            </span>
            <div className="text-xl">{statusIcons[order.status]}</div>
          </div>
        </div>

        {/* Items */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
          <div className="space-y-2">
            {displayedItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">
                  {item.quantity > 1 && (
                    <span className="font-medium text-gray-800 mr-1">
                      {item.quantity}×
                    </span>
                  )}
                  {item.name}
                </span>
                <span className="text-xs text-gray-500">
                  Rs. {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            {remainingItems > 0 && (
              <div className="pt-1 text-xs text-blue-600">
                +{remainingItems} more item{remainingItems > 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>

        {/* Footer - always at bottom */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
          <div className="text-sm text-gray-500 flex items-center group-hover:text-blue-600 transition-colors">
            View details <FaChevronRight className="ml-1 text-xs" />
          </div>
          <p className="font-bold text-gray-800">
            Total: Rs. {order.totalAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {showModal && (
        <OrderDetailsModal order={order} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
