import React, { useState } from "react";
import { FiRefreshCw, FiChevronDown } from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

const periods = [
  { key: "30days", label: "30 Days" },
  { key: "6months", label: "6 Months" },
  { key: "1year", label: "1 Year" },
];

const RevenueCard = ({ data = {}, onRefresh }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("30days");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const periodData = data[selectedPeriod] || {};
  const {
    totalRevenue = 0,
    avgDailyRevenue = 0,
    peakHour = null,
    peakHourRevenue = 0,
    revenueByCategory = [],
    revenuePerDay = [],
    trend = "up",
    change = "0%",
  } = periodData;

  const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "Rs 0";
    if (value >= 1000000) return `Rs ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `Rs ${(value / 1000).toFixed(1)}K`;
    return `Rs ${Math.round(value)}`;
  };

  const processedDailyData = revenuePerDay.map((day) => ({
    ...day,
    displayValue: formatCurrency(day.revenue),
    shortDate: day.date.split("-")[2],
  }));

  const processedCategoryData = [...revenueByCategory]
    .sort((a, b) => b.revenue - a.revenue)
    .map((cat) => ({ ...cat, displayValue: formatCurrency(cat.revenue) }));

  // Handle period selection for mobile
  const handlePeriodSelect = (key) => {
    setSelectedPeriod(key);
    setShowMobileMenu(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6 w-full overflow-hidden">
      {/* Header & Period Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Revenue Analytics</h1>
          <p className="text-sm md:text-md text-gray-500 mt-1">
            Performance Overview • {periods.find((p) => p.key === selectedPeriod)?.label}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full sm:w-auto">
          {/* Mobile dropdown menu */}
          <div className="sm:hidden relative w-full">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 rounded-lg text-gray-700 font-medium"
            >
              <span>{periods.find((p) => p.key === selectedPeriod)?.label}</span>
              <FiChevronDown className={`transition-transform ${showMobileMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showMobileMenu && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {periods.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => handlePeriodSelect(p.key)}
                    className={`w-full text-left px-4 py-3 text-sm ${
                      selectedPeriod === p.key
                        ? "bg-blue-100 text-blue-800"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Desktop period buttons */}
          <div className="hidden sm:flex gap-2">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => setSelectedPeriod(p.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  selectedPeriod === p.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          
          <button
            onClick={onRefresh}
            className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg sm:rounded-full transition-all flex items-center justify-center sm:ml-2 mt-2 sm:mt-0"
            aria-label="Refresh data"
          >
            <FiRefreshCw className="w-5 h-5" />
            <span className="ml-2 sm:hidden">Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subValue={`${trend === "up" ? "▲" : "▼"} ${change}`}
          icon="💰"
          accentColor="bg-blue-100 text-blue-800"
          trend={trend}
        />
        <MetricCard
          title="Daily Average"
          value={formatCurrency(avgDailyRevenue)}
          icon="📈"
          accentColor="bg-green-100 text-green-800"
        />
        <MetricCard
          title="Peak Hour"
          value={peakHour ? `${peakHour}:00` : "--:--"}
          subValue={`Revenue: ${formatCurrency(peakHourRevenue)}`}
          icon="⏰"
          accentColor="bg-purple-100 text-purple-800"
        />
        <MetricCard
          title="Top Category"
          value={revenueByCategory[0]?.category || "N/A"}
          subValue={revenueByCategory[0]?.displayValue || ""}
          icon="🏆"
          accentColor="bg-amber-100 text-amber-800"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        {/* Daily Revenue */}
        <ChartContainer title="Daily Revenue Trend" value={formatCurrency(totalRevenue)}>
          {processedDailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300} className="text-xs">
              <BarChart
                data={processedDailyData}
                margin={{ top: 20, right: 10, left: 0, bottom: 10 }}
                barSize={Math.min(40, Math.max(50, 400 / processedDailyData.length))}
              >
                <XAxis
                  dataKey="shortDate"
                  tick={{ fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  interval={Math.ceil(processedDailyData.length / 10)} // Prevent label overcrowding
                />
                <YAxis
                  width={60}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => {
                    // Simplified labels for mobile
                    if (window.innerWidth < 640) {
                      if (value >= 1000000) return `Rs${(value / 1000000).toFixed(0)}M`;
                      if (value >= 1000) return `Rs${(value / 1000).toFixed(0)}K`;
                    }
                    return formatCurrency(value);
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), "Revenue"]}
                  labelFormatter={(label) => `Day ${label}`}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: "8px",
                    padding: "8px",
                    border: "none",
                    boxShadow: "0 2px 15px rgba(0,0,0,0.1)",
                    fontWeight: 500,
                  }}
                />
                <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
                  {processedDailyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <LabelList
                    dataKey="displayValue"
                    position="top"
                    fontSize={10}
                    fontWeight={600}
                    fill="#374151"
                    offset={5}
                    // Only show labels if there's enough space
                    formatter={(value) => window.innerWidth > 640 ? value : null}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartContainer>

        {/* Category Revenue */}
        <ChartContainer
          title="Revenue by Category"
          value={`${revenueByCategory.length} Categories`}
        >
          {processedCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300} className="text-xs">
              <BarChart
                data={processedCategoryData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                barSize={30}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => {
                    // Simplified labels for mobile
                    if (window.innerWidth < 640) {
                      if (value >= 1000000) return `Rs${(value / 1000000).toFixed(0)}M`;
                      if (value >= 1000) return `Rs${(value / 1000).toFixed(0)}K`;
                    }
                    return formatCurrency(value);
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={80}
                  tick={{ fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => {
                    // Truncate long category names on mobile
                    if (window.innerWidth < 640 && value.length > 12) {
                      return value.substring(0, 10) + '...';
                    }
                    return value;
                  }}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), "Revenue"]}
                  labelFormatter={(label) => label}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: "8px",
                    padding: "8px",
                    border: "none",
                    boxShadow: "0 2px 15px rgba(0,0,0,0.1)",
                    fontWeight: 500,
                  }}
                />
                <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]}>
                  {processedCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <LabelList
                    dataKey="displayValue"
                    position="right"
                    fontSize={10}
                    fontWeight={600}
                    fill="#374151"
                    offset={5}
                    // Only show labels if there's enough space
                    formatter={(value) => window.innerWidth > 640 ? value : null}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartContainer>
      </div>
    </div>
  );
};

// Metric Card - Optimized for mobile
const MetricCard = ({ title, value, subValue, icon, trend, accentColor }) => {
  const trendColor = trend === "up" ? "text-green-600" : "text-red-600";
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-shadow h-full">
      <div className="flex items-start justify-between h-full">
        <div className="flex-1">
          <p className="text-xs xs:text-sm font-medium text-gray-500 mb-1 xs:mb-2">{title}</p>
          <p className="text-lg xs:text-xl font-bold text-gray-800 break-words">{value}</p>
          {subValue && (
            <p className={`text-xs xs:text-sm mt-1 ${trend ? trendColor : "text-gray-600"}`}>
              {subValue}
            </p>
          )}
        </div>
        {icon && (
          <span className="text-2xl p-2 xs:p-3 rounded-lg bg-opacity-20 ml-2">{icon}</span>
        )}
      </div>
    </div>
  );
};

// Chart Container
const ChartContainer = ({ title, value, children }) => (
  <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 shadow-xs h-full">
    <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center mb-2 gap-2 xs:gap-0">
      <h3 className="text-base md:text-lg font-semibold text-gray-800">{title}</h3>
      {value && <span className="text-xs md:text-sm font-medium text-gray-500">{value}</span>}
    </div>
    {children}
  </div>
);

// Empty State
const EmptyState = () => (
  <div className="h-64 flex flex-col items-center justify-center p-4">
    <div className="text-4xl md:text-5xl mb-2 md:mb-4">📊</div>
    <p className="text-sm md:text-lg text-gray-500 font-medium text-center">No data available</p>
    <p className="text-xs md:text-sm text-gray-400 mt-1 text-center">Try refreshing or check back later</p>
  </div>
);

export default RevenueCard;