import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

import Navbar from "./MenuComponent/Navbar";
import FoodItemCard from "./MenuComponent/FoodItemCard";
import CartSidebar from "./MenuComponent/CartSidebar";
import CurrentOrder from "./MenuComponent/CurrentOrder";
import Billing from "./MenuComponent/Billing";


console.log("This is a menu page");

const API_BASE =
  import.meta.env.VITE_PUBLIC_API_BASE || "http://192.168.1.98:3000/api";

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurant");
  const tableNumber = searchParams.get("table");

  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("menu");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch menu items
  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await axios.get(`${API_BASE}/public/food/${restaurantId}`);
        const availableItems = res.data.filter((item) => item.availability);
        setMenuItems(availableItems);
      } catch (err) {
        console.error("Failed to fetch menu:", err);
      }
    }
    if (restaurantId) fetchMenu();
  }, [restaurantId]);

  // Fetch orders
  const fetchOrders = async () => {
    if (!tableNumber || !restaurantId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/public/order/${restaurantId}/${tableNumber}`);
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch orders when current order or bill tab is active
  useEffect(() => {
    if (activeTab === "current order" || activeTab === "bill") {
      fetchOrders();
    }
  }, [activeTab, tableNumber, restaurantId]);

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
      setCartItems(cartItems.filter(item => item._id !== itemId));
      return;
    }
    setCartItems(
      cartItems.map(item =>
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
      alert("Order confirmed!");
      setCartItems([]);
      setIsCartOpen(false);
      if (activeTab === "current order" || activeTab === "bill") fetchOrders();
    } catch (err) {
      console.error("Failed to confirm order:", err);
      if (err.response?.status === 404) {
        alert("Order endpoint not found. Please check backend.");
      } else {
        alert(`Failed to confirm order: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const categories = [
    ...new Set(menuItems.map((item) => item.category).filter(Boolean)),
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "menu":
        return (
          <div className="flex-1 md:mr-96 overflow-y-auto p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {menuItems
                .filter(item => !selectedCategory || item.category === selectedCategory)
                .map((item) => (
                  <FoodItemCard
                    key={item._id}
                    item={item}
                    addToCart={addToCart}
                    cartQuantity={cartItems.find(ci => ci._id === item._id)?.quantity || 0}
                    updateQuantity={updateQuantity}
                  />
                ))}
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
          />
        );
      case "bill":
        return (
          <Billing
            tableNumber={tableNumber}
            orders={orders}
          />
        );
      default:
        return null;
    }
  };

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
          />
        )}
      </div>
    </div>
  );
}
