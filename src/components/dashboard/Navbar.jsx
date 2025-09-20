import React, { useState, useEffect } from "react";
// import { FaBell } from "react-icons/fa";
// import NotificationList from "./NotificationList";

export default function Navbar({ restaurantName, activities }) {
  // const [notificationsOpen, setNotificationsOpen] = useState(false);
  // const [unreadCount, setUnreadCount] = useState(0);

  // // Update unread count
  // useEffect(() => {
  //   setUnreadCount(activities.length);
  // }, [activities]);

  // const toggleNotifications = () => {
  //   setNotificationsOpen((prev) => !prev);
  //   setUnreadCount(0); // reset unread count when opened
  // };

  return (
    <div className="flex items-center justify-between bg-white p-4 shadow-md sticky top-0 z-40">
      <div className="text-xl font-bold text-gray-800">{restaurantName}</div>

      {/* Notification section commented out */}
      {/* <div className="relative">
        <button
          onClick={toggleNotifications}
          className="relative text-gray-600 hover:text-gray-900 p-2 rounded-full transition-colors duration-300"
        >
          <FaBell size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold transform translate-x-1/2 -translate-y-1/2">
              {unreadCount}
            </span>
          )}
        </button>
        {notificationsOpen && (
          <NotificationList
            activities={activities}
            onClose={() => setNotificationsOpen(false)}
          />
        )}
      </div> */}
    </div>
  );
}
