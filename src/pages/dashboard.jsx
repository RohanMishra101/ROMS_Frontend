import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import DashboardContent from "../components/dashboard/DashboardContent";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_SOCKET_URL || "http://192.168.1.98:3000";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeComponent, setActiveComponent] = useState("Analytics");
  const [activities, setActivities] = useState([]);
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?.restaurant?.id || socketRef.current) return;

    const token = sessionStorage.getItem("token");

    socketRef.current = io(API_BASE, {
      transports: ["websocket", "polling"],
      auth: { role: "admin", restaurantId: user.restaurant.id, token },
    });

    const socket = socketRef.current;

    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("joinedRoom", (data) => console.log("Joined room:", data));

    // Listen to new order notifications
    // socket.on("new-notification", (notification) => {
    //   setActivities((prev) => [notification, ...prev]);
    // });

    return () => {
      if (socket.connected) socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.restaurant?.id]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar restaurantName={user?.restaurant?.name || "Restaurant Name"} activities={activities} />
        <div className="flex-1 overflow-y-auto">
          <DashboardContent activeComponent={activeComponent} socket={socketRef.current} />
        </div>
      </div>
    </div>
  );
}
