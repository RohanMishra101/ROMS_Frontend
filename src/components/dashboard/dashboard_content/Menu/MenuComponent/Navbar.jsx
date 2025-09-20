// Navbar.jsx
import React, { useState, useEffect } from "react";
import { FiShoppingCart, FiFilter, FiX, FiSearch, FiChevronDown } from "react-icons/fi";

export default function Navbar({
  activeTab,
  setActiveTab,
  toggleCart,
  categories,
  selectedCategory,
  setSelectedCategory,
  cartCount,
  searchQuery,
  setSearchQuery,
}) {
  const [showFilter, setShowFilter] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Disable body scroll when mobile panels are open
  useEffect(() => {
    if (showFilter || showSearch) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    };
  }, [showFilter, showSearch]);

  return (
    <>
      <nav className="bg-white shadow-md px-4 py-3 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50">
        {/* Logo/Brand */}
        <div className="hidden md:block text-xl font-bold">Restaurant Menu</div>

        {/* Tabs */}
        <div className="flex space-x-4 md:space-x-6 mb-3 md:mb-0">
          {["menu", "current order", "bill"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-medium text-sm md:text-lg capitalize px-3 py-2 rounded-lg transition-all ${
                activeTab === tab
                  ? "text-white bg-black shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          {/* Mobile Action Buttons */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors shadow-sm"
              aria-label="Search"
            >
              <FiSearch size={20} className="text-gray-600" />
            </button>

            <button
              onClick={() => setShowFilter(!showFilter)}
              className="p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors shadow-sm"
              aria-label="Filter"
            >
              <FiFilter size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Desktop Filter + Search */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Category Filter */}
            <div className="relative">
              <select
                className="border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent appearance-none pr-8"
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
              <FiChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
            </div>

            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent w-56"
              />
            </div>
          </div>

          {/* Cart */}
          <button
            onClick={toggleCart}
            className="relative p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center transition-colors shadow-sm"
            aria-label="Shopping cart"
          >
            <FiShoppingCart size={20} className="text-gray-600" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full font-medium shadow-md">
                {cartCount}
              </span>
            )}
            <span className="hidden md:inline ml-2 font-medium">Cart</span>
          </button>
        </div>
      </nav>

      {/* Mobile Search Panel */}
      {showSearch && (
        <div className="fixed inset-0 bg-white z-50 md:hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Search Menu</h2>
            <button 
              onClick={() => setShowSearch(false)}
              className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Close search"
            >
              <FiX size={24} className="text-gray-600" />
            </button>
          </div>
          
          {/* Search Input */}
          <div className="p-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent w-full text-lg"
                autoFocus
              />
            </div>
          </div>

          {/* Recent Searches (optional) */}
          <div className="px-4 mt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Recent searches</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm">Pizza</span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm">Burger</span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm">Pasta</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Panel */}
      {showFilter && (
        <div className="fixed inset-0 bg-white z-50 md:hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Filter by Category</h2>
            <button 
              onClick={() => setShowFilter(false)}
              className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Close filter"
            >
              <FiX size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Category Selection */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setShowFilter(false);
                }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedCategory === "" 
                    ? "border-black bg-gray-50 font-medium" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                All Categories
              </button>
              
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setShowFilter(false);
                  }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedCategory === cat 
                      ? "border-black bg-gray-50 font-medium" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <button
              onClick={() => setShowFilter(false)}
              className="w-full bg-black text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 active:bg-gray-900 transition-colors shadow-md"
            >
              Apply Filter
            </button>
          </div>
        </div>
      )}

      {/* Overlay for mobile panels */}
      {(showFilter || showSearch) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => {
            setShowFilter(false);
            setShowSearch(false);
          }}
        ></div>
      )}
    </>
  );
}