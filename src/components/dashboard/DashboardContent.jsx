import React from "react";
import Analytics from "./dashboard_content/Analytics";
import Orders from "./dashboard_content/Order";
import FoodItems from "./dashboard_content/FoodItems";
import Tables from "./dashboard_content/Tables";

const componentMap = {
  Analytics: <Analytics />,
  Orders: <Orders />,
  "Food Items": <FoodItems />,
  Table: <Tables />,
};

export default function DashboardContent({ activeComponent }) {
  return (
    <div className="flex-1 p-6 overflow-auto">
      {componentMap[activeComponent] || <Analytics />}
    </div>
  );
}