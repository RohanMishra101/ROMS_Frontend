import React, { useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
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
  { key: "30days", label: "Last 30 Days" },
  { key: "6months", label: "Last 6 Months" },
  { key: "1year", label: "Last 1 Year" },
];

const RevenueCard = ({ data = {}, onRefresh }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("30days");

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
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${Math.round(value)}`;
  };

  const processedDailyData = revenuePerDay.map((day) => ({
    ...day,
    displayValue: formatCurrency(day.revenue),
    shortDate: day.date.split("-")[2],
  }));

  const processedCategoryData = [...revenueByCategory]
    .sort((a, b) => b.revenue - a.revenue)
    .map((cat) => ({ ...cat, displayValue: formatCurrency(cat.revenue) }));

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 w-full">
      {/* Header & Period Selector */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Revenue Analytics</h1>
          <p className="text-md text-gray-500 mt-1">
            Performance Overview • {periods.find((p) => p.key === selectedPeriod)?.label}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setSelectedPeriod(p.key)}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${selectedPeriod === p.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={onRefresh}
            className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-all"
            aria-label="Refresh data"
          >
            <FiRefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subValue={`${trend === "up" ? "▲" : "▼"} ${change}`}
          icon={<span className="text-4xl">💰</span>}
          accentColor="bg-blue-100 text-blue-800"
          trend={trend}
        />
        <MetricCard
          title="Daily Average"
          value={formatCurrency(avgDailyRevenue)}
          icon={<span className="text-4xl">📈</span>}
          accentColor="bg-green-100 text-green-800"
        />
        <MetricCard
          title="Peak Hour"
          value={peakHour ? `${peakHour}:00` : "--:--"}
          subValue={`Revenue: ${formatCurrency(peakHourRevenue)}`}
          icon={<span className="text-4xl">⏰</span>}
          accentColor="bg-purple-100 text-purple-800"
        />
        <MetricCard
          title="Top Category"
          value={revenueByCategory[0]?.category || "N/A"}
          subValue={revenueByCategory[0]?.displayValue || ""}
          icon={<span className="text-4xl">🏆</span>}
          accentColor="bg-amber-100 text-amber-800"
        />
      </div>


      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Daily Revenue */}
        <ChartContainer title="Daily Revenue Trend" value={formatCurrency(totalRevenue)}>
          {processedDailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={processedDailyData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <XAxis
                  dataKey="shortDate"
                  tick={{ fontSize: 12, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  // interval={Math.ceil(processedDailyData.length / 10)}
                  interval={0}
                />
                <YAxis
                  width={80}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), "Revenue"]}
                  labelFormatter={(label) => `Day ${label}`}
                  contentStyle={{
                    fontSize: 14,
                    borderRadius: "8px",
                    padding: "10px",
                    border: "none",
                    boxShadow: "0 2px 15px rgba(0,0,0,0.1)",
                    fontWeight: 500,
                  }}
                />
                <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]} barSize={50}>
                  {processedDailyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <LabelList dataKey="displayValue" position="top" fontSize={12} fontWeight={600} fill="#374151" offset={10} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartContainer>

        {/* Category Revenue */}
        <ChartContainer title="Revenue by Category" value={`${revenueByCategory.length} Categories`}>
          {processedCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={processedCategoryData}
                layout="vertical"
                margin={{ top: 10, right: 40, left: 20, bottom: 10 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={100}
                  tick={{ fontSize: 12, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), "Revenue"]}
                  labelFormatter={(label) => label}
                  contentStyle={{
                    fontSize: 14,
                    borderRadius: "8px",
                    padding: "10px",
                    border: "none",
                    boxShadow: "0 2px 15px rgba(0,0,0,0.1)",
                    fontWeight: 500,
                  }}
                />
                <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]} barSize={50}>
                  {processedCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <LabelList
                    dataKey="displayValue"
                    position="right"
                    fontSize={12}
                    fontWeight={600}
                    fill="#374151"
                    offset={10}
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

// Metric Card
const MetricCard = ({ title, value, subValue, icon, trend, accentColor }) => {
  const trendColor = trend === "up" ? "text-green-600" : "text-red-600";
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {subValue && <p className={`text-md mt-1 ${trend ? trendColor : "text-gray-600"}`}>{subValue}</p>}
        </div>
        {icon && <span className="text-2xl p-3 rounded-lg bg-opacity-20 ml-2">{icon}</span>}
      </div>
    </div>
  );
};

// Chart Container
const ChartContainer = ({ title, value, children }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {value && <span className="text-md font-medium text-gray-500">{value}</span>}
    </div>
    {children}
  </div>
);

// Empty State
const EmptyState = () => (
  <div className="h-64 flex flex-col items-center justify-center">
    <div className="text-5xl mb-4">📊</div>
    <p className="text-lg text-gray-500 font-medium">No data available</p>
    <p className="text-sm text-gray-400 mt-1">Try refreshing or check back later</p>
  </div>
);

export default RevenueCard;
