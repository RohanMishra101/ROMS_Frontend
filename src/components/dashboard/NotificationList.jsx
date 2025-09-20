import React, { useEffect, useRef } from "react";
import { FaBell, FaTimes } from "react-icons/fa";

export default function NotificationList({ activities, onClose }) {
  const popupRef = useRef(null);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={popupRef}
      className="absolute right-0 mt-3 w-80 md:w-96 rounded-2xl shadow-xl z-50
                 bg-white/30 backdrop-blur-md border border-white/20 animate-fade-in"
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/20">
        <div className="flex items-center gap-1 text-blue-600 font-medium text-sm">
          <FaBell /> Notifications
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes />
        </button>
      </div>

      {/* Content */}
      <div className="h-96 overflow-y-auto divide-y divide-white/20">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            <p>No new notifications.</p>
          </div>
        ) : (
          activities.map((act, idx) => (
            <div
              key={idx}
              className="p-4 hover:bg-white/40 transition-colors cursor-pointer"
            >
              <p className="font-medium text-gray-900">{act.message}</p>
              <p className="text-xs text-gray-600 mt-1">
                {act.createdAt
                  ? new Date(act.createdAt).toLocaleString()
                  : "-"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Status: {act.status}</p>
              <p className="text-xs text-gray-500 mt-1">
                Table: {act.tableNumber}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
