import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

import Navbar from "./MenuComponent/Navbar";
import FoodItemCard from "./MenuComponent/FoodItemCard";
import CartSidebar from "./MenuComponent/CartSidebar";
import CurrentOrder from "./MenuComponent/CurrentOrder";
import Billing from "./MenuComponent/Billing";

console.log("📄 MenuPage.jsx loaded");

const API_BASE =
  import.meta.env.VITE_PUBLIC_API_BASE || "http://192.168.1.66:3000/api";

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurant");
  const tableNumber = searchParams.get("table");

  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("menu");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  // ✅ Initialize Socket
  useEffect(() => {
    if (restaurantId && tableNumber && !socket) {
      console.log("⚡ Initializing socket connection...");

      const SOCKET_BASE =
        import.meta.env.VITE_PUBLIC_API_BASE?.replace("/api", "") ||
        "http://192.168.1.66:3000";

      console.log("🔌 SOCKET_BASE:", SOCKET_BASE);
      console.log("📡 API_BASE:", API_BASE);
      console.log("Socket auth/query params:", {
        restaurantId,
        tableNumber,
        role: "customer",
      });

      const newSocket = io(SOCKET_BASE, {
        auth: {
          role: "customer",
          restaurantId,
          tableNumber,
        },
        query: {
          role: "customer",
          restaurantId,
          tableNumber,
        },
        transports: ["websocket", "polling"],
        forceNew: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 10000,
        autoConnect: true,
      });

      // ✅ Lifecycle Events
      newSocket.on("connect", () => {
        console.log("✅ Connected to server. Socket ID:", newSocket.id);
        setSocketConnected(true);
      });

      newSocket.on("disconnect", (reason) => {
        console.warn("❌ Socket disconnected:", reason);
        setSocketConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("❌ Connection error:", error.message, error);
        setSocketConnected(false);
      });

      newSocket.on("joinedRoom", (data) => {
        console.log("🏠 Joined room:", data);
      });

      // ✅ Order status updated
      newSocket.on("orderStatusUpdated", (updatedOrder) => {
        console.group("📩 orderStatusUpdated");
        console.log("Raw event data:", updatedOrder);
        console.log("Current orders (before):", orders);
        console.groupEnd();

        setOrders((prevOrders) => {
          const orderExists = prevOrders.find(
            (order) => order._id === updatedOrder._id
          );
          const newOrders = orderExists
            ? prevOrders.map((order) =>
              order._id === updatedOrder._id ? updatedOrder : order
            )
            : [...prevOrders, updatedOrder];

          console.group("🆕 Orders state after update");
          console.log(newOrders);
          console.groupEnd();

          return newOrders;
        });

        if (activeTab === "current order" || activeTab === "bill") {
          fetchOrders();
        }
      });

      // ✅ Alternative event
      newSocket.on("orderUpdated", (updatedOrders) => {
        console.group("📩 orderUpdated");
        console.log("Raw event data:", updatedOrders);
        console.groupEnd();

        if (Array.isArray(updatedOrders)) {
          console.log("Received full order list:", updatedOrders);
          setOrders(updatedOrders);
        } else {
          setOrders((prevOrders) => {
            const orderExists = prevOrders.find(
              (order) => order._id === updatedOrders._id
            );
            return orderExists
              ? prevOrders.map((order) =>
                order._id === updatedOrders._id ? updatedOrders : order
              )
              : [...prevOrders, updatedOrders];
          });
        }
      });

      // ✅ Error/reconnect events
      newSocket.on("error", (error) => {
        console.error("🔥 Socket error:", error);
      });

      newSocket.on("reconnect", (attemptNumber) => {
        console.log("🔄 Reconnected after", attemptNumber, "attempts");
        setSocketConnected(true);
      });

      newSocket.on("reconnect_attempt", (attemptNumber) => {
        console.log("🔄 Reconnection attempt:", attemptNumber);
      });

      newSocket.on("reconnect_error", (error) => {
        console.error("🔄 Reconnection error:", error);
      });

      newSocket.on("reconnect_failed", () => {
        console.error("🔄 Reconnection failed");
        setSocketConnected(false);
      });

      setSocket(newSocket);

      return () => {
        console.log("🧹 Cleaning up socket connection");
        if (newSocket && newSocket.connected) {
          newSocket.disconnect();
        }
      };
    }
  }, [restaurantId, tableNumber]);

  // ✅ Fetch menu
  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await axios.get(`${API_BASE}/public/food/${restaurantId}`);
        const availableItems = Array.isArray(res.data)
          ? res.data.filter((item) => item.availability)
          : [];
        setMenuItems(availableItems);
      } catch (err) {
        console.error("❌ Failed to fetch menu:", err);
        setMenuItems([]);
      }
    }
    if (restaurantId) fetchMenu();
  }, [restaurantId]);

  // ✅ Fetch orders
  const fetchOrders = async () => {
    if (!tableNumber || !restaurantId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/public/order/${restaurantId}/${tableNumber}`
      );
      console.log("📥 Orders fetched from API:", res.data);
      setOrders(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "current order" || activeTab === "bill") {
      fetchOrders();
    }
  }, [activeTab, tableNumber, restaurantId]);

  // ✅ Cart logic
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const addToCart = (item, quantity) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        return [...prev, { ...item, quantity }];
      }
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      setCartItems(cartItems.filter((item) => item._id !== itemId));
      return;
    }
    setCartItems(
      cartItems.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const confirmOrder = async () => {
    if (cartItems.length === 0) return;
    if (!tableNumber) return alert("Table number is missing. Please check the URL.");
    if (!restaurantId) return alert("Restaurant info missing.");

    const orderData = {
      tableNumber,
      items: cartItems.map((item) => ({
        foodId: item._id,
        quantity: item.quantity,
      })),
    };

    try {
      await axios.post(`${API_BASE}/order/${restaurantId}/create`, orderData);
      alert("✅ Order confirmed!");
      setCartItems([]);
      setIsCartOpen(false);
      if (activeTab === "current order" || activeTab === "bill") fetchOrders();
    } catch (err) {
      console.error("❌ Failed to confirm order:", err);
      if (err.response?.status === 404) {
        alert("Order endpoint not found. Please check backend.");
      } else {
        alert(
          `Failed to confirm order: ${err.response?.data?.message || err.message
          }`
        );
      }
    }
  };

  // ✅ Category filter
  const categories = [
    ...new Set(menuItems.map((item) => item.category).filter(Boolean)),
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory =
      !selectedCategory || item.category === selectedCategory;

    const q = searchQuery?.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  // ✅ Render tabs
  const renderContent = () => {
    switch (activeTab) {
      case "menu":
        return (
          <div className="flex-1 md:mr-96 overflow-y-auto p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredMenuItems.length > 0 ? (
                filteredMenuItems.map((item) => (
                  <FoodItemCard
                    key={item._id}
                    item={item}
                    addToCart={addToCart}
                    cartQuantity={
                      cartItems.find((ci) => ci._id === item._id)?.quantity || 0
                    }
                    updateQuantity={updateQuantity}
                  />
                ))
              ) : (
                <p className="text-center text-gray-500 col-span-full">
                  No items found
                </p>
              )}
            </div>
          </div>
        );
      case "current order":
        return (
          <CurrentOrder
            tableNumber={tableNumber}
            orders={orders}
            refreshOrders={fetchOrders}
            loading={loading}
            socket={socket}
            socketConnected={socketConnected}
          />
        );
      case "bill":
        return <Billing tableNumber={tableNumber} orders={orders} />;
      default:
        return null;
    }
  };

  // ✅ Main render
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleCart={toggleCart}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        cartCount={cartItems.reduce((sum, i) => sum + i.quantity, 0)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        socketConnected={socketConnected}
      />

      <div className="flex flex-1">
        {renderContent()}

        {activeTab === "menu" && (
          <CartSidebar
            cartItems={cartItems}
            setCartItems={setCartItems}
            isOpen={isCartOpen}
            toggleCart={toggleCart}
            confirmOrder={confirmOrder}
            updateQuantity={updateQuantity}
            setIsCartOpen={setIsCartOpen} // 👈 added
          />

        )}
      </div>
    </div>
  );
}
