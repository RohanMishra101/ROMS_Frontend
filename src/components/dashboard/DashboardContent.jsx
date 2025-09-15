import React from "react";
import Analytics from "./dashboard_content/Analytics/Analytics";
import Orders from "./dashboard_content/Order/Order";
// import Inventory from "./dashboard_content/Inventory/InventoryComponents/Inventory";
import FoodInventory from "./dashboard_content/Inventory/FoodInventory";
// import Tables from "./dashboard_content/Tables";
import Tables from "./dashboard_content/Table/Tables";

export default function DashboardContent({ activeComponent, socket }) {
  const componentMap = {
    Analytics: <Analytics />,
    Orders: socket ? <Orders socket={socket} /> : null,
    Inventory: <FoodInventory />,
    Table: <Tables />,
    // Menu: <AdminMenu  socket={socket}/>
  };  

  return <div className="flex-1 p-6 overflow-auto">{componentMap[activeComponent] || <Analytics />}</div>;
}
