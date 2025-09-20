import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaPrint,
  FaCheckCircle,
  FaSpinner,
  FaUtensils,
  FaBan,
  FaRegClock,
} from "react-icons/fa";
import axios from "axios";

// Helper function to get status-specific styles and icons
const getStatusStyles = (status) => {
  switch (status) {
    case "pending":
      return {
        classes: "bg-gray-100 border-gray-300",
        icon: <FaRegClock className="text-gray-600" title="Pending" />,
      };
    case "preparing":
      return {
        classes: "bg-yellow-100 border-yellow-300",
        icon: <FaSpinner className="text-yellow-600 animate-spin" title="Preparing" />,
      };
    case "served":
      return {
        classes: "bg-green-100 border-green-300",
        icon: <FaUtensils className="text-green-600" title="Served" />,
      };
    case "completed":
      return {
        classes: "bg-purple-100 border-purple-300",
        icon: <FaCheckCircle className="text-purple-600" title="Completed" />,
      };
    case "cancelled":
      return {
        classes: "bg-red-100 border-red-300",
        icon: <FaBan className="text-red-600" title="Cancelled" />,
      };
    default:
      return {
        classes: "bg-gray-50 border-gray-200",
        icon: null,
      };
  }
};

const StatusSection = ({
  title,
  items,
  onSelectItem,
  selectedItems,
  selectedQuantities,
  onChangeQuantity,
}) => {
  if (items.length === 0) return null;

  return (
    <div className="mb-4 sm:mb-6">
      <h3 className="font-medium text-gray-700 text-sm sm:text-base mb-2">{title}</h3>
      <ul className="space-y-2 max-h-60 sm:max-h-80 overflow-y-auto border-t pt-2">
        {items.map((item, index) => {
          const itemId = item._id?.$oid || item._id || `item-${index}`;
          const isSelected = selectedItems.includes(itemId);
          const { classes, icon } = getStatusStyles(item.status);

          return (
            <li
              key={`status-item-${itemId}`}
              className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? "bg-blue-50 border-blue-300 shadow-sm"
                  : `hover:bg-gray-50 ${classes}`
              }`}
              onClick={() => onSelectItem(itemId)}
            >
              <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 pointer-events-none mt-1 sm:mt-0 flex-shrink-0"
                />
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
                    <span className="text-blue-600 font-medium">
                      ID: {itemId.slice(-6)}
                    </span>
                  </div>
                </div>
              </div>
              {isSelected && (
                <div
                  className="flex items-center justify-center sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs sm:text-sm text-gray-600 mr-1 sm:mr-2">
                    Qty:
                  </span>
                  <button
                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs sm:text-sm min-w-[28px]"
                    onClick={() => onChangeQuantity(itemId, -1)}
                  >
                    -
                  </button>
                  <span className="w-6 sm:w-8 text-center font-medium text-sm">
                    {selectedQuantities[itemId] || 1}
                  </span>
                  <button
                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs sm:text-sm min-w-[28px]"
                    onClick={() => onChangeQuantity(itemId, 1)}
                  >
                    +
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default function OrderDetailsModal({ order, onClose }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [message, setMessage] = useState(null);

  const allItems = order.items;
  const pendingItems = allItems.filter((item) => item.status === "pending");
  const preparingItems = allItems.filter((item) => item.status === "preparing");
  const servedItems = allItems.filter((item) => item.status === "served");
  const completedItems = allItems.filter((item) => item.status === "completed");
  const cancelledItems = allItems.filter((item) => item.status === "cancelled");

  const BASE_API =
    import.meta.env.VITE_API_BASE_URL || "http://192.168.1.98:3000/api/";
  const token = sessionStorage.getItem("token");

  const stackedCancelled = cancelledItems.reduce((acc, item) => {
    if (!acc[item.name]) acc[item.name] = { ...item };
    else acc[item.name].quantity += item.quantity;
    return acc;
  }, {});

  const selectItem = (itemId) => {
    setSelectedItems((prevSelected) => {
      const isSelected = prevSelected.includes(itemId);
      const newSelection = isSelected
        ? prevSelected.filter((id) => id !== itemId)
        : [...prevSelected, itemId];

      setSelectedQuantities((prevQuantities) => {
        const newQuantities = { ...prevQuantities };
        if (isSelected) {
          delete newQuantities[itemId];
        } else {
          newQuantities[itemId] = 1;
        }
        return newQuantities;
      });

      return newSelection;
    });
  };

  const selectAllItems = () => {
    const allItemIds = allItems.map(
      (item, index) => item._id?.$oid || item._id || `item-${index}`
    );
    if (selectedItems.length === allItemIds.length) {
      setSelectedItems([]);
      setSelectedQuantities({});
    } else {
      const newQuantities = allItemIds.reduce((acc, itemId, index) => {
        const item = allItems[index];
        acc[itemId] = item.quantity;
        return acc;
      }, {});
      setSelectedItems(allItemIds);
      setSelectedQuantities(newQuantities);
    }
  };

  const changeQuantity = (itemId, delta) => {
    const maxQty =
      allItems.find((item) => {
        const currentItemId = item._id?.$oid || item._id;
        return currentItemId === itemId;
      })?.quantity || 1;

    setSelectedQuantities((prevQuantities) => {
      const currentQty = prevQuantities[itemId] || 1;
      const newQty = Math.max(1, Math.min(currentQty + delta, maxQty));
      return {
        ...prevQuantities,
        [itemId]: newQty,
      };
    });
  };

  const updateStatus = async (status) => {
    if (selectedItems.length === 0) {
      setMessage({
        type: "error",
        text: "Please select at least one item to update.",
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // ✅ Only allow valid transitions
    const eligibleItems = allItems.filter((item) => {
      if (status === "preparing") return item.status === "pending";
      if (status === "served") return item.status === "preparing";
      if (status === "completed") return item.status === "served";
      if (status === "cancelled") return true;
      return false;
    });

    const itemUpdates = eligibleItems
      .filter((i) => selectedItems.includes(i._id?.$oid || i._id))
      .map((item) => ({
        itemId: item._id?.$oid || item._id,
        status,
        quantity: selectedQuantities[item._id?.$oid || item._id] || item.quantity,
      }));

    if (itemUpdates.length === 0) {
      setMessage({
        type: "error",
        text: `No items can be marked as ${status}.`,
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      await axios.put(
        `${BASE_API}order/${order._id}/status`,
        { itemUpdates },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      setMessage({
        type: "success",
        text: `Items successfully marked as ${status}.`,
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Update error:", err);
      setMessage({ type: "error", text: "Failed to update items." });
      setTimeout(() => setMessage(null), 3000);
    }

    setSelectedItems([]);
    setSelectedQuantities({});
  };

  const printOrder = () => {
    const content = document.getElementById("order-details-print").innerHTML;
    const w = window.open("", "", "width=800,height=600");
    w.document.write(
      `<html><head><title>Order Print</title></head><body>${content}</body></html>`
    );
    w.document.close();
    w.print();
  };

  const overallStatusStyles = getStatusStyles(order.status);
  const overallStatusDisplay =
    order.status.charAt(0).toUpperCase() + order.status.slice(1);

  const getButtonState = (targetStatus) => {
    if (selectedItems.length === 0) return true;

    const selectedItemDetails = selectedItems.map((id) => {
      const item = allItems.find((i) => (i._id?.$oid || i._id) === id);
      return item ? item.status : null;
    });

    switch (targetStatus) {
      case "preparing":
        return !selectedItemDetails.some((status) => status === "pending");
      case "served":
        return !selectedItemDetails.some((status) => status === "preparing");
      case "completed":
        return !selectedItemDetails.some((status) => status === "served");
      case "cancelled":
        return false;
      default:
        return false;
    }
  };

  const isAllItemsSelected =
    allItems.length > 0 && selectedItems.length === allItems.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="fixed inset-0 bg-transparent backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="bg-white bg-opacity-90 rounded-xl shadow-lg w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl p-3 sm:p-4 md:p-6 relative z-50 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {message && (
          <div
            className={`p-3 rounded-lg font-medium text-center mb-4 transition-opacity duration-300 ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Manage Order</h2>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={printOrder}
              title="Print Order"
              className="p-1 sm:p-2 hover:bg-gray-100 rounded"
            >
              <FaPrint className="text-sm sm:text-base" />
            </button>
            <button
              onClick={onClose}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded"
            >
              <FaTimes className="text-sm sm:text-base" />
            </button>
          </div>
        </div>
        <div id="order-details-print" className="mb-3 sm:mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
            <p className="text-gray-500">
              <strong>Table:</strong> {order.table?.tableNumber}
            </p>
            <p className="text-gray-500">
              <strong>Session:</strong> {order.sessionId.slice(0, 6)}
            </p>
            <p className="text-gray-500 sm:col-span-2">
              <strong>Created At:</strong>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </p>
            <p className={`sm:col-span-2 font-medium text-sm sm:text-base`}>
              <strong>Order Status:</strong>{" "}
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${overallStatusStyles.classes.replace(
                  "border-",
                  "text-"
                ).replace("bg-", "bg-")}`}
              >
                {overallStatusDisplay}
              </span>
            </p>
          </div>
          <p className="font-bold mt-2 text-gray-800 text-sm sm:text-base">
            <strong>Total:</strong> Rs. {order.totalAmount.toFixed(2)}
          </p>
        </div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-700 text-sm sm:text-base">
            Items
          </h3>
          <button
            onClick={selectAllItems}
            className="text-xs sm:text-sm text-blue-600 hover:underline"
          >
            {isAllItemsSelected ? "Deselect All" : "Select All"}
          </button>
        </div>
        <div className="max-h-80 sm:max-h-[70vh] overflow-y-auto">
          <StatusSection
            title="Pending Orders"
            items={pendingItems}
            onSelectItem={selectItem}
            selectedItems={selectedItems}
            selectedQuantities={selectedQuantities}
            onChangeQuantity={changeQuantity}
          />
          <StatusSection
            title="Preparing Items"
            items={preparingItems}
            onSelectItem={selectItem}
            selectedItems={selectedItems}
            selectedQuantities={selectedQuantities}
            onChangeQuantity={changeQuantity}
          />
          <StatusSection
            title="Served Items"
            items={servedItems}
            onSelectItem={selectItem}
            selectedItems={selectedItems}
            selectedQuantities={selectedQuantities}
            onChangeQuantity={changeQuantity}
          />
          <StatusSection
            title="Completed Items"
            items={completedItems}
            onSelectItem={selectItem}
            selectedItems={selectedItems}
            selectedQuantities={selectedQuantities}
            onChangeQuantity={changeQuantity}
          />
        </div>
        {Object.keys(stackedCancelled).length > 0 && (
          <div className="mb-4 sm:mb-6">
            <h3 className="font-medium text-red-600 mb-2 text-sm sm:text-base">
              Cancelled Items
            </h3>
            <ul className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto border-t pt-2">
              {Object.values(stackedCancelled).map((item, index) => {
                const itemId =
                  item._id?.$oid || item._id || `cancelled-item-${index}`;
                return (
                  <li
                    key={`cancelled-${itemId}`}
                    className="flex justify-between items-center p-2 rounded-lg border border-red-200 bg-red-50"
                  >
                    <span className="text-gray-700 text-sm truncate flex-1 mr-2">
                      {item.name}
                    </span>
                    <span className="text-xs text-red-600 font-medium flex-shrink-0">
                      ×{item.quantity}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {selectedItems.length > 0 ? (
            <>
              {["preparing", "served", "completed", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={getButtonState(status)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-initial min-w-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                    status === "preparing"
                      ? "bg-blue-100 hover:bg-blue-200 text-blue-800"
                      : status === "served"
                      ? "bg-green-100 hover:bg-green-200 text-green-800"
                      : status === "completed"
                      ? "bg-purple-100 hover:bg-purple-200 text-purple-800"
                      : "bg-red-100 hover:bg-red-200 text-red-800"
                  }`}
                >
                  <span className="hidden sm:inline">Mark as </span>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </>
          ) : (
            <p className="text-xs sm:text-sm text-gray-500">
              Select items to update status
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
