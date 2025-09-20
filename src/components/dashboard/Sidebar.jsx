import React, { useEffect, useState } from "react";
import {
  FaChartLine,
  FaShoppingCart,
  FaUtensils,
  FaTable,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  { name: "Analytics", icon: <FaChartLine /> },
  { name: "Orders", icon: <FaShoppingCart /> },
  { name: "Inventory", icon: <FaUtensils /> },
  { name: "Table", icon: <FaTable /> },
];

export default function Sidebar({ isOpen, setIsOpen, activeComponent, setActiveComponent }) {
  const { logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Handle screen size changes and responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // If switching from desktop to mobile, close desktop sidebar and mobile drawer
      if (mobile) {
        setMobileDrawerOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle menu item click
  const handleMenuClick = (itemName) => {
    setActiveComponent(itemName);
    // Close mobile drawer after selection
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  // Handle mobile hamburger menu toggle
  const handleMobileMenuToggle = () => {
    if (isMobile) {
      setMobileDrawerOpen(!mobileDrawerOpen);
    } else {
      setIsOpen(!isOpen);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobile && mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, mobileDrawerOpen]);

  return (
    <>
      {/* Desktop Sidebar - Only show on desktop */}
      <div
        className={`hidden md:flex bg-white border-r border-gray-200 shadow-sm flex-col transition-all duration-300 ease-in-out ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Desktop Header */}
        <div className={`flex items-center p-4 border-b border-gray-100 ${isOpen ? "justify-between" : "justify-center"}`}>
          {isOpen && (
            <h2 className="text-lg font-semibold text-gray-800 transition-opacity duration-200">
              Dashboard
            </h2>
          )}
          <button
            onClick={handleMobileMenuToggle}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
          >
            <FaBars size={18} />
          </button>
        </div>

        {/* Desktop Menu Items */}
        <nav className="flex flex-col flex-grow py-4">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveComponent(item.name)}
              className={`flex items-center mx-2 mb-1 p-3 rounded-xl transition-all duration-200 group ${
                isOpen ? "justify-start gap-3" : "justify-center"
              } ${
                activeComponent === item.name 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              }`}
              title={!isOpen ? item.name : undefined}
            >
              <span className={`text-lg transition-transform duration-200 ${activeComponent === item.name ? "" : "group-hover:scale-110"}`}>
                {item.icon}
              </span>
              <span
                className={`font-medium whitespace-nowrap transition-all duration-300 ${
                  isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 w-0 overflow-hidden"
                }`}
              >
                {item.name}
              </span>
            </button>
          ))}
        </nav>

        {/* Desktop Logout */}
        <div className="p-2 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full p-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group ${
              isOpen ? "justify-start gap-3" : "justify-center"
            }`}
            title={!isOpen ? "Logout" : undefined}
          >
            <span className="text-lg transition-transform duration-200 group-hover:scale-110">
              <FaSignOutAlt />
            </span>
            <span
              className={`font-semibold whitespace-nowrap transition-all duration-300 ${
                isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 w-0 overflow-hidden"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Only show on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 safe-area-pb">
        <div className="grid grid-cols-5 px-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleMenuClick(item.name)}
              className={`flex flex-col items-center justify-center py-3 px-2 transition-all duration-200 ${
                activeComponent === item.name 
                  ? "text-blue-600" 
                  : "text-gray-500 active:text-blue-600"
              }`}
            >
              <span className={`text-lg mb-1 transition-transform duration-200 ${
                activeComponent === item.name ? "scale-110" : ""
              }`}>
                {item.icon}
              </span>
              <span className="text-xs font-medium leading-tight text-center">
                {item.name}
              </span>
              {activeComponent === item.name && (
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full transition-all duration-200" />
              )}
            </button>
          ))}
          
          {/* Mobile Logout */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center py-3 px-2 text-red-500 active:text-red-600 transition-all duration-200"
          >
            <span className="text-lg mb-1 transition-transform duration-200 active:scale-110">
              <FaSignOutAlt />
            </span>
            <span className="text-xs font-medium leading-tight text-center">
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Hamburger Button - Hidden for better design */}
      {/* <button
        onClick={handleMobileMenuToggle}
        className={`md:hidden fixed top-4 left-4 z-50 p-3 bg-white border border-gray-200 rounded-xl shadow-md text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 ${
          mobileDrawerOpen ? "rotate-90" : ""
        }`}
      >
        {mobileDrawerOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
      </button> */}

      {/* Mobile Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          mobileDrawerOpen ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileDrawerOpen(false)}
      />

      {/* Mobile Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 bg-white shadow-xl z-50 w-72 max-w-[85vw] transform transition-transform duration-300 ease-out ${
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Menu</h2>
            <p className="text-sm text-gray-500 mt-1">Navigate your dashboard</p>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        <nav className="flex flex-col p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleMenuClick(item.name)}
              className={`flex items-center gap-4 w-full p-4 rounded-xl text-left transition-all duration-200 ${
                activeComponent === item.name 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
              }`}
            >
              <span className="text-xl">
                {item.icon}
              </span>
              <span className="font-medium text-base">
                {item.name}
              </span>
              {activeComponent === item.name && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Mobile Drawer Logout */}
        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full p-4 rounded-xl text-left text-red-600 hover:bg-red-50 active:bg-red-100 transition-all duration-200 border-t border-gray-100 pt-6"
          >
            <span className="text-xl">
              <FaSignOutAlt />
            </span>
            <span className="font-semibold text-base">
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Spacer for mobile bottom navigation */}
      <div className="md:hidden h-16" />
    </>
  );
}