import { useState, useEffect } from "react";
import useOrdersData from "./OrdersComponents/useOrdersData";
import OrdersList from "./OrdersComponents/OrdersList";
import OrdersFilter from "./OrdersComponents/OrdersFilter";

export default function Orders({ socket }) {
  const [statusFilter, setStatusFilter] = useState("all");

  // ✅ Include setOrders in the hook return
  const { orders, setOrders, loading, updatingOrderId, updateOrderStatus } = useOrdersData(statusFilter);
  // console.log(socket);
  
  useEffect(() => {
    if (!socket) return;

    // console.log(socket);
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
    // console.log(handleNewOrder);
    

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

  // Helper function to check if order is from today
  const isToday = (dateString) => {
    const orderDate = new Date(dateString);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  };

  // Filter orders by status and date
  const activeOrders = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  // Separate today's orders from previous orders
  const todaysActiveOrders = activeOrders.filter((o) => isToday(o.createdAt));
  const previousActiveOrders = activeOrders.filter((o) => !isToday(o.createdAt));

  const todaysCompletedOrders = completedOrders.filter((o) => isToday(o.createdAt));
  const previousCompletedOrders = completedOrders.filter((o) => !isToday(o.createdAt));

  const todaysCancelledOrders = cancelledOrders.filter((o) => isToday(o.createdAt));
  const previousCancelledOrders = cancelledOrders.filter((o) => !isToday(o.createdAt));

  return (
    <div className="p-3 sm:p-4 md:p-6 min-h-full">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Order Management</h1>
          <p className="text-xs sm:text-sm text-gray-500">View and manage all restaurant orders</p>
        </div>
        <OrdersFilter statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Today's Orders */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2 flex items-center">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2"></span>
              Today's Orders
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-700 mb-2">Active</h3>
                <OrdersList
                  orders={todaysActiveOrders}
                  badgeColor="bg-blue-100 text-blue-800"
                  showActions={true}
                  updatingOrderId={updatingOrderId}
                  onUpdate={updateOrderStatus}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-green-700 mb-2">Completed</h3>
                <OrdersList
                  orders={todaysCompletedOrders}
                  badgeColor="bg-green-100 text-green-800"
                  showActions={false}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Cancelled</h3>
                <OrdersList
                  orders={todaysCancelledOrders}
                  badgeColor="bg-gray-100 text-gray-800"
                  showActions={false}
                />
              </div>
            </div>
          </div>

          {/* Previous Orders */}
          {(previousActiveOrders.length > 0 ||
            previousCompletedOrders.length > 0 ||
            previousCancelledOrders.length > 0) && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2 flex items-center">
                  <span className="w-2.5 h-2.5 bg-gray-500 rounded-full mr-2"></span>
                  Previous Orders
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-700 mb-2">Active</h3>
                    <OrdersList
                      orders={previousActiveOrders}
                      badgeColor="bg-blue-100 text-blue-800"
                      showActions={true}
                      updatingOrderId={updatingOrderId}
                      onUpdate={updateOrderStatus}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-green-700 mb-2">Completed</h3>
                    <OrdersList
                      orders={previousCompletedOrders}
                      badgeColor="bg-green-100 text-green-800"
                      showActions={false}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Cancelled</h3>
                    <OrdersList
                      orders={previousCancelledOrders}
                      badgeColor="bg-gray-100 text-gray-800"
                      showActions={false}
                    />
                  </div>
                </div>
              </div>
            )}

        </>
      )}
    </div>
  );
}
