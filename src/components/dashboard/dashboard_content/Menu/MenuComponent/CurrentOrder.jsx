import React, { useState, useEffect } from "react";
import { FiClock, FiRefreshCw, FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import {
  FaRegClock,
  FaSpinner,
  FaUtensils,
  FaCheckCircle,
  FaBan,
} from "react-icons/fa";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_PUBLIC_API_BASE || "http://192.168.1.98:3000/api/";

// Helper function to get status-specific styles and icons (matching OrderDetailsModal)
const getStatusStyles = (status) => {
  switch (status) {
    case "pending":
      return {
        classes: "bg-gray-100 border-gray-300",
        icon: <FaRegClock className="text-gray-600" title="Pending" />,
        textColor: "text-yellow-800",
        bgColor: "bg-yellow-100",
      };
    case "preparing":
      return {
        classes: "bg-yellow-100 border-yellow-300",
        icon: <FaSpinner className="text-yellow-600 animate-spin" title="Preparing" />,
        textColor: "text-blue-800",
        bgColor: "bg-blue-100",
      };
    case "ready":
      return {
        classes: "bg-green-100 border-green-300",
        icon: <FaUtensils className="text-green-600" title="Ready" />,
        textColor: "text-green-800",
        bgColor: "bg-green-100",
      };
    case "served":
      return {
        classes: "bg-purple-100 border-purple-300",
        icon: <FaCheckCircle className="text-purple-600" title="Served" />,
        textColor: "text-gray-800",
        bgColor: "bg-gray-100",
      };
    case "cancelled":
      return {
        classes: "bg-red-100 border-red-300",
        icon: <FaBan className="text-red-600" title="Cancelled" />,
        textColor: "text-red-800",
        bgColor: "bg-red-100",
      };
    default:
      return {
        classes: "bg-gray-50 border-gray-200",
        icon: null,
        textColor: "text-gray-800",
        bgColor: "bg-gray-100",
      };
  }
};

// Status section component (similar to OrderDetailsModal)
const StatusSection = ({
  title,
  items,
  orderId,
  onSelectItem,
  selectedItems,
  selectedQuantities,
  onChangeQuantity,
  isCancellable,
}) => {
  if (items.length === 0) return null;

  return (
    <div className="mb-4 sm:mb-6">
      <h4 className="font-medium text-gray-700 text-sm sm:text-base mb-2">{title}</h4>
      <ul className="space-y-2 max-h-60 sm:max-h-80 overflow-y-auto border-t pt-2">
        {items.map((item, originalIndex) => {
          const key = `${orderId}-${originalIndex}`;
          const isSelected = !!selectedItems[key];
          const canCancel = isCancellable(item.status);
          const { classes, icon } = getStatusStyles(item.status);
          const selectedQuantity = selectedQuantities[key] || 1;

          return (
            <li
              key={`status-item-${key}`}
              className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 rounded-lg border transition-all ${canCancel ? "cursor-pointer" : "cursor-not-allowed"
                } ${isSelected && canCancel
                  ? "bg-blue-50 border-blue-300 shadow-sm"
                  : canCancel
                    ? `hover:bg-gray-50 ${classes}`
                    : `${classes} opacity-70`
                }`}
              onClick={() => canCancel && onSelectItem(orderId, originalIndex)}
            >
              <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
                {canCancel && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => { }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 pointer-events-none mt-1 sm:mt-0 flex-shrink-0"
                  />
                )}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 text-sm sm:text-base truncate">
                      {item.name}
                    </span>
                    {icon}
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-gray-500 mt-1">
                    <span>Price: Rs. {item.price.toFixed(2)}</span>
                    <span>Quantity: {item.quantity}</span>
                    <span>Total: Rs. {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  {item.status === "cancelled" && item.cancelledAt && (
                    <p className="text-xs text-red-600 italic mt-1">
                      Cancelled at {new Date(item.cancelledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              </div>

              {isSelected && canCancel && item.quantity > 1 && (
                <div
                  className="flex items-center justify-center sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs sm:text-sm text-gray-600 mr-1 sm:mr-2">
                    Cancel Qty:
                  </span>
                  <button
                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs sm:text-sm min-w-[28px]"
                    onClick={() => onChangeQuantity(orderId, originalIndex, selectedQuantity - 1)}
                    disabled={selectedQuantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-6 sm:w-8 text-center font-medium text-sm">
                    {selectedQuantity}
                  </span>
                  <button
                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs sm:text-sm min-w-[28px]"
                    onClick={() => onChangeQuantity(orderId, originalIndex, selectedQuantity + 1)}
                    disabled={selectedQuantity >= item.quantity}
                  >
                    +
                  </button>
                  <span className="text-xs text-gray-500 ml-2">of {item.quantity}</span>
                </div>
              )}

              {isSelected && canCancel && (
                <div className="text-right mt-2 sm:mt-0 text-xs text-blue-600">
                  Canceling: Rs. {(item.price * selectedQuantity).toFixed(2)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default function CurrentOrder({ tableNumber, orders, setOrders, refreshOrders, loading, socket, socketConnected }) {
  const [selectedItems, setSelectedItems] = useState({});
  const [itemQuantities, setItemQuantities] = useState({});
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (socket && socketConnected) {
      console.log("🔌 [CurrentOrder] Socket connected:", socket.id);

      const handleOrderUpdate = (updatedOrder) => {
        console.log("📩 [CurrentOrder] Received socket event with data:", updatedOrder);

        if (!updatedOrder || !updatedOrder._id) {
          console.warn("⚠️ [CurrentOrder] Update payload format unexpected:", updatedOrder);
          refreshOrders(); // Fallback to full refresh
          return;
        }

        console.log(`📝 [CurrentOrder] Update is for Order ID: ${updatedOrder._id}, Status: ${updatedOrder.status}`);

        // Check if setOrders is a function before using it
        if (typeof setOrders === 'function') {
          // Perform a targeted update of the local orders state
          setOrders((prevOrders) => {
            const orderIndex = prevOrders.findIndex(order => order._id === updatedOrder._id);

            if (orderIndex !== -1) {
              // Order exists, update it
              console.log("🔄 [CurrentOrder] Updating existing order in state.");
              const newOrders = [...prevOrders];
              newOrders[orderIndex] = updatedOrder;
              return newOrders;
            } else {
              // New order, add it to the beginning of the array
              console.log("✨ [CurrentOrder] Adding new order to state.");
              return [updatedOrder, ...prevOrders];
            }
          });
        } else {
          // If setOrders is not provided, fall back to refreshOrders
          console.log("ℹ️ [CurrentOrder] setOrders not available, using refreshOrders");
          refreshOrders();
        }
      };

      // Listen for order status updates
      socket.on("orderStatusUpdated", handleOrderUpdate);
      socket.on("orderUpdated", handleOrderUpdate);
      socket.on("new-order", handleOrderUpdate);

      console.log("👂 [CurrentOrder] Listening for 'orderStatusUpdated', 'orderUpdated', and 'new-order' events");

      // Cleanup event listeners
      return () => {
        console.log("🧹 [CurrentOrder] Cleaning up socket listeners");
        socket.off("orderStatusUpdated", handleOrderUpdate);
        socket.off("orderUpdated", handleOrderUpdate);
        socket.off("new-order", handleOrderUpdate);
      };
    } else {
      console.log("❌ [CurrentOrder] Socket not connected or missing");
    }
  }, [socket, socketConnected, refreshOrders, setOrders]); // Added setOrders to dependency array


  // Helper function to check if an item can be selected for cancellation.
  const isCancellable = (status) => status === "pending" || status === "preparing";

  const toggleItemSelection = (orderId, itemIndex) => {
    setSelectedItems((prev) => {
      const key = `${orderId}-${itemIndex}`;
      const newSelection = { ...prev };

      if (newSelection[key]) {
        delete newSelection[key];
        setItemQuantities((prevQty) => {
          const newQty = { ...prevQty };
          delete newQty[key];
          return newQty;
        });
      } else {
        newSelection[key] = { orderId, itemIndex };
        setItemQuantities((prevQty) => ({ ...prevQty, [key]: 1 }));
      }

      return newSelection;
    });
  };

  const updateItemQuantity = (orderId, itemIndex, quantity) => {
    const key = `${orderId}-${itemIndex}`;
    setItemQuantities((prev) => ({
      ...prev,
      [key]: Math.max(1, Math.min(quantity, 10)),
    }));
  };

  const selectAllItems = (orderId, items) => {
    setSelectedItems((prev) => {
      const newSelection = { ...prev };
      const cancellableItems = items.filter((item) => isCancellable(item.status));
      const cancellableIndices = items
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => isCancellable(item.status))
        .map(({ index }) => index);

      const allSelected = cancellableIndices.every((index) => newSelection[`${orderId}-${index}`]);

      if (allSelected) {
        cancellableIndices.forEach((index) => delete newSelection[`${orderId}-${index}`]);
        setItemQuantities((prevQty) => {
          const newQty = { ...prevQty };
          cancellableIndices.forEach((index) => delete newQty[`${orderId}-${index}`]);
          return newQty;
        });
      } else {
        cancellableIndices.forEach((index) => {
          newSelection[`${orderId}-${index}`] = { orderId, itemIndex: index };
        });
        setItemQuantities((prevQty) => {
          const newQty = { ...prevQty };
          cancellableIndices.forEach((index) => (newQty[`${orderId}-${index}`] = 1));
          return newQty;
        });
      }

      return newSelection;
    });
  };

  const getSelectedItemsCount = (orderId) =>
    Object.values(selectedItems).filter((item) => item.orderId === orderId).length;

  const handleCancelSelectedItems = async (orderId) => {
    const itemsToCancel = Object.values(selectedItems)
      .filter((item) => item.orderId === orderId)
      .sort((a, b) => a.itemIndex - b.itemIndex);

    if (itemsToCancel.length === 0) return;

    setCancelling(true);
    try {
      const orderResponse = await axios.get(`${API_BASE}/public/order/${orderId}`);
      const order = orderResponse.data;

      const cancelPayload = itemsToCancel.map((cancelItem) => {
        const item = order.items[cancelItem.itemIndex];
        const key = `${orderId}-${cancelItem.itemIndex}`;
        return {
          foodId: item.food,
          quantity: itemQuantities[key] || 1,
        };
      });

      await axios.post(
        `${API_BASE}/public/order/${order.restaurant}/${tableNumber}/cancel`,
        { itemsToCancel: cancelPayload }
      );

      setSelectedItems((prev) => {
        const newSelection = { ...prev };
        itemsToCancel.forEach((item) => delete newSelection[`${orderId}-${item.itemIndex}`]);
        return newSelection;
      });
      setItemQuantities((prev) => {
        const newQty = { ...prev };
        itemsToCancel.forEach((item) => delete newQty[`${orderId}-${item.itemIndex}`]);
        return newQty;
      });

      // The socket will automatically trigger refreshOrders() when the server emits orderStatusUpdated
      // So we don't need to call refreshOrders() here manually
    } catch (err) {
      console.error("Failed to cancel items:", err);
      alert("Failed to cancel items. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelEntireOrder = async (orderId) => {
    setCancelling(true);
    try {
      const orderResponse = await axios.get(`${API_BASE}/public/order/${orderId}`);
      const order = orderResponse.data;

      const cancelPayload = order.items
        .filter((item) => isCancellable(item.status))
        .map((item) => ({ foodId: item.food, quantity: item.quantity }));

      await axios.post(
        `${API_BASE}/public/order/${order.restaurant}/${tableNumber}/cancel`,
        { itemsToCancel: cancelPayload }
      );

      // The socket will automatically trigger refreshOrders() when the server emits orderStatusUpdated
      // So we don't need to call refreshOrders() here manually
    } catch (err) {
      console.error("Failed to cancel order:", err);
      alert("Failed to cancel order. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    const styles = getStatusStyles(status);
    return `${styles.bgColor} ${styles.textColor}`;
  };

  const formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  // Filter orders that are not 'cancelled' or 'served' to display
  // const activeOrders = orders.filter((order) => order.status !== "cancelled" && order.status !== "served");
  // Only filter out cancelled orders, keep served orders so items still show
  const activeOrders = orders.filter((order) => order.status !== "cancelled");

  return (
    <div className="flex-1 p-2 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Current Orders</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Table {tableNumber}
              {socketConnected && <span className="ml-2 text-green-600 text-xs">● Live</span>}
              {!socketConnected && <span className="ml-2 text-red-600 text-xs">● Offline</span>}
            </p>
          </div>
          <button
            onClick={refreshOrders}
            disabled={loading || cancelling}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} size={16} />
            <span className="text-sm sm:text-base">Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <p className="mt-2 text-gray-600">Loading orders...</p>
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="text-center py-8 sm:py-10 bg-white rounded-lg shadow-sm mx-2 sm:mx-0">
            <FiClock size={40} className="mx-auto mb-4 text-gray-400 sm:w-12 sm:h-12" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Active Orders</h3>
            <p className="text-sm sm:text-base text-gray-600">Your current orders will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {activeOrders.map((order) => {
              const selectedCount = getSelectedItemsCount(order._id);
              const cancellableItems = order.items.filter((item) => isCancellable(item.status));

              // Group items by status
              const pendingItems = order.items.filter((item) => item.status === "pending");
              const preparingItems = order.items.filter((item) => item.status === "preparing");
              const readyItems = order.items.filter((item) => item.status === "ready");
              const servedItems = order.items.filter((item) => item.status === "served");
              const cancelledItems = order.items.filter((item) => item.status === "cancelled");

              return (
                <div key={order._id} className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 md:p-6 mx-2 sm:mx-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <span
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(
                            order.status
                          )} w-fit`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500">
                          Ordered at {formatTime(order.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">Order ID: {order._id.slice(-8)}</p>
                    </div>

                    {cancellableItems.length > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        {selectedCount > 0 && (
                          <span className="text-xs sm:text-sm text-blue-600">
                            {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
                          </span>
                        )}
                        <button
                          onClick={() => selectAllItems(order._id, order.items)}
                          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 sm:px-3 py-1 rounded transition-colors w-full sm:w-auto"
                        >
                          {selectedCount === cancellableItems.length ? "Deselect All" : "Select All"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-3 sm:pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-700 text-sm sm:text-base">
                        Order Items
                      </h3>
                    </div>

                    <div className="max-h-80 sm:max-h-[70vh] overflow-y-auto">
                      <StatusSection
                        title="Pending Items"
                        items={pendingItems}
                        orderId={order._id}
                        onSelectItem={toggleItemSelection}
                        selectedItems={selectedItems}
                        selectedQuantities={itemQuantities}
                        onChangeQuantity={updateItemQuantity}
                        isCancellable={isCancellable}
                      />
                      <StatusSection
                        title="Preparing Items"
                        items={preparingItems}
                        orderId={order._id}
                        onSelectItem={toggleItemSelection}
                        selectedItems={selectedItems}
                        selectedQuantities={itemQuantities}
                        onChangeQuantity={updateItemQuantity}
                        isCancellable={isCancellable}
                      />
                      <StatusSection
                        title="Ready Items"
                        items={readyItems}
                        orderId={order._id}
                        onSelectItem={toggleItemSelection}
                        selectedItems={selectedItems}
                        selectedQuantities={itemQuantities}
                        onChangeQuantity={updateItemQuantity}
                        isCancellable={isCancellable}
                      />
                      <StatusSection
                        title="Served Items"
                        items={servedItems}
                        orderId={order._id}
                        onSelectItem={toggleItemSelection}
                        selectedItems={selectedItems}
                        selectedQuantities={itemQuantities}
                        onChangeQuantity={updateItemQuantity}
                        isCancellable={isCancellable}
                      />
                      {cancelledItems.length > 0 && (
                        <StatusSection
                          title="Cancelled Items"
                          items={cancelledItems}
                          orderId={order._id}
                          onSelectItem={toggleItemSelection}
                          selectedItems={selectedItems}
                          selectedQuantities={itemQuantities}
                          onChangeQuantity={updateItemQuantity}
                          isCancellable={isCancellable}
                        />
                      )}
                    </div>

                    <div className="border-t pt-2 sm:pt-3 mt-2 sm:mt-3 flex justify-between items-center">
                      <span className="font-bold text-base sm:text-lg">Total:</span>
                      <span className="font-bold text-base sm:text-lg">Rs. {order.totalAmount.toFixed(2)}</span>
                    </div>

                    {cancellableItems.length > 0 && (
                      <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {selectedCount > 0 ? (
                            <button
                              onClick={() => handleCancelSelectedItems(order._id)}
                              disabled={cancelling}
                              className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-initial min-w-0 disabled:opacity-50 disabled:cursor-not-allowed bg-red-100 hover:bg-red-200 text-red-800"
                            >
                              {cancelling ? (
                                <div className="flex items-center justify-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                  <span>Canceling...</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  <FiX size={14} />
                                  <span>Cancel Selected ({selectedCount})</span>
                                </div>
                              )}
                            </button>
                          ) : (
                            <p className="text-xs sm:text-sm text-gray-500 px-2">
                              Select items to cancel individually
                            </p>
                          )}

                          <button
                            onClick={() => handleCancelEntireOrder(order._id)}
                            disabled={cancelling}
                            className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-initial min-w-0 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 hover:bg-gray-200 text-gray-700"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <FiTrash2 size={14} />
                              <span>Cancel Entire Order</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}