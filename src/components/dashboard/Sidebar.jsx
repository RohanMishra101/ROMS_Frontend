import React from "react";
import {
  FaChartLine,
  FaShoppingCart,
  FaUtensils,
  FaTable,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  { name: "Analytics", icon: <FaChartLine /> },
  { name: "Orders", icon: <FaShoppingCart /> },
  { name: "Food Items", icon: <FaUtensils /> },
  { name: "Table", icon: <FaTable /> },
];

export default function Sidebar({ isOpen, setIsOpen, activeComponent, setActiveComponent }) {
  const { logout } = useAuth();

  return (
    <div
      className={`bg-white border-r border-gray-200 shadow-lg flex flex-col ${
        isOpen ? "w-64" : "w-20"
      } transition-[width] duration-300 ease-in-out`}
    >
      {/* Sidebar Header */}
      <div className={`flex items-center p-4 border-b ${isOpen ? "justify-end" : "justify-center"}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-600 hover:text-gray-900 p-2 rounded-md"
        >
          <FaBars size={22} />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex flex-col flex-grow p-2">
        {menuItems.map((item) => (
          <div
            key={item.name}
            onClick={() => setActiveComponent(item.name)}
            className={`flex items-center cursor-pointer hover:bg-blue-100 rounded-md p-3 ${
              isOpen ? "gap-4 justify-start" : "justify-center"
            } ${activeComponent === item.name ? "bg-blue-200" : ""} transition-colors duration-200`}
          >
            <span className="text-2xl min-w-[24px] flex justify-center">
              {item.icon}
            </span>
            <span
              className={`whitespace-nowrap ${
                isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
              } transition-all duration-300 overflow-hidden`}
            >
              {item.name}
            </span>
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div
        onClick={() => logout()}
        className={`flex items-center cursor-pointer hover:bg-red-100 rounded-md m-2 p-3 ${
          isOpen ? "gap-4 justify-start" : "justify-center"
        } transition-colors duration-200`}
      >
        <span className="text-2xl text-red-500 min-w-[24px] flex justify-center">
          <FaSignOutAlt />
        </span>
        <span
          className={`whitespace-nowrap ${
            isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
          } transition-all duration-300 overflow-hidden`}
        >
          <span className="font-semibold text-lg text-red-500">Logout</span>
        </span>
      </div>
    </div>
  );
}