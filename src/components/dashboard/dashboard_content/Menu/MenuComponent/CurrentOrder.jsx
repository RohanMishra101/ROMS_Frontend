import React, { useState } from "react";
import { FiClock, FiRefreshCw, FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import axios from "axios";

const API_BASE = import.meta.env.VITE_PUBLIC_API_BASE || "http://localhost:3000/api/public/";

export default function CurrentOrder({ tableNumber, orders, refreshOrders, loading }) {
  const [selectedItems, setSelectedItems] = useState({});
  const [cancelling, setCancelling] = useState(false);

  const toggleItemSelection = (orderId, itemIndex) => {
    setSelectedItems(prev => {
      const key = `${orderId}-${itemIndex}`;
      const newSelection = { ...prev };
      
      if (newSelection[key]) {
        delete newSelection[key];
      } else {
        newSelection[key] = { orderId, itemIndex };
      }
      
      return newSelection;
    });
  };

  const selectAllItems = (orderId, items) => {
    setSelectedItems(prev => {
      const newSelection = { ...prev };
      
      // Toggle: if all items are already selected, deselect all
      const allSelected = items.every((_, index) => newSelection[`${orderId}-${index}`]);
      
      if (allSelected) {
        items.forEach((_, index) => {
          delete newSelection[`${orderId}-${index}`];
        });
      } else {
        items.forEach((_, index) => {
          newSelection[`${orderId}-${index}`] = { orderId, itemIndex: index };
        });
      }
      
      return newSelection;
    });
  };

  const getSelectedItemsCount = (orderId) => {
    return Object.values(selectedItems).filter(item => item.orderId === orderId).length;
  };

  const handleCancelSelectedItems = async (orderId) => {
    const itemsToCancel = Object.values(selectedItems)
      .filter(item => item.orderId === orderId)
      .sort((a, b) => a.itemIndex - b.itemIndex);
    
    if (itemsToCancel.length === 0) return;
    
    setCancelling(true);
    try {
      const orderResponse = await axios.get(`${API_BASE}/order/${orderId}`);
      const order = orderResponse.data;
      
      // Remove selected items
      const updatedItems = order.items.filter((_, index) => 
        !itemsToCancel.some(item => item.itemIndex === index)
      );
      
      if (updatedItems.length === 0) {
        // Cancel entire order if no items left
        await axios.put(`${API_BASE}/order/${orderId}/status`, { status: "cancelled" });
      } else {
        // Recalculate total and update order
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        await axios.put(`${API_BASE}/order/${orderId}`, {
          items: updatedItems,
          totalAmount: newTotal
        });
      }
      
      // Clear selection after successful cancellation
      setSelectedItems(prev => {
        const newSelection = { ...prev };
        itemsToCancel.forEach(item => {
          delete newSelection[`${orderId}-${item.itemIndex}`];
        });
        return newSelection;
      });
      
      refreshOrders();
    } catch (err) {
      console.error("Failed to cancel items:", err);
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelEntireOrder = async (orderId) => {
    setCancelling(true);
    try {
      await axios.put(`${API_BASE}/order/${orderId}/status`, { status: "cancelled" });
      refreshOrders();
    } catch (err) {
      console.error("Failed to cancel order:", err);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'served': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const activeOrders = orders.filter(order => order.status !== 'cancelled' && order.status !== 'served');

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Current Orders</h2>
            <p className="text-gray-600">Table {tableNumber}</p>
          </div>
          <button
            onClick={refreshOrders}
            disabled={loading || cancelling}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} size={16} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <p className="mt-2 text-gray-600">Loading orders...</p>
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <FiClock size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Orders</h3>
            <p className="text-gray-600">Your current orders will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map(order => {
              const selectedCount = getSelectedItemsCount(order._id);
              const totalItems = order.items.length;
              
              return (
                <div key={order._id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Ordered at {formatTime(order.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Order ID: {order._id.slice(-8)}</p>
                    </div>
                    
                    {order.status === 'pending' && (
                      <div className="flex items-center space-x-3">
                        {selectedCount > 0 && (
                          <span className="text-sm text-blue-600">
                            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                          </span>
                        )}
                        <button
                          onClick={() => selectAllItems(order._id, order.items)}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded transition-colors"
                        >
                          {selectedCount === totalItems ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Order Items:</h4>
                    
                    <div className="space-y-2">
                      {order.items.map((item, index) => {
                        const isSelected = !!selectedItems[`${order._id}-${index}`];
                        
                        return (
                          <div
                            key={index}
                            className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-blue-50 border border-blue-200' 
                                : 'hover:bg-gray-50 border border-transparent'
                            }`}
                            onClick={() => order.status === 'pending' && toggleItemSelection(order._id, index)}
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              {order.status === 'pending' && (
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  isSelected 
                                    ? 'bg-blue-600 border-blue-600' 
                                    : 'border-gray-300'
                                }`}>
                                  {isSelected && <FiCheck size={12} className="text-white" />}
                                </div>
                              )}
                              
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.name}</p>
                                {item.notes && (
                                  <p className="text-sm text-gray-500 italic">Note: {item.notes}</p>
                                )}
                                <p className="text-sm text-gray-600">Rs. {item.price.toFixed(2)} each</p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="font-medium">× {item.quantity}</p>
                              <p className="text-sm text-gray-600">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="border-t pt-3 mt-3 flex justify-between items-center">
                      <span className="font-bold text-lg">Total:</span>
                      <span className="font-bold text-lg">Rs. {order.totalAmount.toFixed(2)}</span>
                    </div>

                    {/* Action Buttons */}
                    {order.status === 'pending' && (
                      <div className="border-t pt-4 mt-4 flex justify-between items-center">
                        <div>
                          {selectedCount > 0 ? (
                            <span className="text-sm text-gray-600">
                              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected for cancellation
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">Select items to cancel</span>
                          )}
                        </div>
                        
                        <div className="flex space-x-3">
                          {selectedCount > 0 && (
                            <button
                              onClick={() => handleCancelSelectedItems(order._id)}
                              disabled={cancelling}
                              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              {cancelling ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <FiX size={16} />
                              )}
                              <span>Cancel Selected ({selectedCount})</span>
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleCancelEntireOrder(order._id)}
                            disabled={cancelling}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                          >
                            <FiTrash2 size={16} />
                            <span>Cancel Entire Order</span>
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