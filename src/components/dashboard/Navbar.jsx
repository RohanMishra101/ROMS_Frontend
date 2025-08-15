import React, { useState } from "react";
import { FaBell } from "react-icons/fa";
import NotificationList from "./NotificationList";

export default function Navbar({ restaurantName, activities }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="flex items-center justify-between bg-white p-4 shadow-md">
      <div className="flex-1 text-center font-bold text-xl">
        {restaurantName}
      </div>
      <div className="relative">
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="text-gray-600 hover:text-gray-900 p-2 rounded-md transition-colors duration-300"
          style={{ backgroundColor: "transparent" }}
        >
          <FaBell size={22} />
        </button>
        {notificationsOpen && (
          <NotificationList activities={activities} />
        )}
      </div>
    </div>
  );
}