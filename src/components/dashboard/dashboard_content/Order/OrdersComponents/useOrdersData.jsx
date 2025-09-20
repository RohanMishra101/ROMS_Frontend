import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_REACT_APP_API_BASE_URL || "http://192.168.1.98:3000/api";

export default function useOrdersData(statusFilter) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const query = statusFilter !== "all" ? `?status=${statusFilter}` : "";

      const res = await axios.get(`${API_BASE}/order${query}`, { headers });
      const ordersArray = Array.isArray(res.data.orders) ? res.data.orders : [];
      const sortedOrders = ordersArray.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(sortedOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const url = `${API_BASE}/order/${orderId}/status`;

      await axios.put(url, { status }, { headers });

      fetchOrders();
    } catch (err) {
      console.error("Failed to update order status:", err.response ? err.response.data : err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return { orders, setOrders, loading, updatingOrderId, updateOrderStatus };
}
