import { useState, useEffect } from "react";
import useOrdersData from "./OrdersComponents/useOrdersData";
import OrdersList from "./OrdersComponents/OrdersList";
import OrdersFilter from "./OrdersComponents/OrdersFilter";

export default function Orders({ socket }) {
  const [statusFilter, setStatusFilter] = useState("all");

  // ✅ Include setOrders in the hook return
  const { orders, setOrders, loading, updatingOrderId, updateOrderStatus } = useOrdersData(statusFilter);

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (order) => {
      console.log("[SOCKET RECEIVED] new-order", order);
      setOrders(prev => {
        const combined = [order, ...prev];
        const unique = combined.reduce((acc, curr) => {
          if (!acc.find(o => o._id === curr._id)) acc.push(curr);
          return acc;
        }, []);
        return unique;
      });
    };

    const handleOrderStatusUpdated = (updatedOrder) => {
      console.log("[SOCKET RECEIVED] orderStatusUpdated", updatedOrder);
      setOrders(prev =>
        prev.map(o => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    };

    socket.on("new-order", handleNewOrder);
    socket.on("orderStatusUpdated", handleOrderStatusUpdated);

    return () => {
      socket.off("new-order", handleNewOrder);
      socket.off("orderStatusUpdated", handleOrderStatusUpdated);
    };
  }, [socket, setOrders]);

  const activeOrders = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
          <p className="text-sm text-gray-500">View and manage all restaurant orders</p>
        </div>
        <OrdersFilter statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <OrdersList
            title="Active Orders"
            orders={activeOrders}
            badgeColor="bg-blue-100 text-blue-800"
            showActions={true}
            updatingOrderId={updatingOrderId}
            onUpdate={updateOrderStatus}
          />
          <OrdersList
            title="Completed Orders"
            orders={completedOrders}
            badgeColor="bg-green-100 text-green-800"
            showActions={false}
          />
          <OrdersList
            title="Cancelled Orders"
            orders={cancelledOrders}
            badgeColor="bg-gray-100 text-gray-800"
            showActions={false}
          />
        </>
      )}
    </div>
  );
}
