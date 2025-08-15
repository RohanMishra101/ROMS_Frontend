import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import DashboardContent from "../components/dashboard/DashboardContent";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeComponent, setActiveComponent] = useState("Analytics");
  const [activities, setActivities] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/recent-activity");
        setActivities(res.data);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
      />
      
      <div className="flex-1 flex flex-col">
        <Navbar 
          restaurantName={user?.restaurantName || "Restaurant Name"} 
          activities={activities}
        />
        
        <DashboardContent activeComponent={activeComponent} />
      </div>
    </div>
  );
}