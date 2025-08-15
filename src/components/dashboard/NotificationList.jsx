import React from "react";

export default function NotificationList({ activities }) {
  return (
    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-lg rounded-xl z-50">
      <div className="p-2 font-semibold border-b">Recent Activity</div>
      <div className="max-h-64 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-2 text-gray-500">No activity</div>
        ) : (
          activities.map((act, idx) => (
            <div
              key={idx}
              className="p-2 border-b hover:bg-gray-100 transition-colors rounded-tl-xl rounded-tr-xl"
            >
              {act.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}