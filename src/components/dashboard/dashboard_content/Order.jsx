import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCircle, FaCheck, FaTimes, FaUtensils, FaClock, FaCheckCircle } from "react-icons/fa";
import { FiFilter } from "react-icons/fi";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const query = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await axios.get(`http://localhost:3000/api/order${query}`, { headers });

      const sortedOrders = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(sortedOrders);
      setCompletedOrders(sortedOrders.filter((o) => o.status === "completed"));
      setActiveOrders(sortedOrders.filter((o) => o.status !== "completed" && o.status !== "cancelled"));
      setCancelledOrders(sortedOrders.filter((o) => o.status === "cancelled"));
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`http://localhost:3000/api/order/${orderId}/status`, { status }, { headers });
      fetchOrders(); // refresh list
    } catch (err) {
      console.error("Failed to update order status:", err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

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

  const renderOrderList = (orderList, showActions = false) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return orderList.length === 0 ? (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-500">No orders found</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orderList.map((order) => (
          <div
            key={order._id}
            className={`relative bg-white rounded-xl shadow-sm border ${statusColors[order.status].split(' ')[2]} overflow-hidden transition-all hover:shadow-md`}
          >
            {/* Status Ribbon */}
            <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-semibold ${statusColors[order.status]} rounded-bl-lg`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>

            <div className="p-5">
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Table {order.table?.tableNumber || "N/A"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Session: {order.sessionId.slice(0, 6)}
                  </p>
                </div>
                <div className="text-2xl">
                  {statusIcons[order.status]}
                </div>
              </div>

              {/* Order Details */}
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
                <p className="text-xl font-bold text-gray-800 mt-1">
                  ${order.totalAmount.toFixed(2)}
                </p>
              </div>

              {/* Items List */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">Order Items</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {order.items.length} items
                  </span>
                </h4>
                <ul className="space-y-3 max-h-40 overflow-y-auto pr-2">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium text-gray-700">{item.name}</span>
                        <span className="text-gray-500 ml-2">×{item.quantity}</span>
                      </div>
                      <span className="text-gray-600">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            {showActions && order.status === "pending" && (
              <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => updateOrderStatus(order._id, "cancelled")}
                  disabled={updatingOrderId === order._id}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <FaTimes className="text-red-500" />
                  Cancel
                </button>
                <button
                  onClick={() => updateOrderStatus(order._id, "completed")}
                  disabled={updatingOrderId === order._id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  <FaCheck />
                  Complete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
          <p className="text-sm text-gray-500">View and manage all restaurant orders</p>
        </div>
        <div className="flex items-center gap-3">
          <FiFilter className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 py-2 px-4 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="served">Served</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Active Orders */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-800">Active Orders</h2>
            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              {activeOrders.length} orders
            </span>
          </div>
        </div>
        {renderOrderList(activeOrders, true)}
      </div>

      {/* Completed Orders */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-800">Completed Orders</h2>
            <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
              {completedOrders.length} orders
            </span>
          </div>
        </div>
        {renderOrderList(completedOrders)}
      </div>

      {/* Cancelled Orders */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-800">Cancelled Orders</h2>
            <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full">
              {cancelledOrders.length} orders
            </span>
          </div>
        </div>
        {renderOrderList(cancelledOrders)}
      </div>
    </div>
  );
}