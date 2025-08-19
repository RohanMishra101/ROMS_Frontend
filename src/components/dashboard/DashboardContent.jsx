import React from "react";
import Analytics from "./dashboard_content/Analytics/Analytics";
import Orders from "./dashboard_content/Order/Order";
import FoodItems from "./dashboard_content/FoodItems";
import Tables from "./dashboard_content/Tables";

export default function DashboardContent({ activeComponent, socket }) {
  const componentMap = {
    Analytics: <Analytics />,
    Orders: socket ? <Orders socket={socket} /> : null,
    "Food Items": <FoodItems />,
    Table: <Tables />,
  };

  return <div className="flex-1 p-6 overflow-auto">{componentMap[activeComponent] || <Analytics />}</div>;
}
