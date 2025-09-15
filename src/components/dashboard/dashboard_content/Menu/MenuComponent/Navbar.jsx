// Navbar.jsx
import React, { useState } from "react";
import { FiShoppingCart, FiFilter, FiX } from "react-icons/fi";

export default function Navbar({
  activeTab,
  setActiveTab,
  toggleCart,
  categories,
  selectedCategory,
  setSelectedCategory,
  cartCount,
}) {
  const [showFilter, setShowFilter] = useState(false);

  return (
    <>
      <nav className="bg-white shadow-md px-4 py-3 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50">
        {/* Logo/Brand */}
        <div className="hidden md:block text-xl font-bold">Restaurant Menu</div>
        
        {/* Tabs - Centered */}
        <div className="flex space-x-4 md:space-x-6 mb-3 md:mb-0">
          {["menu", "current order", "bill"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-medium text-sm md:text-lg capitalize px-2 py-1 rounded ${
                activeTab === tab
                  ? "text-white bg-black"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right: Filter + Cart */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          {/* Mobile Filter Button */}
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className="md:hidden p-2 rounded-lg bg-gray-100"
          >
            <FiFilter size={20} />
          </button>
          
          {/* Desktop Filter */}
          <div className="hidden md:block">
            <select
              className="border px-3 py-2 rounded-lg"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Cart */}
          <button
            onClick={toggleCart}
            className="relative p-2 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center"
          >
            <FiShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
            <span className="hidden md:inline ml-2">Cart</span>
          </button>
        </div>
      </nav>
      
      {/* Mobile Filter Dropdown */}
      {showFilter && (
        <div className="bg-white p-4 shadow-md md:hidden">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Filter by Category</h3>
            <button onClick={() => setShowFilter(false)}>
              <FiX size={18} />
            </button>
          </div>
          <select
            className="w-full border px-3 py-2 rounded-lg"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setShowFilter(false);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}